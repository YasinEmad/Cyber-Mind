const { Puzzle, User, Profile } = require('../models');
const userService = require('./userService'); // استدعاء السيرفيس التانية
const { getPointsForLevel } = require('../utils/points');

exports.validateAndAwardPoints = async (puzzleId, submittedAnswer, user) => {
  const puzzle = await Puzzle.findByPk(puzzleId, { attributes: { include: ['answer', 'tag', 'level'] } });
  if (!puzzle) throw new Error('Puzzle not found');

  const isCorrect = puzzle.answer.trim().toLowerCase() === submittedAnswer.trim().toLowerCase();
  if (!isCorrect) return { correct: false };

  if (!user) return { correct: true, guest: true };

  const alreadySolved = user.solvedPuzzles?.includes(puzzleId);
  if (alreadySolved) return { correct: true, alreadySolved: true };

  // 1. تحديث قائمة الألغاز المحلولة في موديل اليوزر
  user.solvedPuzzles = user.solvedPuzzles || [];
  user.solvedPuzzles.push(puzzleId);
  await user.save();

  // 2. حساب النقاط
  const parsedLevel = Number(puzzle.level) || 1;
  const awardedPointsAmount = getPointsForLevel(parsedLevel) || 10;

  // 3. نداء الوظيفة الموحدة من userService لزيادة النقاط
  await userService.addPointsToUser(user.id, awardedPointsAmount);

  // جلب بيانات اليوزر كاملة بعد التحديث
  const updatedUser = await User.findByPk(user.id, { include: [{ model: Profile, as: 'profile' }] });

  return {
    correct: true,
    alreadySolved: false,
    awardedPointsAmount,
    user: updatedUser
  };
};