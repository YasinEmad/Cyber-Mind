// config/db.js

const { Sequelize, DataTypes } = require('sequelize');

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
      const commandTemplatesTable = 'command_templates';
      const commandTemplatesDesc = await qi.describeTable(commandTemplatesTable).catch(() => null);
      if (commandTemplatesDesc) {
        // Add `commands` JSON column if missing
        if (!Object.prototype.hasOwnProperty.call(commandTemplatesDesc, 'commands')) {
          console.log(`DB Migration: adding missing column 'commands' to ${commandTemplatesTable}`);
          await qi.addColumn(commandTemplatesTable, 'commands', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
          console.log(`DB Migration: column 'commands' added to ${commandTemplatesTable}`);
        }
        // Add `fields` JSON column if missing (safe-guard)
        if (!Object.prototype.hasOwnProperty.call(commandTemplatesDesc, 'fields')) {
          console.log(`DB Migration: adding missing column 'fields' to ${commandTemplatesTable}`);
          await qi.addColumn(commandTemplatesTable, 'fields', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
          console.log(`DB Migration: column 'fields' added to ${commandTemplatesTable}`);
        }

        // Add `version` integer column if missing (safe-guard)
        if (!Object.prototype.hasOwnProperty.call(commandTemplatesDesc, 'version')) {
          console.log(`DB Migration: adding missing column 'version' to ${commandTemplatesTable}`);
          await qi.addColumn(commandTemplatesTable, 'version', {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
          });
          console.log(`DB Migration: column 'version' added to ${commandTemplatesTable}`);
        }
        // Add `allowedPaths` JSON column if missing (safe-guard)
        if (!Object.prototype.hasOwnProperty.call(commandTemplatesDesc, 'allowedPaths')) {
          console.log(`DB Migration: adding missing column 'allowedPaths' to ${commandTemplatesTable}`);
          await qi.addColumn(commandTemplatesTable, 'allowedPaths', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
          console.log(`DB Migration: column 'allowedPaths' added to ${commandTemplatesTable}`);
        }
        // Add `blockedPaths` JSON column if missing (safe-guard)
        if (!Object.prototype.hasOwnProperty.call(commandTemplatesDesc, 'blockedPaths')) {
          console.log(`DB Migration: adding missing column 'blockedPaths' to ${commandTemplatesTable}`);
          await qi.addColumn(commandTemplatesTable, 'blockedPaths', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
          console.log(`DB Migration: column 'blockedPaths' added to ${commandTemplatesTable}`);
        }
      }

      const levelTable = 'ctf_levels';
      const levelTableDesc = await qi.describeTable(levelTable).catch(() => null);
      if (levelTableDesc) {
        if (!Object.prototype.hasOwnProperty.call(levelTableDesc, 'customCommands')) {
          console.log(`DB Migration: adding missing column 'customCommands' to ${levelTable}`);
          await qi.addColumn(levelTable, 'customCommands', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
          console.log(`DB Migration: column 'customCommands' added to ${levelTable}`);
        }
        if (!Object.prototype.hasOwnProperty.call(levelTableDesc, 'commandTemplates')) {
          console.log(`DB Migration: adding missing column 'commandTemplates' to ${levelTable}`);
          await qi.addColumn(levelTable, 'commandTemplates', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
          console.log(`DB Migration: column 'commandTemplates' added to ${levelTable}`);
        }
        if (!Object.prototype.hasOwnProperty.call(levelTableDesc, 'requiredCommandSequence')) {
          console.log(`DB Migration: adding missing column 'requiredCommandSequence' to ${levelTable}`);
          await qi.addColumn(levelTable, 'requiredCommandSequence', {
            type: DataTypes.JSON,
            allowNull: true,
          });
          console.log(`DB Migration: column 'requiredCommandSequence' added to ${levelTable}`);
        }
        if (!Object.prototype.hasOwnProperty.call(levelTableDesc, 'successCondition')) {
          console.log(`DB Migration: adding missing column 'successCondition' to ${levelTable}`);
          await qi.addColumn(levelTable, 'successCondition', {
            type: DataTypes.STRING,
            allowNull: true,
          });
          console.log(`DB Migration: column 'successCondition' added to ${levelTable}`);
        }
        if (!Object.prototype.hasOwnProperty.call(levelTableDesc, 'initialDirectory')) {
          console.log(`DB Migration: adding missing column 'initialDirectory' to ${levelTable}`);
          await qi.addColumn(levelTable, 'initialDirectory', {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '/home/user',
          });
          console.log(`DB Migration: column 'initialDirectory' added to ${levelTable}`);
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