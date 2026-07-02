const { z } = require('zod');
const { CTFLevel } = require('../models');

const difficulties = ['easy', 'medium', 'hard'];

const createCTFSchema = z.object({
  order: z.number().int().positive('Order must be a positive integer'),
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  hint: z.union([z.string(), z.array(z.string())]).optional().default([]),
  hints: z.array(z.string()).optional(),
  flag: z.string().min(1, 'Flag is required').trim(),
  difficulty: z.enum(difficulties).optional().default('easy'),
  category: z.string().min(1, 'Category is required').trim(),
  isActive: z.boolean().optional().default(true),
  commands: z.array(z.any()).optional().default([]),
  customCommands: z.array(z.any()).optional().default([]),
  commandTemplates: z.array(z.object({
    templateId: z.string(),
    values: z.record(z.any()).optional().default({}),
  })).optional().default([]),
  requiredCommandSequence: z.any().optional(),
  successCondition: z.string().optional(),
  initialDirectory: z.string().optional().default('/home/user'),
}).strict();

const updateCTFSchema = z.object({
  order: z.number().int().positive().optional(),
  title: z.string().min(1).trim().optional(),
  description: z.string().min(1).trim().optional(),
  hint: z.union([z.string(), z.array(z.string())]).optional(),
  hints: z.array(z.string()).optional(),
  flag: z.string().min(1).trim().optional(),
  difficulty: z.enum(difficulties).optional(),
  category: z.string().min(1).trim().optional(),
  isActive: z.boolean().optional(),
  commands: z.array(z.any()).optional(),
  customCommands: z.array(z.any()).optional(),
  commandTemplates: z.array(z.object({
    templateId: z.string(),
    values: z.record(z.any()).optional().default({}),
  })).optional(),
  requiredCommandSequence: z.any().optional(),
  successCondition: z.string().optional(),
  initialDirectory: z.string().optional(),
}).strict();

