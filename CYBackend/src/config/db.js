// config/db.js

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  retry: {
    max: 3,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');

    const forceSync = process.env.FORCE_DB_SYNC === 'true';

    await sequelize.sync({ force: forceSync });

    console.log(
      'Database synced',
      forceSync ? '(force=true)' : ''
    );

  } catch (error) {
    console.error('PostgreSQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
  DataTypes,
};