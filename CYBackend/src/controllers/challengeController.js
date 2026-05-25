const { Challenge } = require('../models');
const challengeService = require('../services/challengeService');
// التعديل هنا: بننادي على الفانكشن اللي هنستخدمها تحت
const { getPointsForDifficulty } = require('../utils/challingesPoints');
const userService = require('../services/userService');
const aiService = require('../services/aiService');

// 1. عرض كل التحديات
exports.getAllChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: challenges });
  } catch (error) { next(error); }
};

// 2. عرض تحدي واحد بالـ ID
exports.getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    res.status(200).json({ success: true, data: challenge });
  } catch (error) { next(error); }
};

// 3. إضافة تحدي جديد
exports.createChallenge = async (req, res, next) => {
  try {
    // For security challenges (with initialCode), ensure level is set
    let body = { ...req.body };
    if (body.initialCode && !body.level) {
      body.level = 'medium'; // Default security challenges to medium difficulty
      console.log('[CHALLENGE CREATE] Security challenge without level, defaulting to "medium"');
    }
    
    // Calculate points based on difficulty level
    const points = getPointsForDifficulty(body.level);
    
    const challenge = await Challenge.create({ ...body, points });
    console.log(`[CHALLENGE CREATE] Challenge created: ID=${challenge.id}, level=${challenge.level}, points=${challenge.points}`);
    
    res.status(201).json({ success: true, data: challenge });
  } catch (error) { next(error); }
};

// 4. تسليم الحل
// 4. تسليم الحل (بعد التعديل لاستقبال الإجابة)
// يتم التحقق من أن المستخدم لم يحل هذا التحدي من قبل
// عند النجاح لأول مرة فقط: تتم إضافة النقاط و تسجيل التحدي كمحلول
exports.submitAnswer = async (req, res, next) => {
  try {
    const challengeId = req.params.id;
    const { answer } = req.body;

    console.log(`[SUBMISSION] User: ${req.user?.id || 'anonymous'}, Challenge ID: ${challengeId}`);

    if (!answer) {
      return res.status(400).json({ success: false, message: 'Please provide an answer' });
    }

    // بنبعت الـ ID، اليوزر (عشان النقط)، والحل (عشان التقييم)
    const result = await challengeService.submitChallengeAnswer(challengeId, req.user, answer);
    
    console.log(`[SUBMISSION RESULT] Challenge: ${challengeId}, Success: ${result.success}, Awarded: ${result.awarded}, AlreadySolved: ${result.alreadySolved}`);
    
    res.status(200).json({ success: true, ...result });
  } catch (error) { 
    next(error); 
  }
};

// Deduct points when a user requests a challenge hint
exports.useChallengeHint = async (req, res, next) => {
  try {
    const challengeId = req.params.id;
    const { hintIndex, amount } = req.body;

    if (!challengeId || challengeId === 'undefined' || isNaN(challengeId)) {
      return res.status(400).json({ success: false, message: 'Invalid challenge ID provided' });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to use hints' });
    }

    const parsedHintIndex = Number(hintIndex);
    if (!Number.isInteger(parsedHintIndex) || parsedHintIndex < 0) {
      return res.status(400).json({ success: false, message: 'Invalid hint index' });
    }

    const deductionAmount = Math.max(0, Number(amount) || 0);
    if (deductionAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid hint deduction amount' });
    }

    const result = await userService.deductHintPoints(req.user.id, deductionAmount, challengeId, 'challenge', parsedHintIndex);

    res.status(200).json({
      success: true,
      deducted: result.deducted,
      alreadyUsed: result.alreadyUsed,
      totalScore: result.totalScore,
      usedHints: result.usedHints,
    });
  } catch (error) {
    next(error);
  }
};

// 4.5. تشغيل الكود
exports.runCode = async (req, res, next) => {
  try {
    const challengeId = req.params.id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide code to run' });
    }

    const result = await challengeService.runCode(challengeId, code);
    
    res.status(200).json({ success: true, output: result.output, error: result.error });
  } catch (error) { 
    next(error); 
  }
};

// AI review: evaluate provided code against the challenge without awarding points
exports.aiReview = async (req, res, next) => {
  try {
    const challengeId = req.params.id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide code to evaluate' });
    }

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    // Call AI evaluator directly; do NOT award points here
    const evaluation = await aiService.evaluateSecurityFix(challenge, code);

    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    next(error);
  }
};

// 5. تحديث تحدي موجود
exports.updateChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // حساب النقط لو الـ level اتغير
    if (updateData.level) {
      const { getPointsForDifficulty } = require('../utils/challingesPoints');
      updateData.points = getPointsForDifficulty(updateData.level);
    }

    const [updatedRowsCount] = await Challenge.update(updateData, { where: { id } });
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const updatedChallenge = await Challenge.findByPk(id);
    res.status(200).json({ success: true, data: updatedChallenge });
  } catch (error) { 
    next(error); 
  }
};

// 6. حذف تحدي
exports.deleteChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Challenge.destroy({ where: { id } });
    
    if (deletedRowsCount === 0) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.status(200).json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) { 
    next(error); 
  }
};

// 6.5 حذف كل التحديات
exports.deleteAllChallenges = async (req, res, next) => {
  try {
    const deletedRowsCount = await Challenge.destroy({ where: {} });
    res.status(200).json({ success: true, message: `Removed ${deletedRowsCount} challenge(s).` });
  } catch (error) {
    next(error);
  }
};