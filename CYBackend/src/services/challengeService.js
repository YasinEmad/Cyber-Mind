const Challenge = require('../models/Challenge');
const userService = require('./userService');
const { CHALLENGE_POINTS } = require('../utils/challingesPoints');

exports.submitChallengeAnswer = async (challengeId, user, userAnswer) => {
  // 1. نجيب التحدي ومعاه الـ solution (عشان إحنا عاملينه select: false في الموديل)
  const challenge = await Challenge.findById(challengeId).select('+solution');
  if (!challenge) throw new Error('Challenge not found');

  // 2. التحقق من الإجابة (Validation Logic)
  // 2. التحقق من الإجابة (Validation Logic)
  let isCorrect = false;
  
  if (challenge.validationType === 'regex') {
    try {
      // بنستخدم Regex مرن يلقط الكلمة حتى لو وسط كود تاني
      const pattern = challenge.solution; 
      const regex = new RegExp(pattern, 'i'); 
      
      // بنعمل trim لليوزر عشان لو فيه سطر زيادة أو مسافة
      isCorrect = regex.test(userAnswer.trim());
      
      // ديباج عشان تشوف المشكلة فين بالظبط في الـ Console عندك
      console.log(`Checking Answer: "${userAnswer}" against Pattern: "${pattern}" -> Result: ${isCorrect}`);
      
    } catch (e) {
      console.error("Regex Error:", e);
      isCorrect = false;
    }
  } else {
    isCorrect = challenge.solution === userAnswer.trim();
  }

  // 3. لو الإجابة صح، نحدد النقط
  const pointsToAward = challenge.points || CHALLENGE_POINTS[challenge.level.toUpperCase()] || 0;

  let awarded = false;
  let message = 'Brilliant! You solved it correctly!';

  // 4. ندي النقط لليوزر (الـ userService هيتكفل بمنع التكرار)
  if (user) {
    const result = await userService.addPointsToUser(user._id, pointsToAward, challengeId, 'challenge');
    awarded = result.awarded;
    if (!awarded) message = 'Correct, but you have already earned points for this challenge.';
  } else {
    message = 'Correct! Log in to save your progress and earn points.';
  }

  return { awarded, points: awarded ? pointsToAward : 0, message };
};