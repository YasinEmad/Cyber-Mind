const connectDB = require('../config/db');
const Puzzle = require('../models/Puzzle');

const run = async () => {
  await connectDB();
  console.log('Scanning puzzles for missing/invalid level...');
  const puzzles = await Puzzle.find();
  let fixed = 0;
  for (const p of puzzles) {
    const lvl = p.level;
    if (typeof lvl === 'undefined' || lvl === null || Number.isNaN(Number(lvl))) {
      p.level = 1;
      try {
        await p.save();
        fixed++;
        console.log(`Fixed puzzle ${p._id} — set level to 1`);
      } catch (err) {
        console.error(`Failed to fix puzzle ${p._id}:`, err.message || err);
      }
    }
  }

  console.log(`Completed. Puzzles scanned: ${puzzles.length}. Fixed: ${fixed}.`);
  process.exit(0);
};

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});