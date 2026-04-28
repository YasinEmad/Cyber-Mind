// config/db.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/cybermind', {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');

    // Sync all models. Control destructive sync with FORCE_DB_SYNC env var.
    const forceSync = process.env.FORCE_DB_SYNC === 'true';
    await sequelize.sync({ force: forceSync });
    console.log('Database synced', forceSync ? '(force=true)' : '');
  } catch (error) {
    console.error(`PostgreSQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };