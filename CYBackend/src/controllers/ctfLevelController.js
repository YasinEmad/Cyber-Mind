const { CTFLevel } = require('../models');

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

    // Prepare commands to return: separate template commands and custom commands
    let templateCommands = [];
    if (Array.isArray(challenge.commandTemplates) && challenge.commandTemplates.length > 0) {
      try {
        const { expandTemplate } = require('./commandTemplateController');
        const expanded = await Promise.all(challenge.commandTemplates.map((c) => expandTemplate(c.templateId, c.values || {})));
        templateCommands = [].concat(...expanded).filter(Boolean);
      } catch (e) {
        // ignore expansion errors and fall back to stored commands
      }
    }
    let customCommands = Array.isArray(challenge.customCommands) ? JSON.parse(JSON.stringify(challenge.customCommands)) : [];
    let allCommands = [...templateCommands, ...customCommands];

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
        commands: allCommands, // for backward compatibility
        templateCommands,
        customCommands,
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

    // Prepare commands to return: separate template commands and custom commands
    let templateCommands = [];
    if (Array.isArray(challenge.commandTemplates) && challenge.commandTemplates.length > 0) {
      try {
        const { expandTemplate } = require('./commandTemplateController');
        const expanded = await Promise.all(challenge.commandTemplates.map((c) => expandTemplate(c.templateId, c.values || {})));
        templateCommands = [].concat(...expanded).filter(Boolean);
      } catch (e) {
        // ignore expansion errors and fall back to stored commands
      }
    }
    let customCommands = Array.isArray(challenge.customCommands) ? JSON.parse(JSON.stringify(challenge.customCommands)) : [];
    let allCommands = [...templateCommands, ...customCommands];

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
        commands: allCommands, // for backward compatibility
        templateCommands,
        customCommands,
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
      customCommands,
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
    let finalCustomCommands = Array.isArray(customCommands) ? JSON.parse(JSON.stringify(customCommands)) : [];
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
    if ((!finalCommands || finalCommands.length === 0) && (!storedCommandTemplates || storedCommandTemplates.length === 0) && (!finalCustomCommands || finalCustomCommands.length === 0)) missing.push('commands (or commandTemplates or customCommands)');

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
      customCommands: finalCustomCommands,
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