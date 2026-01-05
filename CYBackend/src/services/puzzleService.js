const Puzzle = require('../models/Puzzle');
const User = require('../models/User');
const userService = require('./userService'); // استدعاء السيرفيس التانية
const { getPointsForLevel } = require('../utils/points');

exports.validateAndAwardPoints = async (puzzleId, submittedAnswer, user) => {
  const puzzle = await Puzzle.findById(puzzleId).select('+answer tag level');
  if (!puzzle) throw new Error('Puzzle not found');

  const isCorrect = puzzle.answer.trim().toLowerCase() === submittedAnswer.trim().toLowerCase();
  if (!isCorrect) return { correct: false };

  if (!user) return { correct: true, guest: true };

  const puzzleIdStr = String(puzzle._id);
  const alreadySolved = user.solvedPuzzles?.some(sp => String(sp) === puzzleIdStr || sp === puzzle.tag);
  if (alreadySolved) return { correct: true, alreadySolved: true };

  // 1. تحديث قائمة الألغاز المحلولة في موديل اليوزر
  user.solvedPuzzles = user.solvedPuzzles || [];
  user.solvedPuzzles.push(puzzle._id);
  await user.save();

  // 2. حساب النقاط
  const parsedLevel = Number(puzzle.level) || 1;
  const awardedPointsAmount = getPointsForLevel(parsedLevel) || 10;

  // 3. نداء الوظيفة الموحدة من userService لزيادة النقاط
  await userService.addPointsToUser(user._id, awardedPointsAmount);

  // جلب بيانات اليوزر كاملة بعد التحديث
  const updatedUser = await User.findById(user._id).populate('profile');

  return {
    correct: true,
    alreadySolved: false,
    awardedPointsAmount,
    user: updatedUser
  };
};