const Puzzle = require('../models/Puzzle');

// @desc    Get all puzzles
// @route   GET /api/puzzles
// @access  Public
exports.getPuzzles = async (req, res) => {
  try {
    const puzzles = await Puzzle.find();
    try {
      console.debug(`GET /api/puzzles — total: ${puzzles.length}`);
      puzzles.forEach(p => {
        try { console.debug(`puzzle ${String(p._id)} level=${p.level} typeof=${typeof p.level}`); } catch (e) {}
        if (typeof p.level !== 'number' || ![1,2,3].includes(Number(p.level))) {
          console.warn(`Puzzle ${String(p._id)} has invalid level: (${p.level}) typeof ${typeof p.level}`);
        }
      });
    } catch (e) {}

    res.json(puzzles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single puzzle
// @route   GET /api/puzzles/:id
// @access  Public
exports.getPuzzleById = async (req, res) => {
  try {
    // --- SECURITY FIX: Removed .select('+answer') ---
    // We do NOT want to send the answer to the frontend here,
    // otherwise users can cheat by looking at the network tab.
    const puzzle = await Puzzle.findById(req.params.id);
    
    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }
    res.json(puzzle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new puzzle
// @route   POST /api/puzzles
// @access  Public (You might want to make this private/admin later)
exports.createPuzzle = async (req, res) => {
  try {
    // Log/coerce level if present
    if (typeof req.body.level !== 'undefined' && req.body.level !== null) {
      try { console.debug('createPuzzle: incoming level:', req.body.level, 'typeof:', typeof req.body.level); } catch (e) {}
      req.body.level = Number(req.body.level);
      try { console.debug('createPuzzle: coerced level:', req.body.level, 'typeof:', typeof req.body.level); } catch (e) {}
    }

    // If a tag is provided make sure it's unique — the schema also has a unique index,
    // but checking early lets us return a friendlier error message.
    if (req.body.tag) {
      const existing = await Puzzle.findOne({ tag: req.body.tag });
      if (existing) {
        return res.status(400).json({ message: 'Tag already exists. Tags must be unique.' });
      }
    }

    const puzzle = await Puzzle.create(req.body);
    res.status(201).json(puzzle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Update: coerce and validate level for update route
exports.updatePuzzle = async (req, res) => {
  try {
    // If the tag is being changed, ensure the new tag doesn't collide with another puzzle
    if (req.body.tag) {
      const other = await Puzzle.findOne({ tag: req.body.tag, _id: { $ne: req.params.id } });
      if (other) {
        return res.status(400).json({ message: 'Tag already exists. Tags must be unique.' });
      }
    }

    // Log/coerce level if present on update — validate strictly to avoid accidental unsets
    if (typeof req.body.level !== 'undefined' && req.body.level !== null) {
      try { console.debug('updatePuzzle: incoming level:', req.body.level, 'typeof:', typeof req.body.level); } catch (e) {}
      const coerced = Number(req.body.level);
      if (!Number.isInteger(coerced) || ![1,2,3].includes(coerced)) {
        return res.status(400).json({ message: 'Level must be 1, 2, or 3' });
      }
      req.body.level = coerced;
      try { console.debug('updatePuzzle: validated level:', req.body.level, 'typeof:', typeof req.body.level); } catch (e) {}
    }

    const puzzle = await Puzzle.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    res.json(puzzle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Duplicate update handler removed — consolidated logic above to ensure level coercion/validation is always applied


// @desc    Delete a puzzle
// @route   DELETE /api/puzzles/:id
// @access  Public (You might want to make this private/admin later)
exports.deletePuzzle = async (req, res) => {
  try {
    const puzzle = await Puzzle.findByIdAndDelete(req.params.id);

    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    res.json({ message: 'Puzzle removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Submit an answer to a puzzle
// @route   POST /api/puzzles/:id/submit
// @access  Public
exports.submitAnswer = async (req, res) => {
  try {
    // We need the answer for verification and the id to uniquely track solved puzzles.
    // Note: do NOT return the answer in the API response to clients elsewhere.
    // Ensure we explicitly include puzzle.level so it can't be accidentally omitted by select projections
    const puzzle = await Puzzle.findById(req.params.id).select('+answer tag level');
    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    const { answer } = req.body;
    // req.user may or may not be present depending on whether the client
    // is authenticated. We allow unauthenticated (guest) submissions so that
    // visitors can attempt puzzles - only authenticated users get their
    // solved list and profile points updated.
    const user = req.user || null;
    // Track awarded points amount, whether points were awarded, and potential warnings
    let awardedPointsAmount = 0;
    let awardedPoints = false;
    let awardedPointsWarning = null;

    // Check answer
    if (puzzle.answer.trim().toLowerCase() === answer.trim().toLowerCase()) {
      // If user is authenticated, update their solved list and award points.
      if (user) {
        // Check if already solved by comparing the puzzle _id (more robust than tag)
        const puzzleIdStr = String(puzzle._id);
        const puzzleTag = puzzle.tag;
        // Accept both historical tag records and the newer objectId references when
        // checking whether a puzzle has already been solved. This helps with gradual
        // migration of user data.
        if (user.solvedPuzzles && user.solvedPuzzles.some(sp => String(sp) === puzzleIdStr || sp === puzzleTag)) {
          // Already solved — return a consistent payload shape (no DB updates)
          return res.json({
            correct: true,
            alreadySolved: true,
            awardedPoints: false,
            awardedPointsAmount: 0,
            user,
            warning: awardedPointsWarning || undefined,
            message: 'You have already solved this puzzle. No points awarded.'
          });
        }

        // First time solving
        user.solvedPuzzles = user.solvedPuzzles || [];
        // Store the puzzle _id (ObjectId) in solvedPuzzles rather than a free-form tag.
        user.solvedPuzzles.push(puzzle._id);

        // Award points (example: 10 points) if the user has a profile
        if (user.profile) {
          const Profile = require('../models/Profile');
          // user.profile may be either an ObjectId, a stub object, or a populated document.
          let profile = user.profile;
          if (typeof profile === 'string') {
            profile = await Profile.findById(profile);
          } else if (profile && typeof profile === 'object' && typeof profile.save !== 'function' && profile._id) {
            // fetch full profile document
            profile = await Profile.findById(profile._id);
          }

          // If puzzle level is missing in DB, log a warning, default to 1 and persist the fix so submissions continue
          if (typeof puzzle.level === 'undefined' || puzzle.level === null || Number.isNaN(Number(puzzle.level))) {
            const warning = `Missing level for puzzle ${puzzle._id} — defaulting to 1 and persisting fix`;
            console.error(warning);
            // Default to level 1 so awarding can continue; attempt to persist the fix
            try {
              puzzle.level = 1;
              await puzzle.save();
            } catch (saveErr) {
              console.error('Failed to persist default level for puzzle', String(puzzle._id), saveErr);
            }
            // attach a warning so it can be included in the response
            awardedPointsWarning = awardedPointsWarning || warning;
          }

          if (profile) {
                // Determine points to award based on puzzle level
                // Level 1 => 10, Level 2 => 15, Level 3 => 20
                // Use centralized helper so backend uses same mapping everywhere
                const { getPointsForLevel } = require('../utils/points');
                // Debug info to help diagnose cases where level lookup unexpectedly falls back to default
                try {
                  console.log('award-points: submit req.params.id:', req.params.id, 'puzzle._id:', String(puzzle._id));
                  console.log('award-points: puzzle.level:', puzzle.level, 'typeof:', typeof puzzle.level);
                  console.log('award-points: puzzle doc snapshot:', JSON.stringify(puzzle, null, 2));
                } catch (e) {}
                // Compute a numeric parsedLevel first and use it for lookup to avoid accidental string/undefined differences
                const parsedLevel = Number(puzzle.level);
                // Use strict lookup so we can detect missing/unknown level mappings
                try {
                  const snapshot = require('../utils/points').levelToPoints;
                  const pointsFromUtil = require('../utils/points').getPointsForLevel(parsedLevel, { strict: true });
                  console.log('award-points: mappingSnapshot:', snapshot, 'utilResultStrict:', pointsFromUtil);
                } catch (e) {}

                const pointsStrict = getPointsForLevel(parsedLevel, { strict: true });
                let points = pointsStrict;
                let warning = null;
                if (pointsStrict === null) {
                  // Unknown mapping detected — log and default to 0 (do not silently award DEFAULT_POINTS)
                  warning = `Unknown level mapping for puzzle ${puzzle._id}: levelRaw=${puzzle.level} parsed=${parsedLevel}`;
                  console.error(warning);
                  points = 0;
                }

                console.log('award-points: computed values -> pointsStrict:', pointsStrict, 'finalPoints:', points, 'parsedLevel:', parsedLevel);
                awardedPointsAmount = points;

                // Update profile fields according to schema
                try {
                  console.log('award-points: profile before update:', { id: String(profile._id), totalScore: profile.totalScore, puzzlesDone: profile.puzzlesDone });
                } catch (e) {}
                profile.totalScore = (profile.totalScore || 0) + points;
                profile.puzzlesDone = (profile.puzzlesDone || 0) + 1;
                await profile.save();
                try {
                  console.log('award-points: profile after update:', { id: String(profile._id), totalScore: profile.totalScore, puzzlesDone: profile.puzzlesDone });
                } catch (e) {}

                // mark that points were awarded (even if zero due to unknown mapping)
                awardedPoints = true;

                console.log('award-points: awardedPointsAmount:', awardedPointsAmount, 'awardedPoints:', awardedPoints);

                if (warning) {
                  // attach warning to the response via a local variable (response construction later will include it)
                  awardedPointsWarning = warning;
                }
              }
        }

        // persist user
        await user.save();

        // Fetch a fresh copy of the user from the database with the updated profile
        // and include that in the response. This ensures clients always receive the
        // most up-to-date profile values (avoids returning a potentially stale
        // `req.user` object depending on how it was populated).
        try {
          const User = require('../models/User');
          const updatedUser = await User.findById(user._id).populate('profile');
          const payload = {
            correct: true,
            alreadySolved: false,
            awardedPoints: awardedPoints,
            awardedPointsAmount,
            awardedPointsInfo: { puzzleLevel: Number(puzzle.level), computedPoints: awardedPointsAmount },
            awardedPointsWarning: awardedPointsWarning || undefined,
            warning: awardedPointsWarning || undefined,
            message: 'Correct answer! Points awarded.',
            user: updatedUser
          };
          try { console.log('SUBMIT_PAYLOAD (success):', payload); } catch (e) {}
          return res.json(payload);
        } catch (fetchErr) {
          // If fetching fails for any reason, fall back to returning the in-memory user
          // (populating it if possible) so the success path still works.
          try {
            if (user && typeof user.populate === 'function') {
              await user.populate('profile');
            }
          } catch (popErr) {}
          const payload = {
            correct: true,
            alreadySolved: false,
            awardedPoints: awardedPoints,
            awardedPointsAmount,
            awardedPointsInfo: { puzzleLevel: Number(puzzle.level), computedPoints: awardedPointsAmount },
            awardedPointsWarning: awardedPointsWarning || undefined,
            warning: awardedPointsWarning || undefined,
            message: 'Correct answer! Points awarded.',
            user
          };
          try { console.log('SUBMIT_PAYLOAD (fallback):', payload); } catch (e) {}
          return res.json(payload);
        }
      }

      // Guest user: correct answer but no points/updates to persist
      console.info(`Puzzle ${puzzle._id} solved by guest (no auth) — no points awarded.`);
      return res.json({
        correct: true,
        alreadySolved: false,
        awardedPoints: false,
        awardedPointsAmount: 0,
        user: null,        warning: undefined,        message: 'Correct answer! (Guest — no points awarded)'
      });
    } else {
      // Log incorrect attempts for telemetry (do not expose sensitive data)
      console.info(`Incorrect attempt for puzzle ${puzzle._id}`);
      return res.json({
        correct: false,
        alreadySolved: false,
        awardedPoints: false,
        awardedPointsAmount: 0,
        user: user || null,        warning: undefined,        message: 'Incorrect answer, please try again.'
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};