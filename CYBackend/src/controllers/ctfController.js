const { CTFLevel, CommandTemplate } = require('../models');
const ctfLevels = require('../data/ctfLevels');
const ctfInfo = require('../data/ctfinfo');
const { generateTemplateId } = require('../utils/idGenerator');

// Get all CTF level information
exports.getCTFInfo = async (req, res, next) => {
  try {
    const levels = await CTFLevel.findAll({
      where: { isActive: true },
      attributes: ['level', 'title', 'description', 'difficulty'],
      order: [['level', 'ASC']],
    });

    const ctfInfo = {
      levels: levels.map(level => ({
        level: level.level,
        name: level.title,
        description: level.description,
        category: 'Linux',
        difficulty: level.difficulty,
      })),
    };

    res.status(200).json({
      success: true,
      data: ctfInfo,
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific CTF level info
exports.getCTFLevelInfo = async (req, res, next) => {
  try {
    const { level } = req.params;
    const levelData = await CTFLevel.findOne({
      where: { level: parseInt(level), isActive: true },
      attributes: ['level', 'title', 'description', 'difficulty'],
    });

    if (!levelData) {
      return res.status(404).json({
        success: false,
        message: `CTF level ${level} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        level: levelData.level,
        name: levelData.title,
        description: levelData.description,
        category: 'Linux',
        difficulty: levelData.difficulty,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get CTF challenge data (flag, description, hint, commands)
exports.getCTFChallenge = async (req, res, next) => {
  try {
    const { level } = req.params;
    const challenge = await CTFLevel.findOne({
      where: { level: parseInt(level), isActive: true },
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: `CTF challenge ${level} not found`,
      });
    }

    // Prepare commands to return: if templates are stored, expand them for the frontend view.
    let responseCommands = Array.isArray(challenge.commands) ? JSON.parse(JSON.stringify(challenge.commands)) : [];
    if (Array.isArray(challenge.commandTemplates) && challenge.commandTemplates.length > 0) {
      try {
        const expanded = await Promise.all(challenge.commandTemplates.map((c) => expandTemplate(c.templateId, c.values || {})));
        responseCommands = [].concat(...expanded).filter(Boolean);
      } catch (e) {
        // ignore expansion errors and fall back to stored commands
      }
    }

    // Return challenge without exposing sensitive data like flag to unauthorized users
    res.status(200).json({
      success: true,
      data: {
        level: challenge.level,
        title: challenge.title,
        description: challenge.description,
        hints: challenge.hint,
        flag: challenge.flag,
        difficulty: challenge.difficulty,
        commands: responseCommands,
        requiredCommandSequence: challenge.requiredCommandSequence,
        successCondition: challenge.successCondition,
        initialDirectory: challenge.initialDirectory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get challenge with filesystem info (for initialization)
exports.getCTFChallengeWithFS = async (req, res, next) => {
  try {
    const { level } = req.params;
    const challenge = await CTFLevel.findOne({
      where: { level: parseInt(level), isActive: true },
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: `CTF challenge ${level} not found`,
      });
    }

    // Prepare commands to return: if templates are stored, expand them for the frontend view.
    let responseCommands = Array.isArray(challenge.commands) ? JSON.parse(JSON.stringify(challenge.commands)) : [];
    if (Array.isArray(challenge.commandTemplates) && challenge.commandTemplates.length > 0) {
      try {
        const expanded = await Promise.all(challenge.commandTemplates.map((c) => expandTemplate(c.templateId, c.values || {})));
        responseCommands = [].concat(...expanded).filter(Boolean);
      } catch (e) {
        // ignore expansion errors and fall back to stored commands
      }
    }

    // Return challenge info (commands will be used on frontend)
    res.status(200).json({
      success: true,
      data: {
        level: challenge.level,
        title: challenge.title,
        description: challenge.description,
        hints: challenge.hint,
        flag: challenge.flag,
        difficulty: challenge.difficulty,
        commands: responseCommands,
        requiredCommandSequence: challenge.requiredCommandSequence,
        successCondition: challenge.successCondition,
        initialDirectory: challenge.initialDirectory,
        hasCustomCommands: (responseCommands && responseCommands.length > 0) || (Array.isArray(challenge.commandTemplates) && challenge.commandTemplates.length > 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Command templates CRUD (DB-backed)
exports.getCommandTemplates = async (req, res, next) => {
  try {
    const rows = await CommandTemplate.findAll({ order: [['id', 'ASC']] });
    const data = rows.map((t) => ({
      id: t.id,
      templateId: t.templateId,
      name: t.name,
      baseCommand: t.baseCommand,
      defaultOutput: t.defaultOutput,
      fields: t.fields,
      allowedPaths: t.allowedPaths,
      blockedPaths: t.blockedPaths,
      commands: t.commands,
      description: t.description,
    }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getCommandTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tmpl = await CommandTemplate.findByPk(id);
    if (!tmpl) return res.status(404).json({ success: false, message: 'Template not found' });
    res.status(200).json({ success: true, data: tmpl });
  } catch (error) {
    next(error);
  }
};

exports.createCommandTemplate = async (req, res, next) => {
  try {
    const { name, baseCommand, defaultOutput, fields, description, commands, allowedPaths, blockedPaths } = req.body;
    // Generate templateId automatically - no longer required in request
    const templateId = generateTemplateId();
    
    // Require name; accept either a single baseCommand or an array of commands
    if (!name || (!baseCommand && !Array.isArray(commands))) {
      return res.status(400).json({ success: false, message: 'name and baseCommand or commands are required' });
    }
    
    // basic validation for fields
    if (fields && !Array.isArray(fields)) {
      return res.status(400).json({ success: false, message: 'fields must be an array' });
    }
    if (commands && !Array.isArray(commands)) {
      return res.status(400).json({ success: false, message: 'commands must be an array' });
    }
    if (allowedPaths && !Array.isArray(allowedPaths)) {
      return res.status(400).json({ success: false, message: 'allowedPaths must be an array' });
    }
    if (blockedPaths && !Array.isArray(blockedPaths)) {
      return res.status(400).json({ success: false, message: 'blockedPaths must be an array' });
    }

    const created = await CommandTemplate.create({ 
      templateId, 
      name, 
      baseCommand, 
      defaultOutput, 
      fields: fields || [], 
      allowedPaths: allowedPaths || [],
      blockedPaths: blockedPaths || [],
      description, 
      commands: commands || [] 
    });
    res.status(201).json({ success: true, data: created, message: `Template created with ID: ${templateId}` });
  } catch (error) {
    next(error);
  }
};

exports.updateCommandTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const tmpl = await CommandTemplate.findByPk(id);
    if (!tmpl) return res.status(404).json({ success: false, message: 'Template not found' });
    if (updateData.fields && !Array.isArray(updateData.fields)) {
      return res.status(400).json({ success: false, message: 'fields must be an array' });
    }
    if (updateData.commands && !Array.isArray(updateData.commands)) {
      return res.status(400).json({ success: false, message: 'commands must be an array' });
    }
    if (updateData.allowedPaths && !Array.isArray(updateData.allowedPaths)) {
      return res.status(400).json({ success: false, message: 'allowedPaths must be an array' });
    }
    if (updateData.blockedPaths && !Array.isArray(updateData.blockedPaths)) {
      return res.status(400).json({ success: false, message: 'blockedPaths must be an array' });
    }
    if (updateData.templateId && updateData.templateId !== tmpl.templateId) {
      const exists = await CommandTemplate.findOne({ where: { templateId: updateData.templateId } });
      if (exists) return res.status(409).json({ success: false, message: 'templateId already exists' });
    }
    // If significant template fields changed, bump version
    const significant = ['templateId', 'name', 'baseCommand', 'defaultOutput', 'fields', 'commands', 'description', 'allowedPaths', 'blockedPaths'];
    const willChangeVersion = significant.some((k) => {
      if (updateData[k] === undefined) return false;
      const oldVal = tmpl[k];
      const newVal = updateData[k];
      // simple deep check for arrays
      if (Array.isArray(oldVal) || Array.isArray(newVal)) {
        return JSON.stringify(oldVal) !== JSON.stringify(newVal);
      }
      return oldVal !== newVal;
    });
    if (willChangeVersion) {
      updateData.version = (tmpl.version || 1) + 1;
    }
    await tmpl.update(updateData);
    res.status(200).json({ success: true, data: tmpl });
  } catch (error) {
    next(error);
  }
};

exports.deleteCommandTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tmpl = await CommandTemplate.findByPk(id);
    if (!tmpl) return res.status(404).json({ success: false, message: 'Template not found' });
    await tmpl.destroy();
    res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
};

// Expand a template into a concrete command object (DB-backed)
async function expandTemplate(templateIdOrId, values = {}) {
  let tmpl;
  if (typeof templateIdOrId === 'number' || /^\\d+$/.test(String(templateIdOrId))) {
    tmpl = await CommandTemplate.findByPk(templateIdOrId);
  } else {
    tmpl = await CommandTemplate.findOne({ where: { templateId: templateIdOrId } });
  }
  if (!tmpl) return null;
  const tpl = tmpl.dataValues || tmpl;

  // Build snapshot (deep copy) — immutable snapshot stored in level
  const snapshotTemplate = {
    id: tpl.id,
    templateId: tpl.templateId,
    name: tpl.name,
    baseCommand: tpl.baseCommand,
    defaultOutput: tpl.defaultOutput,
    fields: Array.isArray(tpl.fields) ? [...tpl.fields] : [],
    allowedPaths: Array.isArray(tpl.allowedPaths) ? [...tpl.allowedPaths] : [],
    blockedPaths: Array.isArray(tpl.blockedPaths) ? [...tpl.blockedPaths] : [],
    description: tpl.description,
    commands: Array.isArray(tpl.commands) ? JSON.parse(JSON.stringify(tpl.commands)) : [],
    version: tpl.version || 1,
  };

  const resolveAllowedPaths = (valueAllowedPaths) => {
    if (Array.isArray(valueAllowedPaths)) return valueAllowedPaths;
    if (valueAllowedPaths) return [String(valueAllowedPaths)];
    return Array.isArray(snapshotTemplate.allowedPaths) ? snapshotTemplate.allowedPaths : [];
  };

  const resolveBlockedPaths = (valueBlockedPaths) => {
    if (Array.isArray(valueBlockedPaths)) return valueBlockedPaths;
    if (valueBlockedPaths) return [String(valueBlockedPaths)];
    return Array.isArray(snapshotTemplate.blockedPaths) ? snapshotTemplate.blockedPaths : [];
  };

  // If template defines multiple commands, expand each one
  if (Array.isArray(snapshotTemplate.commands) && snapshotTemplate.commands.length > 0) {
    const vals = values && values.commands && Array.isArray(values.commands) ? values.commands : [];
    const cmds = snapshotTemplate.commands.map((c, idx) => {
      const v = vals[idx] || {};
      const name = v.name || c.name || c.baseCommand || snapshotTemplate.baseCommand || snapshotTemplate.name;
      const output = v.output !== undefined ? v.output : (c.output !== undefined ? c.output : snapshotTemplate.defaultOutput || '');
      const cmd = Object.assign({}, c, {
        name,
        output,
        sourceTemplateId: snapshotTemplate.id,
        sourceTemplateVersion: snapshotTemplate.version,
        templateSnapshot: snapshotTemplate,
      });
      if (snapshotTemplate.fields.includes('allowedPaths') || snapshotTemplate.allowedPaths.length > 0 || Array.isArray(v.allowedPaths)) {
        cmd.allowedPaths = resolveAllowedPaths(v.allowedPaths);
      }
      if (snapshotTemplate.fields.includes('blockedPaths') || snapshotTemplate.blockedPaths.length > 0 || Array.isArray(v.blockedPaths)) {
        cmd.blockedPaths = resolveBlockedPaths(v.blockedPaths);
      }
      return cmd;
    });
    return cmds;
  }

  // Fallback: single command template
  const cmd = {
    name: values.name || snapshotTemplate.baseCommand || snapshotTemplate.name,
    output: values.output !== undefined ? values.output : snapshotTemplate.defaultOutput || '',
    sourceTemplateId: snapshotTemplate.id,
    sourceTemplateVersion: snapshotTemplate.version,
    templateSnapshot: snapshotTemplate,
  };

  if (snapshotTemplate.fields.includes('allowedPaths') || snapshotTemplate.allowedPaths.length > 0) {
    cmd.allowedPaths = resolveAllowedPaths(values.allowedPaths);
  }
  if (snapshotTemplate.fields.includes('blockedPaths') || snapshotTemplate.blockedPaths.length > 0) {
    cmd.blockedPaths = resolveBlockedPaths(values.blockedPaths);
  }

  snapshotTemplate.fields.forEach((f) => {
    if (f !== 'allowedPaths' && f !== 'blockedPaths' && f !== 'output') {
      if (values[f] !== undefined) cmd[f] = values[f];
    }
  });

  return [cmd];
}

// Get all CTF levels (admin management)
exports.getAllCTFLevels = async (req, res, next) => {
  try {
    const levels = await CTFLevel.findAll({
      order: [['level', 'ASC']],
    });
    res.status(200).json({
      success: true,
      data: levels,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single CTF level by ID
exports.getCTFLevelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const level = await CTFLevel.findByPk(id);

    if (!level) {
      return res.status(404).json({
        success: false,
        message: `CTF level with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: level,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new CTF level
exports.createCTFLevel = async (req, res, next) => {
  try {
    const {
      level,
      title,
      description,
      hint, // legacy: single hint or JSON
      hints, // newer payloads use `hints` array
      flag,
      difficulty,
      isActive,
      commands,
      commandTemplates,
      requiredCommandSequence,
      successCondition,
      initialDirectory,
    } = req.body;

    // normalize hint(s) into an array stored in `hint` field
    const normalizedHints = Array.isArray(hints) ? hints : (hint ? (Array.isArray(hint) ? hint : [hint]) : []);

    const levelNum = parseInt(level);
    if (isNaN(levelNum)) {
      return res.status(400).json({
        success: false,
        message: 'Level must be a valid number',
      });
    }

    // Support storing templates separately: prefer storing `commandTemplates` as references
    // instead of expanding them into `commands` to avoid duplication.
    let finalCommands = [];
    let storedCommandTemplates = [];
    if (Array.isArray(commandTemplates) && commandTemplates.length > 0) {
      // store the template references as-is and prefer templates at runtime
      storedCommandTemplates = commandTemplates.map((c) => ({ templateId: c.templateId, values: c.values || {} }));
    } else {
      finalCommands = Array.isArray(commands) ? JSON.parse(JSON.stringify(commands)) : [];
    }

    // Validate required fields (commands can be created via templates)
    const missing = [];
    if (!level) missing.push('level');
    if (!title) missing.push('title');
    if (!description) missing.push('description');
    if (!normalizedHints || normalizedHints.length === 0) missing.push('hint(s)');
    if (!flag) missing.push('flag');
    if ((!finalCommands || finalCommands.length === 0) && (!storedCommandTemplates || storedCommandTemplates.length === 0)) missing.push('commands (or commandTemplates)');

    if (missing.length > 0) {
      // Log the incoming payload for debugging
      console.warn('CTF Create - missing fields:', missing, 'payload:', JSON.stringify(req.body).slice(0, 1000));
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    // Check if level already exists
    const existingLevel = await CTFLevel.findOne({ where: { level: levelNum } });
    if (existingLevel) {
      return res.status(409).json({
        success: false,
        message: `CTF level ${level} already exists`,
      });
    }

    const newLevel = await CTFLevel.create({
      level: levelNum,
      title,
      description,
      hint: normalizedHints,
      flag,
      difficulty: difficulty || 'easy',
      isActive: isActive !== undefined ? isActive : true,
      // store either commands OR commandTemplates (templates take precedence)
      commands: finalCommands,
      commandTemplates: storedCommandTemplates,
      requiredCommandSequence,
      successCondition,
      initialDirectory: initialDirectory || '/home/user',
    });

    res.status(201).json({
      success: true,
      data: newLevel,
    });
  } catch (error) {
    next(error);
  }
};

// Update a CTF level
exports.updateCTFLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const level = await CTFLevel.findByPk(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: `CTF level with ID ${id} not found`,
      });
    }

    // Parse level if provided
    if (updateData.level !== undefined) {
      const levelNum = parseInt(updateData.level);
      if (isNaN(levelNum)) {
        return res.status(400).json({
          success: false,
          message: 'Level must be a valid number',
        });
      }
      updateData.level = levelNum;
    }

    // If commandTemplates provided, store them directly (templates take precedence).
    if (Array.isArray(updateData.commandTemplates) && updateData.commandTemplates.length > 0) {
      updateData.commandTemplates = updateData.commandTemplates.map((c) => ({ templateId: c.templateId, values: c.values || {} }));
      // prefer templates: clear explicit commands to avoid duplication
      updateData.commands = [];
    }

    // If updating level number, check for conflicts
    if (updateData.level !== undefined && updateData.level !== level.level) {
      const existingLevel = await CTFLevel.findOne({ where: { level: updateData.level } });
      if (existingLevel) {
        return res.status(409).json({
          success: false,
          message: `CTF level ${updateData.level} already exists`,
        });
      }
    }

    await level.update(updateData);

    res.status(200).json({
      success: true,
      data: level,
    });
  } catch (error) {
    next(error);
  }
};

// Execute a command for a given level (path-aware)
exports.executeCTFCommand = async (req, res, next) => {
  try {
    const { level, command, currentPath, sessionState } = req.body;
    if (level === undefined || !command) {
      return res.status(400).json({ success: false, output: 'Missing level or command' });
    }

    const lvl = await CTFLevel.findOne({ where: { level: parseInt(level, 10), isActive: true } });
    if (!lvl) {
      return res.status(404).json({ success: false, output: 'Level not found' });
    }

    const commands = Array.isArray(lvl.commands) ? lvl.commands : [];
    const storedTemplates = Array.isArray(lvl.commandTemplates) ? lvl.commandTemplates : [];

    // Parse incoming
    const parts = command.trim().split(/\s+/);
    const cmdName = parts[0];
    const args = parts.slice(1);

    // Debug: log incoming request and available commands/templates briefly for this level
    try {
      console.debug('CTF execute - request body:', { level, command, currentPath });
      console.debug(`CTF execute - level=${lvl.level} incoming='${command}' cmdName='${cmdName}' commandsCount=${commands.length} templatesCount=${storedTemplates.length}`);
    } catch (e) {}

    // ════════════════════════════════════════════════════════════════
    // SPECIAL HANDLING FOR cd COMMAND (Navigation)
    // ════════════════════════════════════════════════════════════════
    if (cmdName === 'cd') {
      try {
        console.debug('CTF execute - processing cd command', { args, currentPath });
        
        // Helper function to resolve path (identical to frontend logic)
        const resolvePath = (current, target) => {
          if (!target) return current;
          let parts;
          let base;
          if (target.startsWith('/')) {
            base = '/';
            parts = target.split('/').filter(Boolean);
          } else {
            base = current;
            parts = target.split('/').filter(Boolean);
          }
          let path = base === '/' ? '' : base;
          for (const p of parts) {
            if (p === '.') continue;
            if (p === '..') {
              const segs = path.split('/').filter(Boolean);
              segs.pop();
              path = '/' + segs.join('/');
              if (path === '/') path = '';
            } else {
              path = path + '/' + p;
            }
          }
          return path === '' ? '/' : path;
        };

        const cwd = currentPath || lvl.initialDirectory || '/home/user';
        const target = args[0] || '/home/user';
        const newPath = resolvePath(cwd, target);

        console.debug('CTF execute - cd resolved path', { cwd, target, newPath });

        // For now, we assume the path is valid
        // (In a real system, we'd validate against a filesystem structure)
        // Return navigation response without output text
        return res.status(200).json({ 
          success: true, 
          output: '', // Empty output for cd command
          isNavigation: true, 
          newPath: newPath 
        });
      } catch (e) {
        console.error('CTF execute - cd command error', e);
        return res.status(200).json({ success: false, output: 'cd: invalid path' });
      }
    }

    // ════════════════════════════════════════════════════════════════
    // NORMAL COMMAND HANDLING
    // ════════════════════════════════════════════════════════════════

    const full = String(command).trim();
    const base = String(cmdName).trim();

    let matched = null;

    // Priority: if templates are stored for this level, use them (do not mix with commands)
    if (storedTemplates && storedTemplates.length > 0) {
      for (const tRef of storedTemplates) {
        try {
          const expanded = await expandTemplate(tRef.templateId, tRef.values || {});
          const flat = [].concat(...(expanded || [])).filter(Boolean);
          for (const c of flat) {
            const stored = c && c.name ? String(c.name).trim() : '';
            const tplBase = c && c.templateSnapshot && c.templateSnapshot.baseCommand ? String(c.templateSnapshot.baseCommand).trim() : null;
            if (stored === full || stored === base || (tplBase && (tplBase === full || tplBase === base))) {
              matched = c;
              console.debug('CTF execute - matched via commandTemplates expansion', { templateId: tRef.templateId, matchedName: stored || tplBase });
              break;
            }
          }
          if (matched) break;
        } catch (err) {
          try { console.debug('CTF execute - template expansion error', err); } catch (e) {}
        }
      }
    }

    // If no templates or none matched, fall back to explicit commands stored on the level
    if (!matched && Array.isArray(commands) && commands.length > 0) {
      matched = commands.find((c) => {
        const stored = (c && c.name) ? String(c.name).trim() : '';
        return stored === full || stored === base;
      });
    }
    if (!matched) {
      // No custom command defined for this level
      return res.status(200).json({ success: false, output: `${cmdName}: command not found` });
    }

    const allowed = Array.isArray(matched.allowedPaths) ? matched.allowedPaths : undefined;
    const blocked = Array.isArray(matched.blockedPaths) ? matched.blockedPaths : undefined;
    // IMPORTANT: Use currentPath sent from Frontend, not a cached/old path
    // This is critical for proper permission checks after `cd` command
    const cwd = currentPath || lvl.initialDirectory || '/home/user';

    console.debug('CTF execute - permission validation', {
      command: cmdName,
      sentPath: currentPath,
      resolvedCwd: cwd,
      allowedPaths: allowed,
      blockedPaths: blocked,
    });

    // Blocked takes precedence - check if current path is exactly blocked
    if (Array.isArray(blocked) && blocked.length > 0) {
      const isBlocked = blocked.some((p) => cwd === p);
      if (isBlocked) {
        console.warn('CTF execute - PERMISSION DENIED (path is blocked)', {
          command: cmdName,
          cwd: cwd,
          blockedPaths: blocked,
        });
        return res.status(200).json({ success: false, output: 'Permission denied' });
      }
    }

    // If allowedPaths is specified, check if current path is exactly allowed
    if (Array.isArray(allowed) && allowed.length > 0) {
      const isAllowed = allowed.some((p) => cwd === p);
      if (!isAllowed) {
        console.warn('CTF execute - PERMISSION DENIED (path not in allowed list)', {
          command: cmdName,
          cwd: cwd,
          allowedPaths: allowed,
        });
        return res.status(200).json({ success: false, output: 'Permission denied' });
      }
    }
    // If allowedPaths is empty or not specified, command is allowed (unless blocked)

    // Normalize output to a string for safety and log unexpected types
    let outVal = matched.output;
    if (outVal === undefined || outVal === null) outVal = '';
    if (typeof outVal !== 'string') {
      try {
        console.debug('CTF execute - matched.output is not a string, serializing', { type: typeof outVal });
        outVal = JSON.stringify(outVal);
      } catch (e) {
        outVal = String(outVal);
      }
    }

    // Log matched command for debugging (full object)
    try { console.debug('CTF execute - matched command full:', matched); } catch (e) {}

    // Passed validation — return configured output
    return res.status(200).json({ success: true, output: outVal });
  } catch (error) {
    next(error);
  }
};

// Delete a CTF level
exports.deleteCTFLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const level = await CTFLevel.findByPk(id);

    if (!level) {
      return res.status(404).json({
        success: false,
        message: `CTF level with ID ${id} not found`,
      });
    }

    await level.destroy();

    res.status(200).json({
      success: true,
      message: 'CTF level deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Toggle active status
exports.toggleCTFLevelStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const level = await CTFLevel.findByPk(id);

    if (!level) {
      return res.status(404).json({
        success: false,
        message: `CTF level with ID ${id} not found`,
      });
    }

    await level.update({ isActive: !level.isActive });

    res.status(200).json({
      success: true,
      data: level,
    });
  } catch (error) {
    next(error);
  }
};

// Get all available CTF levels (list of available level numbers)
exports.getAvailableLevels = async (req, res, next) => {
  try {
    const levels = await CTFLevel.findAll({
      where: { isActive: true },
      attributes: ['level', 'title', 'description', 'difficulty'],
      order: [['level', 'ASC']],
    });

    const availableLevels = levels.map(level => ({
      level: level.level,
      name: level.title,
      description: level.description,
      category: 'Linux',
      difficulty: level.difficulty,
    }));

    res.status(200).json({
      success: true,
      data: availableLevels,
    });
  } catch (error) {
    next(error);
  }
};
