const express = require('express');
const router = express.Router();
const { Event, Retreat, Career, Testimonial, Contact, Donation, Volunteer, Application, Media } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

// Generic CRUD factory
const crudRoutes = (Model, publicFilter = { isActive: true }) => {
  const r = express.Router();

  r.get('/', async (req, res) => {
    try {
      const { featured, page = 1, limit = 20, ...filters } = req.query;
      const query = { ...publicFilter };
      if (featured) query.isFeatured = true;
      Object.keys(filters).forEach(k => { if (filters[k]) query[k] = filters[k]; });
      const data = await Model.find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      const total = await Model.countDocuments(query);
      res.json({ success: true, data, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  r.get('/:id', async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: doc });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  r.post('/', protect, adminOnly, async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  r.put('/:id', protect, adminOnly, async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: doc });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  r.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return r;
};

module.exports = { crudRoutes, Event, Retreat, Career, Testimonial, Contact, Donation, Volunteer, Application, Media };
