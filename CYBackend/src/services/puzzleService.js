const { Puzzle, User, Profile } = require('../models');
const userService = require('./userService'); // استدعاء السيرفيس التانية
const { getPointsForLevel } = require('../utils/points');

// Function to generate tags automatically
function generateTags(puzzleData) {
  const tags = new Set();

  // Add category as tag
  if (puzzleData.category) {
    tags.add(puzzleData.category.toLowerCase().trim());
  }

  // Add words from title
  if (puzzleData.title) {
    const titleWords = puzzleData.title.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    titleWords.forEach(word => tags.add(word));
  }

  // Add level as tag
  if (puzzleData.level) {
    tags.add(`level-${puzzleData.level}`);
  }

  // Optionally add keywords from description (simple: split and filter)
  if (puzzleData.description) {
    const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'by', 'word', 'but', 'what', 'some', 'we', 'can', 'out', 'other', 'were', 'all', 'there', 'when', 'up', 'use', 'your', 'how', 'said', 'each', 'which', 'she', 'do', 'their', 'time', 'if', 'will', 'way', 'about', 'many', 'then', 'them', 'write', 'would', 'like', 'so', 'these', 'her', 'long', 'make', 'thing', 'see', 'him', 'two', 'has', 'look', 'more', 'day', 'could', 'go', 'come', 'did', 'number', 'sound', 'no', 'most', 'people', 'my', 'over', 'know', 'water', 'than', 'call', 'first', 'who', 'may', 'down', 'side', 'been', 'now', 'find'];
    const descWords = puzzleData.description.toLowerCase().split(/\s+/).filter(word => word.length > 3 && !stopWords.includes(word));
    descWords.slice(0, 5).forEach(word => tags.add(word)); // limit to 5
  }

  return Array.from(tags);
}

exports.generateTags = generateTags;

exports.validateAndAwardPoints = async (puzzleId, submittedAnswer, user) => {
  const puzzle = await Puzzle.findByPk(puzzleId, { attributes: { include: ['answer', 'tags', 'level'] } });
  if (!puzzle) throw new Error('Puzzle not found');

  const isCorrect = puzzle.answer.trim().toLowerCase() === submittedAnswer.trim().toLowerCase();
  if (!isCorrect) return { correct: false };

  if (!user) return { correct: true, guest: true };

  const alreadySolved = user.profile?.solvedPuzzles?.includes(puzzleId) || false;
  if (alreadySolved) return { correct: true, alreadySolved: true };

  // 1. حساب النقاط
  const parsedLevel = Number(puzzle.level) || 1;
  const awardedPointsAmount = getPointsForLevel(parsedLevel) || 10;

  // 2. نداء الوظيفة الموحدة من userService لزيادة النقاط وتحديث القوائم
  await userService.addPointsToUser(user.id, awardedPointsAmount, puzzleId, 'puzzle');

  // 3. تسجيل الإنجاز في السجلات
  console.log(`[PUZZLE SERVICE] First-time solve: User ${user.id} solved Puzzle #${puzzleId} and earned ${awardedPointsAmount} points`);

  // جلب بيانات اليوزر كاملة بعد التحديث
  const updatedUser = await User.findByPk(user.id, { 
    include: [{ model: Profile, as: 'profile' }],
    attributes: { include: ['solvedPuzzles', 'solvedChallenges'] }
  });

  return {
    correct: true,
    alreadySolved: false,
    awardedPointsAmount,
    user: updatedUser
  };
};