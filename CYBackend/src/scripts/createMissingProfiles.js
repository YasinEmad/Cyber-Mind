require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Profile = require('../models/Profile');

const run = async () => {
  await connectDB();

  console.log('Scanning users to create missing profiles...');

  const users = await User.find();
  let created = 0;

  for (const user of users) {
    try {
      let need = false;

      if (!user.profile) {
        need = true;
      } else {
        // If profile is an ObjectId or populated doc, check existence
        const profileId = user.profile._id ? user.profile._id : user.profile;
        const exists = await Profile.findById(profileId);
        if (!exists) need = true;
      }

      if (need) {
        const profile = new Profile({ user: user._id });
        await profile.save();
        user.profile = profile._id;
        await user.save();
        created++;
        console.log(`Created profile for user ${user._id} (${user.email || 'no-email'})`);
      }
    } catch (err) {
      console.error(`Failed for user ${user._id}:`, err.message);
    }
  }

  console.log(`Migration complete. Profiles created: ${created}`);
  process.exit(0);
};

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
