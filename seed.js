/**
 * Seed script: populates MongoDB with sample data for development.
 * Run: node backend/seed.js
 */

require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

const User = require('./models/User');
const Program = require('./models/Program');
const { Event, Retreat, Career, Testimonial, Media } = require('./models/index');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anubhuthi';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Program.deleteMany({}),
    Event.deleteMany({}),
    Retreat.deleteMany({}),
    Career.deleteMany({}),
    Testimonial.deleteMany({}),
    Media.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing data');

  // ─── Admin User ─────────────────────────────────────────────────────────────
  await User.create({
    name: 'Super Admin',
    email: 'admin@anubhuthi.org',
    password: 'Admin@1234',
    role: 'superadmin',
  });
  console.log('👤 Admin created: admin@anubhuthi.org / Admin@1234');

  // ─── Programs ───────────────────────────────────────────────────────────────
  await Program.insertMany([
    {
      title: 'Foundations of Vipassana Meditation',
      slug: 'foundations-vipassana',
      category: 'meditation',
      shortDescription: 'A 10-day introduction to the ancient art of insight meditation in the Theravada tradition.',
      description: 'Vipassana, meaning insight into the true nature of reality, is one of the most ancient meditation techniques. In this 10-day immersive program, students learn the foundational practices of breath awareness (Anapana) and body-scanning (Vipassana), guided by experienced teachers in a supportive residential setting. No prior experience required.',
      duration: '10 Days',
      level: 'beginner',
      price: 0,
      isFree: true,
      highlights: ['Noble Silence period', 'Anapana & Vipassana techniques', 'Daily dharma talks', 'Individual teacher interviews', 'Satvic meals included'],
      isActive: true,
      isFeatured: true,
      location: 'Rishikesh Ashram',
    },
    {
      title: 'Advanced Pranayama & Kriya Yoga',
      slug: 'advanced-pranayama-kriya',
      category: 'yoga',
      shortDescription: 'Master the science of breath as the bridge between body, mind, and soul.',
      description: 'This intensive 5-day residential program systematically covers all eight classical pranayama practices, Kriya Yoga techniques as taught by Paramahamsa Yogananda, bandha and mudra integration, and the deeper philosophy of prana as described in the Upanishads.',
      duration: '5 Days',
      level: 'intermediate',
      price: 12500,
      highlights: ['8 classical pranayamas', 'Kriya initiation ceremony', 'Bandha & mudra practice', 'Upanishadic philosophy', 'Certificate of completion'],
      isActive: true,
      isFeatured: true,
      location: 'Rishikesh Ashram',
    },
    {
      title: 'DNI Teacher Certification Program',
      slug: 'dni-teacher-certification',
      category: 'certification',
      shortDescription: '300-hour certification in Vedic philosophy, meditation facilitation, and conscious leadership.',
      description: 'The DNI Teacher Certification is our flagship offering — a rigorous, transformative 6-month program that prepares sincere seekers to teach meditation, yoga philosophy, and conscious leadership in any context. Curriculum covers Upanishads, Yoga Sutras, Bhagavad Gita, experiential meditation practices, teaching methodology, and practicum hours.',
      duration: '6 Months (300 Hours)',
      level: 'advanced',
      price: 85000,
      highlights: ['300-hour syllabus', 'Live & recorded sessions', 'Weekly mentor calls', 'Practicum hours', 'International certification', 'Lifetime alumni community'],
      isActive: true,
      isFeatured: true,
      location: 'Hybrid (Online + Residential)',
    },
    {
      title: 'Sound Healing & Nada Yoga',
      slug: 'sound-healing-nada-yoga',
      category: 'healing',
      shortDescription: 'Experience the transformative power of sacred sound through Tibetan bowls, mantra, and nada yoga.',
      description: 'An immersive 3-day journey into the science and art of sound as medicine. Learn to work with Tibetan singing bowls, crystal bowls, mantra, and nada yoga (the yoga of sound) for healing self and others. Understand the physics of resonance and why certain frequencies profoundly affect human consciousness.',
      duration: '3 Days',
      level: 'all',
      price: 9500,
      isActive: true,
      isFeatured: false,
    },
    {
      title: 'Vedanta Study Circle — Monthly',
      slug: 'vedanta-study-circle',
      category: 'workshop',
      shortDescription: 'Monthly deep-dive satsangs on Advaita Vedanta texts with scholarly commentary.',
      description: 'Join our monthly virtual Vedanta study circle where we explore classic texts — currently the Vivekachudamani by Adi Shankaracharya. Sessions include chanting, textual study, discussion, and Q&A.',
      duration: 'Monthly (3 Hours)',
      level: 'all',
      price: 500,
      isActive: true,
      isFeatured: false,
      isOnline: true,
    },
    {
      title: 'Himalayan Healing Arts Retreat',
      slug: 'himalayan-healing-arts',
      category: 'retreat',
      shortDescription: 'A 7-day immersion in Ayurveda, yoga, and traditional Himalayan healing practices.',
      description: 'Nestled in the Himalayan foothills, this 7-day retreat integrates Ayurvedic principles, classical yoga, pranayama, meditation, and traditional healing arts. Daily schedule includes early morning yoga, Ayurvedic meals, herbal walks, afternoon healing sessions, and evening satsangs under the stars.',
      duration: '7 Days',
      level: 'all',
      price: 35000,
      isActive: true,
      isFeatured: true,
    },
  ]);
  console.log('📿 Programs seeded');

  // ─── Events ─────────────────────────────────────────────────────────────────
  const now = new Date();
  await Event.insertMany([
    {
      title: 'Mahashivaratri Satsang & Abhisheka',
      type: 'ceremony',
      shortDescription: 'An all-night vigil of chanting, meditation, and Shiva abhisheka at our Rishikesh ashram.',
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 13),
      time: '8:00 PM – 6:00 AM',
      location: 'Anubhuthi Ashram, Rishikesh',
      isFree: true,
      maxParticipants: 200,
      isActive: true,
      isFeatured: true,
    },
    {
      title: 'Online Meditation for Beginners — 4-Week Course',
      type: 'online',
      shortDescription: 'Live online meditation course for absolute beginners. Sundays 7–8 AM IST.',
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 2),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 2),
      time: '7:00 AM – 8:00 AM IST',
      isOnline: true,
      meetingLink: 'https://zoom.us/j/example',
      isFree: false,
      price: 1200,
      maxParticipants: 50,
      isActive: true,
      isFeatured: true,
    },
    {
      title: 'Vedic Chanting Workshop',
      type: 'workshop',
      shortDescription: 'Learn the correct pronunciation and meaning of 12 essential Vedic mantras.',
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 18),
      time: '10:00 AM – 4:00 PM',
      location: 'Anubhuthi Ashram, Rishikesh',
      isFree: false,
      price: 2500,
      maxParticipants: 30,
      isActive: true,
      isFeatured: false,
    },
    {
      title: 'Monthly Guru Purnima Celebration',
      type: 'ceremony',
      shortDescription: 'A sacred gathering to honour the lineage of Gurus who have preserved the Vedic tradition.',
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 21),
      time: '6:00 PM – 9:00 PM',
      location: 'Anubhuthi Ashram, Rishikesh',
      isFree: true,
      isActive: true,
      isFeatured: false,
    },
    {
      title: 'Yoga Nidra Immersion',
      type: 'workshop',
      shortDescription: 'A full-day immersion in the science of Yoga Nidra (yogic sleep) for deep healing.',
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 25),
      time: '9:00 AM – 5:00 PM',
      location: 'Anubhuthi Ashram, Rishikesh',
      isFree: false,
      price: 3500,
      maxParticipants: 25,
      isActive: true,
      isFeatured: false,
    },
  ]);
  console.log('📅 Events seeded');

  // ─── Retreats ────────────────────────────────────────────────────────────────
  await Retreat.insertMany([
    {
      title: 'Kedarnath Sacred Pilgrimage',
      location: 'Kedarnath, Uttarakhand',
      region: 'kedarnath',
      shortDescription: 'A transformative 7-day journey to one of India's most powerful Jyotirlingas at 3,583m altitude.',
      description: 'Kedarnath is not merely a temple — it is a living portal of Shiva consciousness that has drawn realized masters for millennia. Our 7-day pilgrimage is carefully designed to prepare body, mind, and soul for this encounter. We travel together, chant together, and meditate in the shadow of the great lingam.',
      duration: '7 Days / 6 Nights',
      price: 28500,
      includes: ['Transportation from Haridwar', 'Accommodation (twin sharing)', 'All Satvic meals', 'Guide & spiritual leader', 'Puja materials', 'Emergency medical kit'],
      excludes: ['Flights to Dehradun/Haridwar', 'Personal expenses', 'Travel insurance'],
      itinerary: [
        { day: 1, title: 'Haridwar Arrival & Ganga Aarti', description: 'Gather at Haridwar, orientation, attend the magnificent Ganga Aarti at Har Ki Pauri' },
        { day: 2, title: 'Haridwar to Sonprayag', description: 'Drive through scenic Himalayan roads, meditation at Triyuginarayan temple' },
        { day: 3, title: 'Trek to Kedarnath', description: '16km sacred trek through forests and mountains, arrival at Kedarnath' },
        { day: 4, title: 'Kedarnath Darshan & Meditation', description: 'Full day at Kedarnath — early morning special puja, darshan, solo meditation time' },
        { day: 5, title: 'Return Trek & Ukhimath', description: 'Trek down, visit Ukhimath (winter home of Kedarnath Lingam), satsang' },
        { day: 6, title: 'Rishikesh Arrival', description: 'Drive to Rishikesh, evening Ganga meditation, integration circle' },
        { day: 7, title: 'Closing Ceremony & Departure', description: 'Morning ceremony, group sharing, blessings, departure' },
      ],
      maxParticipants: 18,
      difficulty: 'moderate',
      isActive: true,
      isFeatured: true,
    },
    {
      title: 'Gangotri & Gaumukh Glacier Trek',
      location: 'Gangotri, Uttarakhand',
      region: 'gangotri',
      shortDescription: 'Trek to the source of the sacred Ganga, the Gaumukh glacier, with meditation at 4,200m.',
      description: 'Gangotri is where the sacred Ganga emerges from the mouth of the Gaumukh glacier. This 8-day expedition combines demanding high-altitude trekking with deep spiritual practice. We will meditate at the source of one of the world\'s great sacred rivers.',
      duration: '8 Days / 7 Nights',
      price: 35000,
      includes: ['Transportation', 'Camping equipment', 'All meals', 'Experienced guide', 'Trekking permits', 'Spiritual leadership'],
      difficulty: 'challenging',
      maxParticipants: 12,
      isActive: true,
      isFeatured: true,
    },
    {
      title: 'Rishikesh Yoga & Meditation Immersion',
      location: 'Rishikesh, Uttarakhand',
      region: 'rishikesh',
      shortDescription: 'A 5-day ashram-style immersion in yoga, meditation, and Vedic philosophy in the yoga capital of the world.',
      description: 'Rishikesh sits where the Ganga emerges from the Himalayas and has served as a spiritual refuge for millennia. This 5-day residential program gives participants a taste of ashram life — early morning sadhana, yoga, pranayama, meditation, scripture study, and the transformative atmosphere of the Himalayan foothills.',
      duration: '5 Days / 4 Nights',
      price: 18500,
      includes: ['Ashram accommodation', 'Satvic meals', 'All program sessions', 'Ganga Aarti participation'],
      difficulty: 'easy',
      maxParticipants: 25,
      isActive: true,
      isFeatured: false,
    },
    {
      title: 'Badrinath Yatra — Char Dham',
      location: 'Badrinath, Uttarakhand',
      region: 'badrinath',
      shortDescription: 'Sacred pilgrimage to Badrinath Dham, home of Lord Vishnu, in the heart of the Himalayas.',
      description: 'Badrinath is one of the Char Dhams and among the most sacred pilgrimage sites in India, situated at 3,300m between the Nar and Narayan mountain ranges. This 6-day journey is as much an inner pilgrimage as an outer one.',
      duration: '6 Days / 5 Nights',
      price: 24500,
      difficulty: 'moderate',
      maxParticipants: 20,
      isActive: true,
      isFeatured: false,
    },
  ]);
  console.log('🏔️  Retreats seeded');

  // ─── Careers ─────────────────────────────────────────────────────────────────
  await Career.insertMany([
    {
      title: 'Meditation Program Coordinator',
      department: 'Programs',
      type: 'full-time',
      location: 'Rishikesh',
      isRemote: false,
      description: 'Lead the coordination and delivery of our meditation and yoga programs, ensuring world-class participant experience.',
      responsibilities: [
        'Coordinate logistics for all residential programs and retreats',
        'Liaise with teachers, facilitators, and visiting faculty',
        'Manage participant registration and communication',
        'Ensure smooth daily operations at the ashram',
        'Develop and improve program curricula with the academic team',
      ],
      requirements: [
        'Sincere meditation practitioner with minimum 3 years of practice',
        'Experience in event or program management',
        'Excellent communication skills in English and Hindi',
        'Ability to thrive in an ashram environment',
        'Willingness to live on-campus at the ashram',
      ],
      salary: '₹25,000 – ₹35,000/month + accommodation',
      benefits: ['Free meals at ashram', 'Access to all programs', 'Annual retreat', 'Growth into leadership'],
      isActive: true,
    },
    {
      title: 'Digital Marketing & Content Specialist',
      department: 'Communications',
      type: 'full-time',
      location: 'Rishikesh / Remote',
      isRemote: true,
      description: 'Drive Anubhuthi Foundation\'s digital presence and tell our story to the world through compelling content.',
      responsibilities: [
        'Manage all social media channels (Instagram, YouTube, Facebook)',
        'Create written and video content for programs, retreats, and events',
        'Run email marketing campaigns and newsletters',
        'Manage the website content and blog',
        'Track and report on digital analytics',
      ],
      requirements: [
        'Proven experience in digital marketing and content creation',
        'Strong writing skills in English',
        'Video editing proficiency (Premiere Pro or equivalent)',
        'Personal interest in spirituality, yoga, or wellness',
        'SEO and email marketing knowledge',
      ],
      salary: '₹30,000 – ₹45,000/month',
      isActive: true,
    },
    {
      title: 'Himalayan Retreat Guide & Leader',
      department: 'Retreats',
      type: 'contract',
      location: 'Himalayas (Seasonal)',
      isRemote: false,
      description: 'Lead participants on our transformative Himalayan pilgrimages and retreat programs as a trained guide and spiritual facilitator.',
      responsibilities: [
        'Lead groups on Himalayan pilgrimage routes safely',
        'Facilitate morning meditation and evening satsangs',
        'Manage logistics and emergency situations in the field',
        'Maintain relationships with local communities and temple authorities',
      ],
      requirements: [
        'Minimum 5 years of Himalayan trekking experience',
        'Wilderness first aid certification',
        'Deep personal spiritual practice',
        'Strong leadership and group facilitation skills',
      ],
      salary: '₹2,500 – ₹4,000/day',
      isActive: true,
    },
    {
      title: 'Full Stack Developer (React + Node.js)',
      department: 'Technology',
      type: 'part-time',
      location: 'Remote',
      isRemote: true,
      description: 'Maintain and enhance our digital infrastructure, website, and online learning platform.',
      requirements: [
        'Proficient in React.js and Node.js',
        'MongoDB experience',
        'REST API development',
        'Enthusiasm for contributing to meaningful causes',
      ],
      salary: '₹800 – ₹1,200/hour',
      isActive: true,
    },
  ]);
  console.log('💼 Careers seeded');

  // ─── Testimonials ─────────────────────────────────────────────────────────────
  await Testimonial.insertMany([
    {
      name: 'Priya Sharma',
      designation: 'Software Engineer',
      location: 'Bangalore, India',
      program: 'Foundations of Vipassana Meditation',
      content: 'The 10-day Vipassana retreat at Anubhuthi changed everything for me. I came as a skeptic and left as a practitioner. The silence was terrifying at first, and then completely liberating. My relationship with my own mind has never been the same.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
    },
    {
      name: 'Arjun Mehta',
      designation: 'Entrepreneur & Founder',
      location: 'Mumbai, India',
      program: 'DNI Teacher Certification',
      content: 'The DNI Certification program gave me not just tools but a completely different understanding of what leadership means. I now lead my company from a place of presence rather than reactivity. The ROI on this program has been incalculable.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
    },
    {
      name: 'Sunita Rao',
      designation: 'School Principal',
      location: 'Hyderabad, India',
      program: 'Kedarnath Sacred Pilgrimage',
      content: 'I\'ve been to Kedarnath before as a tourist. Going with Anubhuthi was an entirely different experience. The preparation, the practices along the way, the meditations inside the temple — I felt I truly met Shiva, not just visited a building.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
    },
    {
      name: 'Dr. Rahul Gupta',
      designation: 'Cardiologist',
      location: 'Delhi, India',
      program: 'Advanced Pranayama & Kriya Yoga',
      content: 'As a doctor, I came with a scientific lens. What I found was that the pranayama techniques have profound measurable effects on the autonomic nervous system. I now prescribe breathing practices to my cardiac patients.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
    },
    {
      name: 'Maria Santos',
      designation: 'Yoga Teacher',
      location: 'Lisbon, Portugal',
      program: 'Rishikesh Yoga & Meditation Immersion',
      content: 'I came from Portugal specifically to study with the Anubhuthi team. The depth of knowledge, the authenticity of the practice, and the love with which everything is held — I have not experienced this quality anywhere else in the world.',
      rating: 5,
      isApproved: true,
      isFeatured: false,
    },
    {
      name: 'Kavitha Nair',
      designation: 'HR Manager',
      location: 'Kochi, India',
      program: 'Sound Healing & Nada Yoga',
      content: 'I attended the Sound Healing workshop without knowing what to expect. By the end, I had experienced something I can only call grace. The facilitators held such a safe and sacred space. I returned to my life feeling genuinely renewed.',
      rating: 5,
      isApproved: true,
      isFeatured: false,
    },
  ]);
  console.log('💬 Testimonials seeded');

  // ─── Media ───────────────────────────────────────────────────────────────────
  await Media.insertMany([
    {
      title: 'What Is Meditation? A Complete Introduction',
      type: 'video',
      description: 'Swami Anubhav explains the true meaning of meditation — not concentration, not visualization, but pure witnessing awareness.',
      url: 'https://www.youtube.com/embed/inpok4MKVLM',
      category: 'Teachings',
      isActive: true,
      isFeatured: true,
    },
    {
      title: 'Kedarnath Yatra 2023 — Film',
      type: 'video',
      description: 'A cinematic journey through our 2023 Kedarnath pilgrimage. Feel the energy of the Himalayas and the power of collective spiritual practice.',
      url: 'https://www.youtube.com/embed/inpok4MKVLM',
      category: 'Retreats',
      isActive: true,
      isFeatured: true,
    },
    {
      title: 'The Science of Consciousness — Article',
      type: 'article',
      description: 'How modern neuroscience is catching up to what the Upanishads described 5,000 years ago about the nature of awareness and the brain.',
      url: '#',
      category: 'Philosophy',
      isActive: true,
      isFeatured: false,
    },
    {
      title: 'Conversations on Consciousness — Episode 1',
      type: 'podcast',
      description: 'An in-depth conversation on the Mandukya Upanishad and the four states of consciousness with Acharya Ramananda.',
      url: '#',
      category: 'Teachings',
      isActive: true,
      isFeatured: false,
    },
    {
      title: 'Why Ancient Temples Are Sacred Science',
      type: 'article',
      description: 'Exploring the Vastu Shastra, sound frequencies, and subtle energy architecture embedded in India\'s ancient temple designs.',
      url: '#',
      category: 'Temple Restoration',
      isActive: true,
      isFeatured: false,
    },
    {
      title: 'Morning Sadhana Guide — Free Download',
      type: 'document',
      description: 'Our complete guide to establishing a morning spiritual practice: pranayama, meditation, chanting, and journaling.',
      url: '#',
      category: 'Resources',
      isActive: true,
      isFeatured: true,
    },
  ]);
  console.log('🎬 Media seeded');

  console.log('\n✅ Seed complete! Login: admin@anubhuthi.org / Admin@1234');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
