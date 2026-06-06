const express = require('express');
const router = express.Router();
const { Career, Application } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, getFileUrl } = require('../utils/fileUpload');

router.get('/', async (req, res) => {
  try {
    const careers = await Career.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: careers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });
    res.json({ success: true, data: careers, total: careers.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all applications for all jobs
router.get('/admin/applications/all', protect, adminOnly, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('career')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: applications, total: applications.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: career });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const career = await Career.create(req.body);
    res.status(201).json({ success: true, data: career });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: career });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Career Applications
router.post('/:id/apply', (req, res, next) => {
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 }
  ])(req, res, function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const appData = {
      career: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : undefined,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      linkedIn: req.body.linkedIn,
      portfolio: req.body.portfolio,
      experience: req.body.experience,
      notes: req.body.notes
    };
    
    if (req.files && req.files.resume && req.files.resume[0]) {
      appData.resumeUrl = getFileUrl(req, req.files.resume[0].filename);
    } else if (req.body.resumeUrl) {
      appData.resumeUrl = req.body.resumeUrl;
    }
    
    if (req.files && req.files.coverLetter && req.files.coverLetter[0]) {
      appData.coverLetter = getFileUrl(req, req.files.coverLetter[0].filename);
    } else if (req.body.coverLetter) {
      appData.coverLetter = req.body.coverLetter;
    }
    
    const application = await Application.create(appData);
    res.status(201).json({ success: true, data: application, message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/applications', protect, adminOnly, async (req, res) => {
  try {
    const applications = await Application.find({ career: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
