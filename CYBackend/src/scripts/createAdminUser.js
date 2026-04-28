require('dotenv').config();
const { connectDB } = require('../config/db');
const { User } = require('../models');

async function createAdmin(email, name = 'Admin User') {
  try {
    await connectDB();

    // Try find existing user
    let user = await User.findOne({ where: { email } });
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`✓ Existing user ${email} updated to admin`);
      process.exit(0);
    }

    // Create a new user record
    user = await User.create({
      uid: `local:${Date.now()}`,
      email,
      name,
      role: 'admin',
    });

    console.log(`✓ Created new admin user: ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

const email = process.argv[2];
const name = process.argv[3] || 'Admin User';
if (!email) {
  console.error('Usage: node createAdminUser.js <email> [name]');
  process.exit(1);
}

createAdmin(email, name);
