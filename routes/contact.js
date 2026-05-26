const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { Contact } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

router.post('/', async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    
    // Send confirmation to user
    await sendEmail(req.body.email, 'We received your message - Anubhuthi Foundation', `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #fafaf8;">
        <h1 style="color: #8B5E3C; font-size: 28px;">Namaste, ${req.body.name} 🙏</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.8;">
          Thank you for reaching out to the Anubhuthi Foundation. We have received your message and our team will get back to you within 2-3 business days.
        </p>
        <div style="background: #f5f0e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <strong>Your message:</strong>
          <p style="color: #333;">${req.body.message}</p>
        </div>
        <p style="color: #888; font-size: 14px;">
          With love and light,<br/>
          <strong>Team Anubhuthi Foundation</strong>
        </p>
      </div>
    `);

    // Notify admin
    if (process.env.EMAIL_USER) {
      await sendEmail(process.env.EMAIL_USER, `New Contact: ${req.body.subject || 'General'}`, `
        <p>New contact from <strong>${req.body.name}</strong> (${req.body.email})</p>
        <p><strong>Message:</strong> ${req.body.message}</p>
      `);
    }

    res.status(201).json({ success: true, message: 'Message sent successfully', data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
