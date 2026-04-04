// deleteAllPuzzles.js
const { sequelize } = require('../config/db');
const { Puzzle } = require('../models');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');

    const result = await Puzzle.destroy({ truncate: true });
    console.log(`Deleted all puzzles from the database.`);

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during deleteAllPuzzles:', err.message || err);
    process.exit(1);
  }
};

run();
