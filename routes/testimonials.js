const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    const query = { isApproved: true };
    if (featured) query.isFeatured = true;
    const testimonials = await Testimonial.find(query).sort({ isFeatured: -1, createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const testimonial = await Testimonial.create({ ...req.body, isUserSubmitted: true, isApproved: false });
    res.status(201).json({ success: true, message: 'Testimonial submitted for review', data: testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin', protect, adminOnly, async (req, res) => {
  try {
    const testimonial = await Testimonial.create({ isApproved: true, ...req.body, isUserSubmitted: false });
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
