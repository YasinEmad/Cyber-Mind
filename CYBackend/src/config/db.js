// config/db.js

const { Sequelize, DataTypes } = require('sequelize');

const dbUrlRaw = process.env.DATABASE_URL;
const dbUrl = dbUrlRaw?.replace('postgresql://', 'postgres://');

// Determine DB host (best-effort). Used to keep localhost developer experience simple.
let dbHost;
try {
  if (dbUrl) {
    const parsed = new URL(dbUrl);
    dbHost = parsed.hostname;
  }
} catch (e) {
  dbHost = process.env.DB_HOST || undefined;
}

const isLocalhost = !!dbHost && ['localhost', '127.0.0.1', '::1'].includes(dbHost);

// Environment-aware SSL policy
// - In production: always validate certificates (rejectUnauthorized: true).
// - For local development (connecting to localhost) keep it simple and allow no SSL.
// - For non-production remote DBs, allow opting into relaxed validation via
//   DB_SSL_ALLOW_SELF_SIGNED (only for development/testing). By default we require
//   proper certificate validation to prevent MITM attacks.
const shouldEnableSsl = (() => {
  if (process.env.DB_SSL === 'disable') return false;
  if (isLocalhost && process.env.NODE_ENV !== 'production') return false;
  if (process.env.NODE_ENV === 'production') return true;
  return process.env.DB_SSL === 'true';
})();

// Build secure ssl options for Sequelize's dialectOptions.
let dialectOptions = {};
if (shouldEnableSsl) {
  const sslOptions = {
    // ask the driver to use SSL
    require: true,
    // Default: validate certificates. NEVER allow disabling this in production.
    rejectUnauthorized: true,
  };

  // In non-production only, allow opting out of certificate validation for
  // development/testing against self-signed certs.
  if (process.env.NODE_ENV !== 'production') {
    if (isLocalhost) {
      // Localhost commonly doesn't use SSL; keep developer experience simple.
      // NOTE: this branch only runs for localhost in non-production.
      sslOptions.rejectUnauthorized = false;
    } else if (process.env.DB_SSL_ALLOW_SELF_SIGNED === 'true') {
      // Explicit developer opt-in to allow self-signed certs for non-production.
      sslOptions.rejectUnauthorized = false;
    }
  }

  // Optional certificate pinning: provide the CA certificate (PEM) via
  // DB_SSL_CERT environment variable. This enables strong server identity
  // verification and mitigates MITM attacks even when CAs are compromised.
  if (process.env.DB_SSL_CERT) {
    // Sequelize / node-postgres accepts `ca` as a string or Buffer.
    sslOptions.ca = process.env.DB_SSL_CERT;
  }

  dialectOptions = { ssl: sslOptions };
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions,

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
        if (!Object.prototype.hasOwnProperty.call(profilesDesc, 'usedHints')) {
          console.log(`DB Migration: adding missing column 'usedHints' to ${profilesTable}`);
          await qi.addColumn(profilesTable, 'usedHints', {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: { puzzles: {}, challenges: {} },
          });
          console.log(`DB Migration: column 'usedHints' added to ${profilesTable}`);
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