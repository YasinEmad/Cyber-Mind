/**
 * Script to set a user as admin by their email
 * Usage: node setAdminByEmail.js <email>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

async function setAdminByEmail(email) {
  try {
    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email "${email}" not found`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✓ User "${email}" has been set as admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as argument');
  console.error('Usage: node setAdminByEmail.js <email>');
  process.exit(1);
}

setAdminByEmail(email);
