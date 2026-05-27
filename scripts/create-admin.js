require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];

    if (!current.startsWith('--')) continue;

    const key = current.slice(2);
    const next = args[index + 1];

    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
};

const args = parseArgs();
const credentials = {
  name: args.name || process.env.ADMIN_NAME || 'Super Admin',
  email: args.email || process.env.ADMIN_EMAIL || 'admin@anubhuthi.org',
  password: args.password || process.env.ADMIN_PASSWORD || 'Admin@1234',
  role: args.role || process.env.ADMIN_ROLE || 'superadmin',
};

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment.');
  process.exit(1);
}

async function run() {
  await mongoose.connect(mongoUri);

  const existingUser = await User.findOne({ email: credentials.email });

  if (existingUser) {
    if (args['reset-password']) {
      existingUser.name = credentials.name;
      existingUser.role = credentials.role;
      existingUser.password = credentials.password;
      await existingUser.save();

      console.log(`Password reset for ${credentials.email}`);
      console.log(`Role: ${existingUser.role}`);
      return;
    }

    console.log(`User already exists for ${credentials.email}`);
    console.log('Run again with --reset-password to overwrite the password.');
    return;
  }

  const user = await User.create(credentials);

  console.log(`Admin created successfully for ${user.email}`);
  console.log(`Role: ${user.role}`);
}

run()
  .catch((error) => {
    console.error('Failed to create admin:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
