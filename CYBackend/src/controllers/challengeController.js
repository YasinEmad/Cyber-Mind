const Challenge = require('../models/Challenge');

exports.createChallenge = async (req, res) => {
  try {
    const challenge = new Challenge(req.body);
    await challenge.save();
    return res.status(201).json(challenge);
  } catch (error) {
    console.error('createChallenge error:', error);
    return res.status(400).json({ error: error.message });
  }
};

exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({}).sort({ points: -1 });
    return res.status(200).json(challenges);
  } catch (error) {
    console.error('getAllChallenges error:', error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    return res.status(200).json(challenge);
  } catch (error) {
    console.error('getChallengeById error:', error);
    return res.status(500).json({ error: error.message });
  }
};
