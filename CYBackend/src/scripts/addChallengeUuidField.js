require('dotenv').config();
const { sequelize } = require('../config/db');
const { Challenge } = require('../models');

async function addChallengeUuidField() {
  try {
    console.log('Syncing Challenge model to add uuid field...');

    await sequelize.authenticate();
    console.log('Database connected successfully');

    await Challenge.sync({ alter: true });

    console.log('Challenge model synced successfully. UUID field should now exist.');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error syncing Challenge model:', error);
    process.exit(1);
  }
}

addChallengeUuidField();