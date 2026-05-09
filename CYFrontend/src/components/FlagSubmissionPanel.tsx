import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { verifyFlagSubmission, clearFlagVerificationResult } from '../redux/slices/ctfSlice';
import { updateUserProfileFromCTF, addCompletedLevel, setUser } from '../redux/slices/userSlice';
import { syncUserProgressFromProfile } from '../redux/slices/ctfSlice';
import axiosInstance from '@/api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Flag } from 'lucide-react';

interface FlagSubmissionPanelProps {
  level: number;
  onSuccess?: () => void;
}

const FlagSubmissionPanel: React.FC<FlagSubmissionPanelProps> = ({ level, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [flagInput, setFlagInput] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const successTimeoutRef = useRef<number | null>(null);

  const flagResult = useSelector((state: RootState) => state.ctf.flagVerificationResult);
  const flagStatus = useSelector((state: RootState) => state.ctf.flagVerificationStatus);
  const isLoading = flagStatus === 'loading';

  // Handle successful flag submission
  useEffect(() => {
    if (!flagResult?.isCorrect || !flagResult?.isCompleted || showSuccess) {
      return;
    }

    console.log('✅ Flag verified successfully!', flagResult);
    setShowSuccess(true);
    setFlagInput('');
    
    // Dispatch actions to update user profile and completed levels
    if (flagResult.updatedProfile) {
      console.log('📊 Updating profile with:', flagResult.updatedProfile);
      dispatch(updateUserProfileFromCTF({
        flags: flagResult.updatedProfile.flags,
        totalScore: flagResult.updatedProfile.totalScore,
        globalRank: flagResult.updatedProfile.globalRank,
        solvedCTFLevels: flagResult.updatedProfile.solvedCTFLevels,
      }));
    }
    
    // Add to completed levels
    dispatch(addCompletedLevel(level));

    // Refetch user data to sync with server
    const refetchUserData = async () => {
      try {
        const { data } = await axiosInstance.get('/users/me');
        console.log('🔄 Refetched user data:', data.data);
        dispatch(setUser(data.data));
        dispatch(syncUserProgressFromProfile({
          solvedCTFLevels: data.data.profile?.solvedCTFLevels,
          solvedChallenges: data.data.solvedChallenges,
        }));
      } catch (error) {
        console.error('Error refetching user data:', error);
      }
    };

    refetchUserData();

    // Schedule refresh callback after showing success message
    successTimeoutRef.current = window.setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      }
    }, 2000);

    return () => {
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, [flagResult, onSuccess, level, dispatch, showSuccess]);

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flagInput.trim()) {
      return;
    }

    dispatch(verifyFlagSubmission({ level, flag: flagInput }));
  };

  const handleClearResult = () => {
    dispatch(clearFlagVerificationResult());
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Flag className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-bold text-white tracking-wide">قدّم الـ Flag</h2>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="mb-4 p-4 bg-green-900/30 border border-green-500/50 rounded-lg flex items-center gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-400">🎉 تم إكمال المستوى!</p>
              <p className="text-xs text-green-300 mt-1">
                {flagResult?.pointsAwarded && `حصلت على ${flagResult.pointsAwarded} نقطة`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {flagResult && !flagResult.isCorrect && (
          <motion.div
            className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">Flag غير صحيح</p>
              <p className="text-xs text-red-300 mt-1">
                محاولة {flagResult?.attempts || 0} - حاول مرة أخرى!
              </p>
            </div>
            <button
              onClick={handleClearResult}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form */}
      <form onSubmit={handleSubmitFlag} className="space-y-3" action="#" noValidate>
        <div className="relative">
          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            placeholder="أدخل الـ Flag هنا..."
            disabled={isLoading || showSuccess}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader className="w-4 h-4 text-red-500 animate-spin" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !flagInput.trim() || showSuccess}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm tracking-wide uppercase shadow-lg hover:shadow-red-500/30 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              جاري التحقق...
            </>
          ) : (
            <>
              <Flag className="w-4 h-4" />
              إرسال الـ Flag
            </>
          )}
        </button>
      </form>

      {/* Stats */}
      {flagResult && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">المحاولات:</span>
            <span className="text-zinc-300 font-mono">{flagResult.attempts || 0}</span>
          </div>
          {flagResult.isCompleted && (
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-zinc-400">النقاط:</span>
              <span className="text-green-400 font-mono font-bold">+{flagResult.pointsAwarded || 0}</span>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-4 text-xs text-zinc-500 italic text-right">
        💡 الـ Flag يجب أن يكون بالصيغة الصحيحة تمامًا. حاول اتباع الخطوات بدقة.
      </div>
    </motion.div>
  );
};

export default FlagSubmissionPanel;
