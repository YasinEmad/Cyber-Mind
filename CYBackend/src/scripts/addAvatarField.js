require('dotenv').config();
const { sequelize } = require('../config/db');
const { Profile } = require('../models');

async function addAvatarField() {
  try {
    console.log('Syncing Profile model to add avatar field...');

    // Use Sequelize sync with alter: true to add the column
    await Profile.sync({ alter: true });

    console.log('Profile model synced successfully. Avatar field should now exist.');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing Profile model:', error);
    process.exit(1);
  }
}

addAvatarField();