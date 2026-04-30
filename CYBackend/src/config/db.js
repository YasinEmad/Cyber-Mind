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
    
    // Ensure required columns exist for backward compatibility
    try {
      const qi = sequelize.getQueryInterface();
      const tableName = 'command_templates';
      const tableDesc = await qi.describeTable(tableName).catch(() => null);
      if (tableDesc) {
        // Add `commands` JSON column if missing
        if (!Object.prototype.hasOwnProperty.call(tableDesc, 'commands')) {
          console.log(`DB Migration: adding missing column 'commands' to ${tableName}`);
          await qi.addColumn(tableName, 'commands', {
            type: require('sequelize').DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
          console.log(`DB Migration: column 'commands' added to ${tableName}`);
        }
        // Add `fields` JSON column if missing (safe-guard)
        if (!Object.prototype.hasOwnProperty.call(tableDesc, 'fields')) {
          console.log(`DB Migration: adding missing column 'fields' to ${tableName}`);
          await qi.addColumn(tableName, 'fields', {
            type: require('sequelize').DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
          console.log(`DB Migration: column 'fields' added to ${tableName}`);
        }

        // Add `version` integer column if missing (safe-guard)
        if (!Object.prototype.hasOwnProperty.call(tableDesc, 'version')) {
          console.log(`DB Migration: adding missing column 'version' to ${tableName}`);
          await qi.addColumn(tableName, 'version', {
            type: require('sequelize').DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
          });
          console.log(`DB Migration: column 'version' added to ${tableName}`);
        }
      }
    } catch (migrationErr) {
      console.error('DB Migration Error:', migrationErr.message || migrationErr);
    }
  } catch (error) {
    console.error(`PostgreSQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };