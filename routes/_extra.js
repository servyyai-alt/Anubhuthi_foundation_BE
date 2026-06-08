const express = require('express');
const mediaRouter = express.Router();
const analyticsRouter = express.Router();
const multer = require('multer');
const { Media, Donation, Contact, Volunteer, Program, Event } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadImageBuffer } = require('../utils/cloudinary');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith('image/') || file.mimetype?.startsWith('video/') || file.mimetype?.startsWith('audio/') || file.mimetype === 'application/pdf') {
      return cb(null, true);
    }

    return cb(new Error('Only image, video, audio, or PDF files are allowed.'));
  }
});

// Media routes
mediaRouter.get('/', async (req, res) => {
  try {
    const { type, featured, limit } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (featured) query.isFeatured = true;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 0, 0), 50);
    const mediaQuery = Media.find(query).sort({ isFeatured: -1, publishDate: -1 });
    if (parsedLimit) mediaQuery.limit(parsedLimit);

    const media = await mediaQuery;
    res.json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const media = await Media.find().sort({ isFeatured: -1, publishDate: -1, createdAt: -1 });
    res.json({ success: true, data: media, total: media.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.post('/upload-image', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image to upload.' });
    }

    const result = await uploadImageBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.post('/upload-images', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'Please select at least one image to upload.' });
    }

    const uploads = await Promise.all(
      req.files.map((file) => uploadImageBuffer(file.buffer, file.originalname, file.mimetype))
    );

    return res.status(201).json({ success: true, data: uploads });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.post('/', protect, adminOnly, async (req, res) => {
  try {
    const media = await Media.create(req.body);
    res.status(201).json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Analytics routes
analyticsRouter.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const [programs, events, donations, contacts, volunteers] = await Promise.all([
      Program.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true }),
      Donation.find({ status: 'completed' }),
      Contact.countDocuments(),
      Volunteer.countDocuments()
    ]);
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const donationsByPurpose = donations.reduce((acc, d) => {
      acc[d.purpose] = (acc[d.purpose] || 0) + d.amount;
      return acc;
    }, {});
    
    // Monthly donations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyDonations = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        programs, events, contacts, volunteers,
        totalDonations,
        donationCount: donations.length,
        donationsByPurpose,
        monthlyDonations
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { mediaRouter, analyticsRouter };