// Get all CTF level information
exports.getCTFInfo = async (req, res, next) => {
  try {
    // Fetch real data from database with all details
    const levels = await CTFLevel.findAll({
      where: { isActive: true },
      attributes: ['id', 'order', 'title', 'description', 'hint', 'difficulty', 'category'],
      order: [['category', 'ASC'], ['order', 'ASC']],
    });

    // Map database records to frontend format
    const ctfInfo = {
      levels: levels.map(level => ({
        id: level.id,
        order: level.order,
        name: level.title,
        description: level.description,
        hints: Array.isArray(level.hint) ? level.hint : [],
        category: level.category,
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

// Get all available CTF categories
exports.getCTFCategories = async (req, res, next) => {
  try {
    const levels = await CTFLevel.findAll({
      attributes: ['category'],
      where: { isActive: true },
      raw: true,
    });

    // Extract unique categories and count levels per category
    const categoryMap = new Map();
    levels.forEach(level => {
      if (!categoryMap.has(level.category)) {
        categoryMap.set(level.category, 0);
      }
      categoryMap.set(level.category, categoryMap.get(level.category) + 1);
    });

    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific CTF level info
exports.getCTFLevelInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const levelData = await CTFLevel.findOne({
      where: { id: parseInt(id), isActive: true },
      attributes: ['id', 'order', 'title', 'description', 'difficulty', 'category'],
    });

    if (!levelData) {
      return res.status(404).json({
        success: false,
        message: `CTF level with id ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: levelData.id,
        order: levelData.order,
        name: levelData.title,
        description: levelData.description,
        category: levelData.category,
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
    const { id } = req.params;
    const challenge = await CTFLevel.findOne({
      where: { id: parseInt(id), isActive: true },
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: `CTF challenge with id ${id} not found`,
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
        id: challenge.id,
        order: challenge.order,
        title: challenge.title,
        description: challenge.description,
        hints: challenge.hint,
        // flag: challenge.flag,  // ❌ لا نرسل الـ flag للـ frontend لأسباب أمنية
        difficulty: challenge.difficulty,
        category: challenge.category,
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
    const { id } = req.params;
    const challenge = await CTFLevel.findOne({
      where: { id: parseInt(id), isActive: true },
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: `CTF challenge with id ${id} not found`,
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
        id: challenge.id,
        order: challenge.order,
        title: challenge.title,
        description: challenge.description,
        hints: challenge.hint,
        // flag: challenge.flag,  // ❌ لا نرسل الـ flag للـ frontend لأسباب أمنية
        difficulty: challenge.difficulty,
        category: challenge.category,
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
      order: [['category', 'ASC'], ['order', 'ASC']],
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
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to create CTF levels'
      });
    }

    const parsed = createCTFSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    console.log(`[CTF_ADMIN] Admin ${req.user.email} creating new CTF level`);

    const data = parsed.data;

    const normalizedHints = Array.isArray(data.hints) ? data.hints : (data.hint && Array.isArray(data.hint) ? data.hint : (data.hint ? [data.hint] : []));

    let finalCommands = [];
    let storedCommandTemplates = [];
    let finalCustomCommands = Array.isArray(data.customCommands) ? JSON.parse(JSON.stringify(data.customCommands)) : [];
    if (Array.isArray(data.commandTemplates) && data.commandTemplates.length > 0) {
      storedCommandTemplates = data.commandTemplates.map((c) => ({ templateId: c.templateId, values: c.values || {} }));
    } else {
      finalCommands = Array.isArray(data.commands) ? JSON.parse(JSON.stringify(data.commands)) : [];
    }

    const existingLevel = await CTFLevel.findOne({ where: { category: data.category, order: data.order } });
    if (existingLevel) {
      return res.status(409).json({
        success: false,
        message: `CTF level with order ${data.order} in category "${data.category}" already exists`,
      });
    }

    const newLevel = await CTFLevel.create({
      order: data.order,
      title: data.title,
      description: data.description,
      hint: normalizedHints,
      flag: data.flag,
      difficulty: data.difficulty,
      category: data.category,
      isActive: data.isActive,
      commands: finalCommands,
      customCommands: finalCustomCommands,
      commandTemplates: storedCommandTemplates,
      requiredCommandSequence: data.requiredCommandSequence,
      successCondition: data.successCondition,
      initialDirectory: data.initialDirectory,
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
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to update CTF levels'
      });
    }

    console.log(`[CTF_ADMIN] Admin ${req.user.email} updating CTF level`);

    const { id } = req.params;

    const parsed = updateCTFSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const level = await CTFLevel.findByPk(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: `CTF level with ID ${id} not found`,
      });
    }

    const data = { ...parsed.data };

    if (data.hints !== undefined) {
      data.hint = data.hints;
      delete data.hints;
    }

    if (Array.isArray(data.commandTemplates) && data.commandTemplates.length > 0) {
      data.commandTemplates = data.commandTemplates.map((c) => ({ templateId: c.templateId, values: c.values || {} }));
      data.commands = [];
    }

    if (data.order !== undefined && data.order !== level.order) {
      const targetCategory = data.category || level.category;
      const existingLevel = await CTFLevel.findOne({ where: { category: targetCategory, order: data.order } });
      if (existingLevel && existingLevel.id !== level.id) {
        return res.status(409).json({
          success: false,
          message: `CTF level with order ${data.order} in category "${targetCategory}" already exists`,
        });
      }
    }

    await level.update(data);

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
    // ✓ SECURITY: Validate admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to delete CTF levels'
      });
    }

    console.log(`[CTF_ADMIN] Admin ${req.user.email} deleting CTF level`);

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
    // ✓ SECURITY: Validate admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to toggle CTF level status'
      });
    }

    console.log(`[CTF_ADMIN] Admin ${req.user.email} toggling CTF level status`);

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
      attributes: ['id', 'order', 'title', 'description', 'difficulty', 'category'],
      order: [['category', 'ASC'], ['order', 'ASC']],
    });

    const availableLevels = levels.map(level => ({
      id: level.id,
      order: level.order,
      name: level.title,
      description: level.description,
      category: level.category,
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