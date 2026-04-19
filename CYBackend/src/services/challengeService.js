const { Challenge } = require('../models');
const userService = require('./userService');
const aiService = require('./aiService');
const { CHALLENGE_POINTS } = require('../utils/challingesPoints');

exports.submitChallengeAnswer = async (challengeId, user, userAnswer) => {
  // 1. نجيب التحدي ومعاه الـ solution
  const challenge = await Challenge.findByPk(challengeId);
  if (!challenge) throw new Error('Challenge not found');

  let isCorrect = false;
  let pointsToAward = 0;
  let feedback = '';

  // Check if this is a security challenge (has initialCode)
  if (challenge.initialCode) {
    console.log('Evaluating security challenge with AI...');
    // Use AI evaluation for security challenges
    const evaluation = await aiService.evaluateSecurityFix(challenge, userAnswer);
    console.log('AI evaluation result:', evaluation);
    isCorrect = evaluation.fixed;
    feedback = evaluation.feedback;
    
    // Set points based on level for security challenges
    const levelPoints = { easy: 100, medium: 200, hard: 300 };
    pointsToAward = isCorrect ? (levelPoints[challenge.level] || 0) : 0;
  } else {
    // Original validation logic for non-security challenges
    if (!challenge.solution) {
      isCorrect = false;
      console.warn(`Challenge ${challengeId} has no solution configured; answer cannot be validated.`);
    } else if (challenge.validationType === 'regex') {
      try {
        const pattern = challenge.solution;
        const regex = new RegExp(pattern, 'i');
        isCorrect = regex.test(userAnswer.trim());
        console.log(`Checking Answer: "${userAnswer}" against Pattern: "${pattern}" -> Result: ${isCorrect}`);
      } catch (e) {
        console.error('Regex Error:', e);
        isCorrect = false;
      }
    } else {
      isCorrect = challenge.solution === userAnswer.trim();
    }

    // 3. لو الإجابة صح، نحدد النقط
    pointsToAward = challenge.points || CHALLENGE_POINTS[challenge.level.toUpperCase()] || 0;
  }

  let awarded = false;
  let alreadySolved = false;
  let message = feedback || 'Brilliant! You solved it correctly!';

  console.log('Challenge evaluation:', { isCorrect, feedback, message });

  // 4. ندي النقط لليوزر (الـ userService هيتكفل بمنع التكرار)
  if (user && isCorrect) {
    const result = await userService.addPointsToUser(user.id, pointsToAward, challengeId, 'challenge');
    awarded = result.awarded;
    alreadySolved = result.alreadySolved || false;
    if (!awarded) {
      message = feedback || (alreadySolved ? 'Correct, but you have already earned points for this challenge.' : 'Correct, but points could not be awarded.');
    }
  } else if (!user && isCorrect) {
    message = feedback || 'Correct! Log in to save your progress and earn points.';
  } else if (!isCorrect) {
    message = feedback || 'Incorrect answer. Try again!';
    console.log('Incorrect answer, final message:', message);
  }

  console.log('Final result:', { success: isCorrect, awarded, alreadySolved, points: awarded ? pointsToAward : 0, message });

  return { success: isCorrect, awarded, alreadySolved, points: awarded ? pointsToAward : 0, message };
};