#!/usr/bin/env node
const { sequelize, CTFLevel, CommandTemplate } = require('../src/models');

async function trimString(s) {
  if (s === undefined || s === null) return s;
  return String(s).trim();
}

async function cleanup() {
  try {
    await sequelize.authenticate();
    console.log('DB connection OK');

    // Clean CommandTemplate rows
    const templates = await CommandTemplate.findAll();
    let tmplUpdated = 0;
    for (const t of templates) {
      let changed = false;
      const data = t.dataValues || t;
      const update = {};
      if (data.baseCommand !== undefined && data.baseCommand !== null) {
        const trimmed = String(data.baseCommand).trim();
        if (trimmed !== data.baseCommand) { update.baseCommand = trimmed; changed = true; }
      }
      if (data.name !== undefined && data.name !== null) {
        const trimmed = String(data.name).trim();
        if (trimmed !== data.name) { update.name = trimmed; changed = true; }
      }
      if (Array.isArray(data.commands) && data.commands.length > 0) {
        const cmds = JSON.parse(JSON.stringify(data.commands));
        let cmdsChanged = false;
        for (let i = 0; i < cmds.length; i++) {
          if (cmds[i] && cmds[i].name) {
            const tname = String(cmds[i].name).trim();
            if (tname !== cmds[i].name) { cmds[i].name = tname; cmdsChanged = true; }
          }
          if (cmds[i] && cmds[i].baseCommand) {
            const tb = String(cmds[i].baseCommand).trim();
            if (tb !== cmds[i].baseCommand) { cmds[i].baseCommand = tb; cmdsChanged = true; }
          }
        }
        if (cmdsChanged) { update.commands = cmds; changed = true; }
      }
      if (changed) {
        await t.update(update);
        tmplUpdated++;
      }
    }
    console.log(`CommandTemplate rows updated: ${tmplUpdated}`);

    // Clean CTFLevel rows
    const levels = await CTFLevel.findAll();
    let lvlUpdated = 0;
    for (const lvl of levels) {
      const data = lvl.dataValues || lvl;
      const update = {};
      let changed = false;

      // If commandTemplates exist, prefer templates: ensure commands is empty
      if (Array.isArray(data.commandTemplates) && data.commandTemplates.length > 0) {
        // normalize template entries
        const normalized = data.commandTemplates.map((ct) => ({ templateId: ct.templateId, values: ct.values || {} }));
        update.commandTemplates = normalized;
        if (!Array.isArray(data.commands) || data.commands.length > 0) {
          update.commands = [];
        }
        changed = true;
      } else if (Array.isArray(data.commands) && data.commands.length > 0) {
        // Trim command names and templateSnapshot baseCommand, and dedupe by name
        const cmds = JSON.parse(JSON.stringify(data.commands));
        const seen = new Set();
        const out = [];
        let cmdsChanged = false;
        for (const c of cmds) {
          if (!c) continue;
          if (c.name !== undefined && c.name !== null) {
            const tname = String(c.name).trim();
            if (tname !== c.name) { c.name = tname; cmdsChanged = true; }
          }
          if (c.templateSnapshot && c.templateSnapshot.baseCommand) {
            const tb = String(c.templateSnapshot.baseCommand).trim();
            if (tb !== c.templateSnapshot.baseCommand) { c.templateSnapshot.baseCommand = tb; cmdsChanged = true; }
          }
          const key = (c.name || '').trim();
          if (!key) continue;
          if (seen.has(key)) {
            cmdsChanged = true; // duplicate -> removed
            continue;
          }
          seen.add(key);
          out.push(c);
        }
        if (cmdsChanged) {
          update.commands = out;
          changed = true;
        }
      }

      if (changed) {
        await lvl.update(update);
        lvlUpdated++;
      }
    }
    console.log(`CTFLevel rows updated: ${lvlUpdated}`);

    console.log('Cleanup finished');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed', err);
    process.exit(2);
  }
}

cleanup();
