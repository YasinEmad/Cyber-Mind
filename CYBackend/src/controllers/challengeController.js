const { z } = require('zod');
const { Challenge } = require('../models');
const challengeService = require('../services/challengeService');
// التعديل هنا: بننادي على الفانكشن اللي هنستخدمها تحت
const { getPointsForDifficulty } = require('../utils/challingesPoints');
const userService = require('../services/userService');
const aiService = require('../services/aiService');

const vulnerabilityTypes = ['Injection', 'XSS', 'Path Traversal', 'IDOR', 'Authentication flaw', 'Authorization flaw', 'Missing validation', 'Unsafe input handling'];


const difficultyLevels = ['easy', 'medium', 'hard'];

const validationTypes = ['regex', 'exact'];

const createChallengeSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional().default(''),
  code: z.string().optional().default(''),
  initialCode: z.string().optional().default(''),
  programmingLanguage: z.string().optional().default(''),
  vulnerabilityType: z.enum(vulnerabilityTypes).optional(),
  level: z.enum(difficultyLevels).optional().default('medium'),
  hints: z.array(z.string()).optional().default([]),
  challengeDetails: z.string().optional().default(''),
  recommendation: z.string().optional().default(''),
  feedback: z.string().optional().default(''),
  solution: z.string().optional().default(''),
  validationType: z.enum(validationTypes).optional().default('regex'),
}).strict();

const updateChallengeSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  code: z.string().optional(),
  initialCode: z.string().optional(),
  programmingLanguage: z.string().optional(),
  vulnerabilityType: z.enum(vulnerabilityTypes).optional(),
  level: z.enum(difficultyLevels).optional(),
  hints: z.array(z.string()).optional(),
  challengeDetails: z.string().optional(),
  recommendation: z.string().optional(),
  feedback: z.string().optional(),
  solution: z.string().optional(),
  validationType: z.enum(validationTypes).optional(),
}).strict();

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
    const idParam = req.params.id;
    const numericId = await resolveToNumericId(idParam);
    if (!numericId) return res.status(404).json({ success: false, message: 'Challenge not found' });
    const challenge = await Challenge.findByPk(numericId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    res.status(200).json({ success: true, data: challenge });
  } catch (error) { next(error); }
};

// 3. إضافة تحدي جديد
exports.createChallenge = async (req, res, next) => {
  try {
    const parsed = createChallengeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const points = getPointsForDifficulty(parsed.data.level);

    const challenge = await Challenge.create({ ...parsed.data, points });
    console.log(`[CHALLENGE CREATE] Challenge created: ID=${challenge.id}, UUID=${challenge.uuid}, level=${challenge.level}, points=${challenge.points}`);

    res.status(201).json({ success: true, data: challenge });
  } catch (error) { next(error); }
};

// Helper: resolve a param which may be numeric id or uuid to numeric DB id
async function resolveToNumericId(idParam) {
  if (!idParam) return null;
  const maybeNum = Number(idParam);
  if (!Number.isNaN(maybeNum) && String(maybeNum) === String(idParam)) {
    return maybeNum;
  }
  // try to find by uuid
  const found = await Challenge.findOne({ where: { uuid: idParam } });
  return found ? found.id : null;
}

// 4. تسليم الحل
// 4. تسليم الحل (بعد التعديل لاستقبال الإجابة)
// يتم التحقق من أن المستخدم لم يحل هذا التحدي من قبل
// عند النجاح لأول مرة فقط: تتم إضافة النقاط و تسجيل التحدي كمحلول
exports.submitAnswer = async (req, res, next) => {
  try {
    const challengeIdParam = req.params.id;
    const numericChallengeId = await resolveToNumericId(challengeIdParam);
    if (!numericChallengeId) return res.status(404).json({ success: false, message: 'Challenge not found' });
    const { answer } = req.body;

    console.log(`[SUBMISSION] User: ${req.user?.id || 'anonymous'}, Challenge Param: ${challengeIdParam}, Resolved ID: ${numericChallengeId}`);

    if (!answer) {
      return res.status(400).json({ success: false, message: 'Please provide an answer' });
    }

    // بنبعت الـ ID، اليوزر (عشان النقط)، والحل (عشان التقييم)
    const result = await challengeService.submitChallengeAnswer(numericChallengeId, req.user, answer);
    
    console.log(`[SUBMISSION RESULT] Challenge Param: ${challengeIdParam}, Success: ${result.success}, Awarded: ${result.awarded}, AlreadySolved: ${result.alreadySolved}`);
    
    res.status(200).json(result);
  } catch (error) { 
    next(error); 
  }
};

// Deduct points when a user requests a challenge hint
exports.useChallengeHint = async (req, res, next) => {
  try {
    const challengeIdParam = req.params.id;
    const { hintIndex, amount } = req.body;

    const numericChallengeId = await resolveToNumericId(challengeIdParam);
    if (!numericChallengeId) return res.status(400).json({ success: false, message: 'Invalid challenge ID provided' });

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

    const result = await userService.deductHintPoints(req.user.id, deductionAmount, numericChallengeId, 'challenge', parsedHintIndex);

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
    const challengeIdParam = req.params.id;
    const numericChallengeId = await resolveToNumericId(challengeIdParam);
    if (!numericChallengeId) return res.status(404).json({ success: false, message: 'Challenge not found' });
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide code to run' });
    }

    const result = await challengeService.runCode(numericChallengeId, code);
    
    res.status(200).json({ success: true, output: result.output, error: result.error });
  } catch (error) { 
    next(error); 
  }
};

// AI review: evaluate provided code against the challenge without awarding points
exports.aiReview = async (req, res, next) => {
  try {
    const challengeIdParam = req.params.id;
    const numericChallengeId = await resolveToNumericId(challengeIdParam);
    if (!numericChallengeId) return res.status(404).json({ success: false, message: 'Challenge not found' });
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide code to evaluate' });
    }

    const challenge = await Challenge.findByPk(numericChallengeId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    // Call AI evaluator directly; do NOT award points here
    const evaluation = await aiService.evaluateSecurityFix(challenge, code);

    // Only include debug details in non-production environments
    if (process.env.NODE_ENV !== 'production' && evaluation && evaluation.debug) {
      res.status(200).json({ success: true, evaluation });
    } else {
      // Strip debug before sending to users in production
      const safeEval = { fixed: evaluation?.fixed ?? false, feedback: evaluation?.feedback ?? '' };
      res.status(200).json({ success: true, evaluation: safeEval });
    }
  } catch (error) {
    next(error);
  }
};

// 5. تحديث تحدي موجود
exports.updateChallenge = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const id = await resolveToNumericId(idParam);
    if (!id) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const parsed = updateChallengeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const data = { ...parsed.data };
    if (data.level) {
      data.points = getPointsForDifficulty(data.level);
    }

    const [updatedRowsCount] = await Challenge.update(data, { where: { id } });
    
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
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const idParam = req.params.id;
    const id = await resolveToNumericId(idParam);
    if (!id) return res.status(404).json({ success: false, message: 'Challenge not found' });
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
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const deletedRowsCount = await Challenge.destroy({ where: {} });
    res.status(200).json({ success: true, message: `Removed ${deletedRowsCount} challenge(s).` });
  } catch (error) {
    next(error);
  }
};