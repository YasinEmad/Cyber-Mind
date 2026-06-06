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

    const forceSync = process.env.FORCE_DB_SYNC === 'true';

    await sequelize.sync({ force: forceSync });

    console.log(
      `📦 Database synced ${forceSync ? '(force=true)' : ''}`
    );
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:');
    console.error(error); // 👈 مهم لإظهار السبب الحقيقي
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
  DataTypes,
};