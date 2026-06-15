// config/db.js

const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,

  dialectOptions: {
    ssl: isProduction
      ? {
          require: true,
          rejectUnauthorized: false,
        }
      : false, // 👈 مهم جداً للمحلي
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
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected');

    if (process.env.NODE_ENV === 'production') {
      console.log('Production mode: skipping sync(). Run migrations manually.');
    } else {
      await sequelize.sync({ alter: true });
      console.log('📦 Database synced (development mode).');
    }
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:');
    console.error(error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
  DataTypes,
};