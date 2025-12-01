const Puzzle = require('../models/Puzzle');

// @desc    Get all puzzles
// @route   GET /api/puzzles
// @access  Public
exports.getPuzzles = async (req, res) => {
  try {
    const puzzles = await Puzzle.find();
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

// @desc    Update an existing puzzle
// @route   PUT /api/puzzles/:id
// @access  Public (You might want to make this private/admin later)
exports.updatePuzzle = async (req, res) => {
  try {
    // If the tag is being changed, ensure the new tag doesn't collide with another puzzle
    if (req.body.tag) {
      const other = await Puzzle.findOne({ tag: req.body.tag, _id: { $ne: req.params.id } });
      if (other) {
        return res.status(400).json({ message: 'Tag already exists. Tags must be unique.' });
      }
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
    const puzzle = await Puzzle.findById(req.params.id).select('+answer tag');
    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }
    const { answer } = req.body;
    // req.user may or may not be present depending on whether the client
    // is authenticated. We allow unauthenticated (guest) submissions so that
    // visitors can attempt puzzles - only authenticated users get their
    // solved list and profile points updated.
    const user = req.user || null;
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
          return res.json({ correct: true, alreadySolved: true, awardedPoints: false, message: 'You have already solved this puzzle. No points awarded.' });
        }

        // First time solving
        user.solvedPuzzles = user.solvedPuzzles || [];
        // Store the puzzle _id (ObjectId) in solvedPuzzles rather than a free-form tag.
        user.solvedPuzzles.push(puzzle._id);

        // Award points (example: 10 points) if the user has a profile
        if (user.profile) {
          const Profile = require('../models/Profile');
          const profile = await Profile.findById(user.profile);
          if (profile) {
            // Update profile fields according to schema
            profile.totalScore = (profile.totalScore || 0) + 10;
            profile.puzzlesDone = (profile.puzzlesDone || 0) + 1;
            await profile.save();
          }
        }

        // persist user and return the updated user (including populated profile) so
        // clients can refresh their local state without hitting a second endpoint.
        await user.save();
        try {
          await user.populate('profile');
        } catch (popErr) {
          // populate isn't critical in tests / some runtime scenarios
        }
        return res.json({ correct: true, alreadySolved: false, awardedPoints: true, message: 'Correct answer! Points awarded.', user });
      }

      // Guest user: correct answer but no points/updates to persist
      console.info(`Puzzle ${puzzle._id} solved by guest (no auth) — no points awarded.`);
      return res.json({ correct: true, alreadySolved: false, awardedPoints: false, message: 'Correct answer! (Guest — no points awarded)' });
    } else {
      // Log incorrect attempts for telemetry (do not expose sensitive data)
      console.info(`Incorrect attempt for puzzle ${puzzle._id}`);
      return res.json({ correct: false, awardedPoints: false, message: 'Incorrect answer, please try again.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};