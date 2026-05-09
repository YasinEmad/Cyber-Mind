require('dotenv').config();
const { sequelize } = require('../config/db');
const Profile = require('../models/Profile');

const addSolvedCTFLevelsField = async () => {
  try {
    console.log('Starting migration to add solvedCTFLevels field to profiles...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync the profile model to ensure the column exists
    await Profile.sync({ alter: true });
    console.log('✅ Profile model synced');

    // Get all profiles and ensure they have solvedCTFLevels initialized
    const profiles = await Profile.findAll();
    console.log(`Found ${profiles.length} profiles`);
    
    let updated = 0;
    for (const profile of profiles) {
      if (!Array.isArray(profile.solvedCTFLevels)) {
        profile.solvedCTFLevels = [];
        await profile.save();
        updated++;
      }
    }

    console.log(`✅ Migration complete! Updated ${updated} profiles with empty solvedCTFLevels array`);
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

addSolvedCTFLevelsField();
