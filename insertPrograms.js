const mongoose = require('mongoose');
const { ensureDatabaseConnected } = require('./utils/database');
const Program = require('./models/Program');
require('dotenv').config();

const programsToAdd = [
  {
    title: 'Natural Intelligence Foundation Program',
    category: 'meditation',
    description: 'This foundation program introduces participants to the innate intelligence of nature and how it relates to our own inner awakening.',
    shortDescription: 'Connect with nature\'s intelligence to awaken your true self.',
    duration: '4 Weeks',
    level: 'beginner',
    price: 0,
    isFree: true,
    image: '/programs/Natural Intelligence Foundation Program.png',
    isOnline: false,
    location: 'Coimbatore',
    isActive: true,
    isFeatured: true
  },
  {
    title: 'Conscious Relationship Program',
    category: 'healing',
    description: 'A transformative journey to heal past wounds, build deeper connections, and foster conscious relationships with yourself and others.',
    shortDescription: 'Build deeper, more conscious connections in your life.',
    duration: '6 Weeks',
    level: 'all',
    price: 0,
    isFree: true,
    image: '/programs/Conscious Relationship Program.png',
    isOnline: true,
    location: 'Online',
    isActive: true,
    isFeatured: true
  },
  {
    title: 'Conscious Parenting Program',
    category: 'workshop',
    description: 'Learn the art of conscious parenting, nurturing your children with awareness, love, and mindfulness to help them reach their true potential.',
    shortDescription: 'Nurture your children with awareness and love.',
    duration: '8 Weeks',
    level: 'all',
    price: 0,
    isFree: true,
    image: '/programs/Conscious Parenting Program.png',
    isOnline: true,
    location: 'Online',
    isActive: true,
    isFeatured: true
  },
  {
    title: 'Conscious Living Program',
    category: 'retreat',
    description: 'Immerse yourself in conscious living practices. From mindful eating to daily meditation, this program covers all aspects of an awakened lifestyle.',
    shortDescription: 'Embrace an awakened lifestyle through conscious daily practices.',
    duration: '12 Weeks',
    level: 'all',
    price: 0,
    isFree: true,
    image: '/programs/Conscious Living Program.png',
    isOnline: false,
    location: 'Anubhuthi Ashram',
    isActive: true,
    isFeatured: true
  }
];

async function insertPrograms() {
  try {
    await ensureDatabaseConnected();
    console.log('Connected to DB');

    for (const p of programsToAdd) {
      // Check if it already exists
      const exists = await Program.findOne({ title: p.title });
      if (!exists) {
        const newProgram = new Program(p);
        await newProgram.save();
        console.log(`Inserted: ${p.title}`);
      } else {
        console.log(`Already exists: ${p.title}`);
      }
    }

    console.log('All done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

insertPrograms();
