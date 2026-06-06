const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
const { ensureDatabaseConnected } = require('./utils/database');

async function setupAdmin() {
  try {
    await ensureDatabaseConnected();

    const email = 'admin@anubhuthi.org';
    const password = 'Admin@1234';

    // Check if admin exists
    let admin = await User.findOne({ email });

    if (!admin) {
      // Create new admin
      admin = new User({
        name: 'Super Admin',
        email,
        password,
        role: 'superadmin'
      });
      await admin.save();
      console.log('Admin user created successfully.');
    } else {
      // Update existing admin password
      admin.password = password;
      admin.role = 'superadmin';
      await admin.save();
      console.log('Admin user updated successfully.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error setting up admin:', err);
    process.exit(1);
  }
}

setupAdmin();
