const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { ensureDatabaseConnected } = require('./utils/database');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Anubhuthi Foundation API is running' });
});

// Ensure serverless cold starts wait for MongoDB before DB-backed routes run.
app.use('/api', async (req, res, next) => {
  try {
    await ensureDatabaseConnected();
    next();
  } catch (err) {
    res.status(err.status || 503).json({
      success: false,
      message: err.status ? err.message : 'Database connection failed.'
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/programs', require('./routes/programs'));
app.use('/api/events', require('./routes/events'));
app.use('/api/retreats', require('./routes/retreats'));
app.use('/api/careers', require('./routes/careers'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/media', require('./routes/media'));
app.use('/api/analytics', require('./routes/analytics'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  ensureDatabaseConnected()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}

module.exports = app;
