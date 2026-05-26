const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/programs - Public
router.get('/', async (req, res) => {
  try {
    const { category, level, featured, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (level) query.level = level;
    if (featured) query.isFeatured = true;
    const programs = await Program.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Program.countDocuments(query);
    res.json({ success: true, data: programs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/programs/:id
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
    res.json({ success: true, data: program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/programs - Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const program = await Program.create(req.body);
    res.status(201).json({ success: true, data: program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/programs/:id - Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
    res.json({ success: true, data: program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/programs/:id - Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
