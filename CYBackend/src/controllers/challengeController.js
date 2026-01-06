const Challenge = require('../models/Challenge');
const challengeService = require('../services/challengeService');
// التعديل هنا: بننادي على الفانكشن اللي هنستخدمها تحت
const { getPointsForDifficulty } = require('../utils/challingesPoints');

// 1. عرض كل التحديات
exports.getAllChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: challenges });
  } catch (error) { next(error); }
};

// 2. عرض تحدي واحد بالـ ID
exports.getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    res.status(200).json({ success: true, data: challenge });
  } catch (error) { next(error); }
};

// 3. إضافة تحدي جديد
exports.createChallenge = async (req, res, next) => {
  try {
    // كدة الفانكشن دي هتشتغل صح لأننا عملنا لها require فوق
    const points = getPointsForDifficulty(req.body.level);
    
    const challenge = new Challenge({ ...req.body, points });
    await challenge.save();
    
    res.status(201).json({ success: true, data: challenge });
  } catch (error) { next(error); }
};

// 4. تسليم الحل
// 4. تسليم الحل (بعد التعديل لاستقبال الإجابة)
exports.submitAnswer = async (req, res, next) => {
  try {
    // بناخد الإجابة من الـ body اللي جاي من الـ Editor في الفرونت إند
    const { answer } = req.body; 

    if (!answer) {
      return res.status(400).json({ success: false, message: 'Please provide an answer' });
    }

    // بنبعت الـ ID، اليوزر (عشان النقط)، والحل (عشان التقييم)
    const result = await challengeService.submitChallengeAnswer(req.params.id, req.user, answer);
    
    res.status(200).json({ success: true, ...result });
  } catch (error) { 
    next(error); 
  }
};