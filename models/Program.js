const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  category: {
    type: String,
    enum: ['meditation', 'yoga', 'healing', 'training', 'certification', 'workshop', 'retreat'],
    required: true
  },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 300 },
  duration: String,
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'], default: 'all' },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  isFree: { type: Boolean, default: false },
  image: String,
  highlights: [String],
  curriculum: [{
    week: Number,
    topic: String,
    description: String
  }],
  instructor: {
    name: String,
    bio: String,
    image: String
  },
  startDate: Date,
  endDate: Date,
  schedule: String,
  maxParticipants: Number,
  currentParticipants: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  location: String,
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

programSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Program', programSchema);
