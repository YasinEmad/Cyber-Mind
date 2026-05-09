const { CTFLevel, CTFLevelCompletion, User, Profile } = require('../models');
const { expandTemplate } = require('./commandTemplateController');

// Helper function to calculate points based on difficulty
const calculatePoints = (difficulty) => {
  const pointMap = {
    easy: 10,
    medium: 25,
    hard: 50,
  };
  return pointMap[difficulty] || 10;
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
    const customCommands = Array.isArray(lvl.customCommands) ? lvl.customCommands : [];
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

    // Finally allow customCommands as additional level commands
    if (!matched && Array.isArray(customCommands) && customCommands.length > 0) {
      matched = customCommands.find((c) => {
        const stored = (c && c.name) ? String(c.name).trim() : '';
        return stored === full || stored === base;
      });
    }

    if (!matched) {
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

// Verify flag submission
exports.verifyFlag = async (req, res, next) => {
  try {
    const { level, flag } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (level === undefined || !flag) {
      return res.status(400).json({
        success: false,
        message: 'Level and flag are required',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get level data
    const levelData = await CTFLevel.findOne({
      where: { level: parseInt(level, 10), isActive: true },
    });

    if (!levelData) {
      return res.status(404).json({
        success: false,
        message: `CTF level ${level} not found`,
      });
    }

    // Get or create completion record
    let completion = await CTFLevelCompletion.findOne({
      where: { userId, level: parseInt(level, 10) },
    });

    if (!completion) {
      completion = await CTFLevelCompletion.create({
        userId,
        level: parseInt(level, 10),
        attempts: 0,
        flagSubmissions: [],
      });
    }

    // Increment attempts
    completion.attempts += 1;

    // Add submission record
    const submission = {
      flag: flag.substring(0, 50), // Store only first 50 chars for privacy
      timestamp: new Date(),
      isCorrect: false,
    };

    completion.flagSubmissions = Array.isArray(completion.flagSubmissions)
      ? completion.flagSubmissions
      : [];
    completion.flagSubmissions.push(submission);

    // Verify flag
    const isCorrect = flag.trim() === (levelData.flag || '').trim();

    if (isCorrect && !completion.isCompleted) {
      // Flag is correct and level not yet completed
      completion.isCompleted = true;
      completion.completedAt = new Date();

      // Calculate and award points
      const points = calculatePoints(levelData.difficulty);
      completion.pointsAwarded = points;

      // Update submission record
      submission.isCorrect = true;
      completion.flagSubmissions[completion.flagSubmissions.length - 1] = submission;

      // Update user profile
      const user = await User.findByPk(userId);
      let profile = await Profile.findOne({ where: { userId } });

      if (user && profile) {
        // Add to solvedChallenges if not already there
        if (!Array.isArray(user.solvedChallenges)) {
          user.solvedChallenges = [];
        }
        if (!user.solvedChallenges.includes(levelData.id)) {
          user.solvedChallenges.push(levelData.id);
        }

        // Add to solvedCTFLevels in User model
        if (!Array.isArray(user.solvedCTFLevels)) {
          user.solvedCTFLevels = [];
        }
        if (!user.solvedCTFLevels.includes(levelData.level)) {
          user.solvedCTFLevels.push(levelData.level);
        }
        
        await user.save();

        // Update profile stats - Award flags and points for CTF solve
        profile.flags = (profile.flags || 0) + 1;  // Increment flags counter
        profile.totalScore = (profile.totalScore || 0) + points;  // Award points based on difficulty
        profile.globalRank = Math.max(0, (profile.globalRank || 0) - 1);  // Improve rank
        
        // Add to solvedCTFLevels with level information (prevent duplicates)
        let solvedCTFLevels = profile.solvedCTFLevels;
        if (!Array.isArray(solvedCTFLevels)) {
          solvedCTFLevels = [];
        }
        
        const levelExists = solvedCTFLevels.some(l => l.levelId === levelData.id);
        if (!levelExists) {
          solvedCTFLevels.push({
            levelId: levelData.id,
            level: levelData.level,
            title: levelData.title,
            difficulty: levelData.difficulty,
            pointsAwarded: points,  // Award points based on difficulty
            completedAt: new Date().toISOString(),
          });
        }
        
        profile.solvedCTFLevels = solvedCTFLevels;
        profile.changed('solvedCTFLevels', true); // Mark field as changed for Sequelize
        await profile.save();
        
        // Reload profile to ensure we have fresh data from DB
        profile = await Profile.findByPk(profile.id);
      }

      // Save completion
      await completion.save();

      // Get all completed levels and user progress for frontend sync
      const allCompletions = await CTFLevelCompletion.findAll({
        where: { userId },
        attributes: ['level', 'isCompleted', 'attempts', 'pointsAwarded', 'completedAt'],
      });

      // Build completed levels array and progress map
      const completedLevels = allCompletions
        .filter(c => c.isCompleted)
        .map(c => c.level);

      const userProgress = {};
      allCompletions.forEach(c => {
        userProgress[c.level] = {
          isCompleted: c.isCompleted,
          attempts: c.attempts,
          pointsAwarded: c.pointsAwarded,
          completedAt: c.completedAt?.toISOString() || null,
        };
      });

      // Convert profile to JSON to ensure fresh data
      const profileJSON = profile.toJSON();

      // Return comprehensive response
      return res.status(200).json({
        success: true,
        message: '🎉 Flag صحيح! تم إكمال المستوى بنجاح',
        isCorrect: true,
        isCompleted: true,
        pointsAwarded: points,  // Return actual points awarded based on difficulty
        attempts: completion.attempts,
        // Additional data for frontend state sync
        updatedProfile: {
          flags: profileJSON.flags,
          totalScore: profileJSON.totalScore,
          globalRank: profileJSON.globalRank,
          solvedCTFLevels: Array.isArray(profileJSON.solvedCTFLevels) ? profileJSON.solvedCTFLevels : [],
        },
        completedLevels: completedLevels,
        userProgress: userProgress,
      });
    } else if (isCorrect && completion.isCompleted) {
      // Flag is correct but level already completed
      submission.isCorrect = true;
      completion.flagSubmissions[completion.flagSubmissions.length - 1] = submission;
      await completion.save();

      return res.status(200).json({
        success: true,
        message: 'Flag صحيح! لكن هذا المستوى قد تم إكماله بالفعل',
        isCorrect: true,
        isCompleted: completion.isCompleted,
        pointsAwarded: 0,  // Don't award points for already-completed levels
        attempts: completion.attempts,
      });
    } else {
      // Flag is incorrect
      await completion.save();

      return res.status(200).json({
        success: false,
        message: '❌ Flag غير صحيح. حاول مرة أخرى!',
        isCorrect: false,
        attempts: completion.attempts,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get user progress for a level
exports.getUserLevelProgress = async (req, res, next) => {
  try {
    const { level } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const completion = await CTFLevelCompletion.findOne({
      where: { userId, level: parseInt(level, 10) },
      attributes: ['isCompleted', 'attempts', 'pointsAwarded', 'completedAt'],
    });

    return res.status(200).json({
      success: true,
      data: completion || {
        isCompleted: false,
        attempts: 0,
        pointsAwarded: 0,
        completedAt: null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all completed levels for user
exports.getUserCompletedLevels = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const completions = await CTFLevelCompletion.findAll({
      where: { userId, isCompleted: true },
      attributes: ['level', 'attempts', 'pointsAwarded', 'completedAt'],
      order: [['completedAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: completions,
    });
  } catch (error) {
    next(error);
  }
};