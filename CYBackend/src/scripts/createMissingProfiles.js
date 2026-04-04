require('dotenv').config();
const { connectDB } = require('../config/db');
const { User, Profile } = require('../models');

const run = async () => {
  await connectDB();

  console.log('Scanning users to create missing profiles...');

  const users = await User.findAll();
  let created = 0;

  for (const user of users) {
    try {
      const existingProfile = await Profile.findOne({ where: { userId: user.id } });
      if (!existingProfile) {
        await Profile.create({ userId: user.id });
        created++;
        console.log(`Created profile for user ${user.id} (${user.email || 'no-email'})`);
      }
    } catch (err) {
      console.error(`Failed for user ${user.id}:`, err.message);
    }
  }

  console.log(`Migration complete. Profiles created: ${created}`);
  process.exit(0);
};

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
