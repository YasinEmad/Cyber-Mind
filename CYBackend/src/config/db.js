// config/db.js

const { Sequelize, DataTypes } = require('sequelize');

const dbUrl = process.env.DATABASE_URL?.replace(
  'postgresql://',
  'postgres://'
);
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');

    const forceSync = process.env.FORCE_DB_SYNC === 'true';
    await sequelize.sync({ force: forceSync });
    console.log('Database synced', forceSync ? '(force=true)' : '');
    
    try {
      const qi = sequelize.getQueryInterface();

      // --- NEW: Migration for 'profiles' table ---
      const profilesTable = 'profiles';
      const profilesDesc = await qi.describeTable(profilesTable).catch(() => null);
      if (profilesDesc) {
        if (!Object.prototype.hasOwnProperty.call(profilesDesc, 'solvedCTFLevels')) {
          console.log(`DB Migration: adding missing column 'solvedCTFLevels' to ${profilesTable}`);
          await qi.addColumn(profilesTable, 'solvedCTFLevels', {
            type: DataTypes.JSONB, // Using JSONB for better performance in Postgres
            allowNull: false,
            defaultValue: [],
          });
          console.log(`DB Migration: column 'solvedCTFLevels' added to ${profilesTable}`);
        }
      }

      // --- NEW: Migration for 'users' table ---
      const usersTable = 'users';
      const usersDesc = await qi.describeTable(usersTable).catch(() => null);
      if (usersDesc) {
        if (!Object.prototype.hasOwnProperty.call(usersDesc, 'solvedCTFLevels')) {
          console.log(`DB Migration: adding missing column 'solvedCTFLevels' to ${usersTable}`);
          await qi.addColumn(usersTable, 'solvedCTFLevels', {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false,
            defaultValue: [],
          });
          console.log(`DB Migration: column 'solvedCTFLevels' added to ${usersTable}`);
        }
      }

      // --- Existing: command_templates table migration ---
      const commandTemplatesTable = 'command_templates';
      const commandTemplatesDesc = await qi.describeTable(commandTemplatesTable).catch(() => null);
      if (commandTemplatesDesc) {
        if (!Object.prototype.hasOwnProperty.call(commandTemplatesDesc, 'commands')) {
          await qi.addColumn(commandTemplatesTable, 'commands', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
        }
        if (!Object.prototype.hasOwnProperty.call(commandTemplatesDesc, 'fields')) {
          await qi.addColumn(commandTemplatesTable, 'fields', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
        }
        if (!Object.prototype.hasOwnProperty.call(commandTemplatesDesc, 'version')) {
          await qi.addColumn(commandTemplatesTable, 'version', {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
          });
        }
        if (!Object.prototype.hasOwnProperty.call(commandTemplatesDesc, 'allowedPaths')) {
          await qi.addColumn(commandTemplatesTable, 'allowedPaths', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
        }
        if (!Object.prototype.hasOwnProperty.call(commandTemplatesDesc, 'blockedPaths')) {
          await qi.addColumn(commandTemplatesTable, 'blockedPaths', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
        }
      }

      // --- Existing: ctf_levels table migration ---
      const levelTable = 'ctf_levels';
      const levelTableDesc = await qi.describeTable(levelTable).catch(() => null);
      if (levelTableDesc) {
        if (!Object.prototype.hasOwnProperty.call(levelTableDesc, 'customCommands')) {
          await qi.addColumn(levelTable, 'customCommands', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
        }
        if (!Object.prototype.hasOwnProperty.call(levelTableDesc, 'commandTemplates')) {
          await qi.addColumn(levelTable, 'commandTemplates', {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          });
        }
        if (!Object.prototype.hasOwnProperty.call(levelTableDesc, 'requiredCommandSequence')) {
          await qi.addColumn(levelTable, 'requiredCommandSequence', {
            type: DataTypes.JSON,
            allowNull: true,
          });
        }
        if (!Object.prototype.hasOwnProperty.call(levelTableDesc, 'successCondition')) {
          await qi.addColumn(levelTable, 'successCondition', {
            type: DataTypes.STRING,
            allowNull: true,
          });
        }
        if (!Object.prototype.hasOwnProperty.call(levelTableDesc, 'initialDirectory')) {
          await qi.addColumn(levelTable, 'initialDirectory', {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '/home/user',
          });
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