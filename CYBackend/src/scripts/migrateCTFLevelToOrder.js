require('dotenv').config();
const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const migrateCTFLevelToOrder = async () => {
  try {
    console.log('Starting migration: level -> order for ctf_levels...');

    await sequelize.authenticate();
    console.log('Connected to database.');

    const levelsInfo = await sequelize.getQueryInterface().describeTable('ctf_levels');
    const completionsInfo = await sequelize.getQueryInterface().describeTable('ctf_level_completions');

    // ===== STEP 1: Migrate ctf_level_completions (before dropping level column) =====
    if (completionsInfo.level && !completionsInfo.ctfLevelId) {
      // Read level->id mapping from ctf_levels while level column still exists
      const [levelMapping] = await sequelize.query('SELECT id, level FROM ctf_levels WHERE level IS NOT NULL');
      const levelToId = {};
      for (const row of levelMapping) {
        levelToId[row.level] = row.id;
      }

      await sequelize.getQueryInterface().addColumn('ctf_level_completions', 'ctfLevelId', {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      console.log('Added ctfLevelId column to ctf_level_completions.');

      for (const [levelNum, ctfLevelId] of Object.entries(levelToId)) {
        await sequelize.query(
          'UPDATE ctf_level_completions SET "ctfLevelId" = :ctfLevelId WHERE level = :levelNum AND "ctfLevelId" IS NULL',
          { replacements: { ctfLevelId, levelNum: parseInt(levelNum) } }
        );
      }
      console.log('Migrated completion data.');

      await sequelize.getQueryInterface().removeColumn('ctf_level_completions', 'level');
      console.log('Removed "level" column from ctf_level_completions.');

      await sequelize.getQueryInterface().changeColumn('ctf_level_completions', 'ctfLevelId', {
        type: DataTypes.INTEGER,
        allowNull: false,
      });

      await sequelize.getQueryInterface().addConstraint('ctf_level_completions', {
        fields: ['ctfLevelId'],
        type: 'foreign key',
        name: 'ctf_level_completions_ctf_level_id_fk',
        references: { table: 'ctf_levels', field: 'id' },
        onDelete: 'CASCADE',
      });
      console.log('Set ctfLevelId to NOT NULL and added FK.');

      try { await sequelize.getQueryInterface().removeIndex('ctf_level_completions', 'ctf_level_completions_level'); } catch (e) {}
      try { await sequelize.getQueryInterface().removeIndex('ctf_level_completions', 'ctf_level_completions_user_id_level'); } catch (e) {}
      try { await sequelize.getQueryInterface().removeIndex('ctf_level_completions', 'ctf_level_completions_user_id_ctf_level_id'); } catch (e) {}

      await sequelize.getQueryInterface().addIndex('ctf_level_completions', ['userId', 'ctfLevelId'], {
        unique: true, name: 'ctf_level_completions_user_id_ctf_level_id',
      });
      await sequelize.getQueryInterface().addIndex('ctf_level_completions', ['ctfLevelId'], {
        name: 'ctf_level_completions_ctf_level_id',
      });
      console.log('Updated indexes on ctf_level_completions.');
    } else if (completionsInfo.ctfLevelId) {
      console.log('ctfLevelId already exists. Skipping completion migration.');
    }

    // ===== STEP 2: Migrate ctf_levels =====
    if (levelsInfo.level && levelsInfo.order) {
      // Both exist: ensure order values are populated, then drop level
      await sequelize.query('UPDATE ctf_levels SET "order" = level WHERE "order" IS NULL AND level IS NOT NULL');
      console.log('Copied any missing level values to order.');

      await sequelize.getQueryInterface().removeColumn('ctf_levels', 'level');
      console.log('Removed "level" column.');
    } else if (levelsInfo.level && !levelsInfo.order) {
      // Order doesn't exist yet
      await sequelize.getQueryInterface().addColumn('ctf_levels', 'order', {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      await sequelize.query('UPDATE ctf_levels SET "order" = level');
      await sequelize.getQueryInterface().changeColumn('ctf_levels', 'order', {
        type: DataTypes.INTEGER,
        allowNull: false,
      });
      await sequelize.getQueryInterface().removeColumn('ctf_levels', 'level');
      console.log('Migrated: added order, copied values, removed level.');
    } else if (!levelsInfo.level && levelsInfo.order) {
      console.log('Migration already applied (order exists, level gone).');
    }

    // ===== STEP 3: Sync model for indexes =====
    const { CTFLevel, CTFLevelCompletion } = require('../models');
    await CTFLevel.sync({ alter: true });
    await CTFLevelCompletion.sync({ alter: true });
    console.log('Models synced.');

    console.log('Migration complete!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    await sequelize.close();
    process.exit(1);
  }
};

migrateCTFLevelToOrder();
