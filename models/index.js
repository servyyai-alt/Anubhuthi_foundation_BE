const mongoose = require('mongoose');
const Program = require('./Program');

// Event Model
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  shortDescription: String,
  type: { type: String, enum: ['satsang', 'workshop', 'seminar', 'retreat', 'ceremony', 'online', 'other'], default: 'other' },
  startDate: { type: Date, required: true },
  endDate: Date,
  time: String,
  location: String,
  isOnline: { type: Boolean, default: false },
  meetingLink: String,
  image: String,
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: true },
  maxParticipants: Number,
  registeredCount: { type: Number, default: 0 },
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Retreat Model
const retreatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  region: { type: String, enum: ['himalaya', 'rishikesh', 'kedarnath', 'gangotri', 'badrinath', 'other'], default: 'other' },
  description: String,
  shortDescription: String,
  duration: String,
  startDate: Date,
  endDate: Date,
  price: Number,
  currency: { type: String, default: 'INR' },
  includes: [String],
  excludes: [String],
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    activities: [String]
  }],
  image: String,
  gallery: [String],
  maxParticipants: Number,
  currentParticipants: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'moderate' },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Career Model
const careerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: String,
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'volunteer'], default: 'full-time' },
  location: String,
  isRemote: { type: Boolean, default: false },
  description: String,
  responsibilities: [String],
  requirements: [String],
  skills: [String],
  salary: String,
  benefits: [String],
  applicationDeadline: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Testimonial Model
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: String,
  organization: String,
  location: String,
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  image: String,
  program: String,
  isApproved: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isUserSubmitted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Contact Model
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: String,
  message: { type: String, required: true },
  type: { type: String, enum: ['general', 'programs', 'retreats', 'volunteer', 'media', 'other'], default: 'general' },
  status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
  reply: String,
  createdAt: { type: Date, default: Date.now }
});

// Donation Model
const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  purpose: {
    type: String,
    enum: ['general', 'temple-restoration', 'retreat-scholarship', 'programs', 'community', 'himalayan-mission'],
    default: 'general'
  },
  country: String,
  offeringType: String,
  donationCategory: String,
  message: String,
  paymentId: String,
  orderId: String,
  paymentMethod: String,
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  isAnonymous: { type: Boolean, default: false },
  taxReceipt: { type: Boolean, default: false },
  panNumber: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

// Volunteer Model
const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  age: Number,
  dob: { type: Date },
  gender: { type: String },
  city: String,
  country: String,
  education: String,
  occupation: String,
  skills: [String],
  availability: String,
  experience: String,
  motivation: String,
  areas: [String],
  type: { type: String, enum: ['volunteer', 'intern'], default: 'volunteer' },
  status: { type: String, enum: ['pending', 'reviewing', 'accepted', 'rejected'], default: 'pending' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

// Career Application Model
const applicationSchema = new mongoose.Schema({
  career: { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  coverLetter: String,
  resumeUrl: String,
  linkedIn: String,
  portfolio: String,
  experience: String,
  status: { type: String, enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'], default: 'pending' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

// Media Model
const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'article', 'podcast', 'gallery', 'document'], required: true },
  description: String,
  url: String,
  embedCode: String,
  thumbnail: String,
  gallery: [String],
  tags: [String],
  category: String,
  publishDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Program,
  Event: mongoose.model('Event', eventSchema),
  Retreat: mongoose.model('Retreat', retreatSchema),
  Career: mongoose.model('Career', careerSchema),
  Testimonial: mongoose.model('Testimonial', testimonialSchema),
  Contact: mongoose.model('Contact', contactSchema),
  Donation: mongoose.model('Donation', donationSchema),
  Volunteer: mongoose.model('Volunteer', volunteerSchema),
  Application: mongoose.model('Application', applicationSchema),
  Media: mongoose.model('Media', mediaSchema)
};
