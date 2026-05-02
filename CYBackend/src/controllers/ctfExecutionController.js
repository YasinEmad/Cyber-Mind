const { CTFLevel } = require('../models');
const { expandTemplate } = require('./commandTemplateController');

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