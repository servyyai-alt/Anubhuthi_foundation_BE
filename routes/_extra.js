const express = require('express');
const mediaRouter = express.Router();
const analyticsRouter = express.Router();
const { Media, Donation, Contact, Volunteer, Program, Event } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

// Media routes
mediaRouter.get('/', async (req, res) => {
  try {
    const { type, featured } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (featured) query.isFeatured = true;
    const media = await Media.find(query).sort({ isFeatured: -1, publishDate: -1 });
    res.json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
