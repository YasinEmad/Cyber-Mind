// Load environment variables before loading models (so DB URL is available)
require('dotenv').config();
const { CTFLevel } = require('../models');
const ctfLevels = require('../data/ctfLevels');
const ctfInfo = require('../data/ctfinfo');

const seedCTFLevels = async () => {
  try {
    console.log('Seeding CTF levels...');

    // Clear existing levels
    await CTFLevel.destroy({ where: {} });

    // Seed levels from existing data
    for (const [levelNum, challenge] of Object.entries(ctfLevels)) {
      const level = parseInt(levelNum);
      const info = ctfInfo.levels.find(l => l.level === level);

      // Create basic commands based on the challenge type
      let commands = [];

      // Add some default commands based on challenge
      if (level === 1) {
        commands = [
          {
            name: 'ls',
            output: 'Desktop Documents Downloads .hidden_flag.txt',
            description: 'Lists directory contents including hidden files',
            // ls allowed in user and desktop
            allowedPaths: ['/home/user', '/home/user/Desktop', '/home/user/Documents'],
          },
          {
            name: 'ls -a',
            output: '. .. Desktop Documents Downloads .hidden_flag.txt',
            description: 'Lists all directory contents',
            allowedPaths: ['/home/user', '/home/user/Desktop'],
          },
          {
            name: 'cat .hidden_flag.txt',
            output: 'CTF{navigation_master}',
            description: 'Displays the contents of the hidden flag file',
            allowedPaths: ['/home/user/Desktop'],
          },
        ];
      } else if (level === 2) {
        commands = [
          {
            name: 'ls -l',
            output: '-rw------- 1 user user 23 Nov 15 10:00 .restricted.txt',
            description: 'Shows file permissions and details',
            allowedPaths: ['/home/user/Documents'],
          },
          {
            name: 'cat .restricted.txt',
            output: 'CTF{permission_explorer}',
            description: 'Displays the contents of the restricted file',
            allowedPaths: ['/home/user/Documents'],
            blockedPaths: ['/etc'],
          },
        ];
      } else if (level === 3) {
        commands = [
          {
            name: 'env',
            output: 'USER=user\nHOME=/home/user\nSHELL=/bin/bash\nSECRET_FLAG=CTF{env_secrets}',
            description: 'Displays environment variables',
            // no path rules -> allowed everywhere
          },
          {
            name: 'echo $SECRET_FLAG',
            output: 'CTF{env_secrets}',
            description: 'Displays the value of SECRET_FLAG environment variable',
          },
        ];
      }

      await CTFLevel.create({
        level,
        title: info?.name || `Level ${level}`,
        description: challenge.description,
        hint: info?.hints || [challenge.hint],
        flag: challenge.flag,
        difficulty: info?.difficulty || 'easy',
        isActive: true,
        commands,
        initialDirectory: '/home/user',
      });

      console.log(`Seeded level ${level}`);
    }

    console.log('CTF levels seeded successfully!');
  } catch (error) {
    console.error('Error seeding CTF levels:', error);
  }
};

module.exports = seedCTFLevels;

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const { connectDB } = require('../config/db');

  connectDB().then(() => {
    seedCTFLevels().then(() => {
      process.exit(0);
    });
  });
}