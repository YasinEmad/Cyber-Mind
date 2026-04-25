const { Challenge } = require('../models');
const userService = require('./userService');
const aiService = require('./aiService');
const { CHALLENGE_POINTS } = require('../utils/challingesPoints');

exports.submitChallengeAnswer = async (challengeId, user, userAnswer) => {
  // 1. نجيب التحدي ومعاه الـ solution
  const challenge = await Challenge.findByPk(challengeId);
  if (!challenge) throw new Error('Challenge not found');

  console.log(`[CHALLENGE SERVICE] Processing submission for Challenge ID: ${challengeId}`);

  let isCorrect = false;
  let pointsToAward = 0;
  let feedback = '';

  // Check if this is a security challenge (has initialCode)
  if (challenge.initialCode) {
    console.log('[CHALLENGE SERVICE] Evaluating security challenge with AI...');
    // Use AI evaluation for security challenges
    const evaluation = await aiService.evaluateSecurityFix(challenge, userAnswer);
    console.log('[CHALLENGE SERVICE] AI evaluation result:', evaluation);
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
        console.log(`[VALIDATION] Challenge: ${challengeId}, Pattern: "${pattern}", Result: ${isCorrect}`);
      } catch (e) {
        console.error('[VALIDATION ERROR]', e);
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

  // 4. ندي النقط لليوزر (يتم التحقق من عدم الحل من قبل)
  if (user && isCorrect) {
    console.log(`[POINTS] Attempting to award ${pointsToAward} points for Challenge #${challengeId} to User ${user.id}`);
    const result = await userService.addPointsToUser(user.id, pointsToAward, challengeId, 'challenge');
    awarded = result.awarded;
    alreadySolved = result.alreadySolved || false;
    
    if (!awarded && alreadySolved) {
      message = feedback || 'Correct, but you have already earned points for this challenge.';
      console.log(`[POINTS] User ${user.id} already solved Challenge #${challengeId} before`);
    } else if (!awarded) {
      message = feedback || 'Correct, but points could not be awarded.';
      console.log(`[POINTS] Failed to award points for Challenge #${challengeId}`);
    } else {
      console.log(`[POINTS SUCCESS] User ${user.id} earned ${pointsToAward} points for Challenge #${challengeId}`);
    }
  } else if (!user && isCorrect) {
    message = feedback || 'Correct! Log in to save your progress and earn points.';
    console.log(`[INFO] Anonymous user solved Challenge #${challengeId} (no points awarded)`);
  } else if (!isCorrect) {
    message = feedback || 'Incorrect answer. Try again!';
    console.log(`[INFO] Incorrect answer for Challenge #${challengeId}`);
  }

  return { success: isCorrect, awarded, alreadySolved, points: awarded ? pointsToAward : 0, message };
};

const vm = require('vm');

exports.runCode = async (challengeId, code) => {
  try {
    // Get the challenge to ensure it exists
    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    // Create a sandbox context
    const sandbox = {
      console: {
        log: (...args) => {
          // Capture console.log output
          if (!sandbox._output) sandbox._output = [];
          sandbox._output.push(args.join(' '));
        },
        error: (...args) => {
          if (!sandbox._output) sandbox._output = [];
          sandbox._output.push('ERROR: ' + args.join(' '));
        },
        warn: (...args) => {
          if (!sandbox._output) sandbox._output = [];
          sandbox._output.push('WARN: ' + args.join(' '));
        }
      },
      _output: []
    };

    // Run the code in the sandbox with timeout
    const script = new vm.Script(code);
    const context = vm.createContext(sandbox);
    
    // Run with timeout to prevent infinite loops
    await Promise.race([
      script.runInContext(context),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Code execution timed out')), 5000)
      )
    ]);

    // Return the captured output
    return { output: sandbox._output.join('\n'), error: null };
  } catch (error) {
    return { output: '', error: error.message };
  }
};