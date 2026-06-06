const express = require('express');
const router = express.Router();
const { Donation } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    // Only use Razorpay if keys are configured
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      const order = await razorpay.orders.create({
        amount: amount * 100, // paise
        currency,
        receipt: `receipt_${Date.now()}`
      });
      return res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
    }
    
    // Mock for development
    res.json({
      success: true,
      order: { id: `order_${Date.now()}`, amount: amount * 100, currency },
      key: 'rzp_test_demo'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify and save donation
router.post('/verify', async (req, res) => {
  try {
    const { donorName, email, phone, amount, purpose, message, paymentId, orderId, isAnonymous, panNumber, country, offeringType, donationCategory } = req.body;
    const donation = await Donation.create({
      donorName, email, phone, amount, purpose, message,
      paymentId, orderId, isAnonymous, panNumber,
      country, offeringType, donationCategory,
      status: 'completed'
    });
    res.status(201).json({ success: true, data: donation, message: 'Donation recorded. Thank you for your generous support!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    const total = donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0);
    res.json({ success: true, data: donations, totalAmount: total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
