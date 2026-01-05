const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  photoURL: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
  solvedPuzzles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle'
  }],
}, { timestamps: true });

// Middleware: أوتوماتيك أول ما يوزر يتكريت بنعمله بروفايل ونربطه بيه
UserSchema.pre('save', async function (next) {
  if (this.isNew && !this.profile) {
    try {
      const Profile = mongoose.model('Profile');
      const profile = await Profile.create({ user: this._id });
      this.profile = profile._id;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);