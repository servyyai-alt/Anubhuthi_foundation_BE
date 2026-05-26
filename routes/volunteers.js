const express = require('express');
const router = express.Router();
const { Volunteer } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const volunteer = await Volunteer.create(req.body);
    res.status(201).json({ success: true, data: volunteer, message: 'Application submitted successfully! We will contact you soon.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    const volunteers = await Volunteer.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: volunteers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const v = await Volunteer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: v });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
