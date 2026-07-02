import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { verifyFlagSubmission, clearFlagVerificationResult } from '../redux/slices/ctfSlice';
import { updateUserProfileFromCTF, addCompletedLevel, setUser } from '../redux/slices/userSlice';
import { syncUserProgressFromProfile } from '../redux/slices/ctfSlice';
import axiosInstance from '@/api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Flag, Terminal, Info } from 'lucide-react';

interface FlagSubmissionPanelProps {
  level: number;
  onSuccess?: () => void;
}

const FlagSubmissionPanel: React.FC<FlagSubmissionPanelProps> = ({ level: challengeId, onSuccess }) => {
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
    dispatch(addCompletedLevel(challengeId));

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
  }, [flagResult, onSuccess, challengeId, dispatch, showSuccess]);

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!flagInput.trim()) {
      return;
    }

    dispatch(verifyFlagSubmission({ level: challengeId, flag: flagInput }));
  };

  const handleClearResult = () => {
    dispatch(clearFlagVerificationResult());
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-6 bg-black/60 backdrop-blur-xl border border-neutral-900 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Visual Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-950/40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neutral-900 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neutral-900 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-950/40 pointer-events-none" />

      {/* Header Panel */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/20 border border-red-900/30">
            <Flag className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-neutral-200 tracking-wider uppercase">Submit Captured Flag</h2>
            <p className="text-[10px] font-mono text-neutral-600 uppercase">Target Node Protocol // ID_{challengeId}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[9px] text-neutral-600 bg-neutral-950 px-2 py-1 rounded border border-neutral-900">
          <Terminal className="w-3 h-3 text-red-900" />
          <span>STATUS_WAITING</span>
        </div>
      </div>

      {/* Success Banner Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="mb-4 p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-lg flex items-center gap-3 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">🎉 Level Cleared Successfully!</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {flagResult?.pointsAwarded && `Database Updated: +${flagResult.pointsAwarded} Network Points added.`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error / Failure Banner Overlay */}
      <AnimatePresence>
        {flagResult && !flagResult.isCorrect && (
          <motion.div
            className="mb-4 p-4 bg-red-950/20 border border-red-900/40 rounded-lg flex items-center gap-3 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1 font-mono">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wide">Access Denied // Invalid Flag</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Failure recorded on attempt {flagResult?.attempts || 0}. Re-evaluate decryption vectors.
              </p>
            </div>
            <button
              onClick={handleClearResult}
              className="p-1 text-neutral-600 hover:text-neutral-400 transition-colors font-mono text-sm"
              title="Clear Diagnostic"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flag Decryption Submission Form */}
      <form onSubmit={handleSubmitFlag} className="space-y-4" action="#" noValidate>
        <div className="relative group">
          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            placeholder="Enter flag hash format... e.g., FLAG{hash_string}"
            disabled={isLoading || showSuccess}
            className="w-full px-4 py-3.5 bg-neutral-950 border border-neutral-900 rounded-lg text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-red-900/80 focus:ring-1 focus:ring-red-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs tracking-wide shadow-inner"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Loader className="w-4 h-4 text-red-500 animate-spin" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !flagInput.trim() || showSuccess}
          className="w-full px-4 py-3.5 bg-neutral-950 border border-red-900/30 hover:border-red-500/50 disabled:border-neutral-900 disabled:bg-neutral-950/40 disabled:text-neutral-700 disabled:cursor-not-allowed text-neutral-200 font-mono text-xs font-bold tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2 uppercase shadow-xl"
        >
          {isLoading ? (
            <>
              <Loader className="w-3.5 h-3.5 animate-spin text-red-500" />
              Verifying Checksum...
            </>
          ) : (
            <>
              <Flag className="w-3.5 h-3.5 text-red-500" />
              Submit Access Token
            </>
          )}
        </button>
      </form>

      {/* Diagnostic Metadata Footer */}
      {flagResult && (
        <div className="mt-5 pt-4 border-t border-neutral-900/60 grid grid-cols-2 gap-4 font-mono text-[11px]">
          <div className="bg-neutral-950/40 p-2.5 rounded border border-neutral-900/60">
            <span className="text-neutral-600 block text-[9px] uppercase tracking-wider">Total Attempts</span>
            <span className="text-neutral-300 font-bold">{flagResult.attempts || 0}</span>
          </div>
          {flagResult.isCompleted && (
            <div className="bg-neutral-950/40 p-2.5 rounded border border-neutral-900/60">
              <span className="text-neutral-600 block text-[9px] uppercase tracking-wider">Points Harvested</span>
              <span className="text-emerald-400 font-bold">+{flagResult.pointsAwarded || 0} PTS</span>
            </div>
          )}
        </div>
      )}

      {/* Form System Helper Instructions */}
      <div className="mt-4 flex items-start gap-2 text-[10px] font-mono text-neutral-600 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-neutral-700 flex-shrink-0 mt-0.5" />
        <span>System flags are case-sensitive and must perfectly adhere to specified environments. Inspect challenge endpoints carefully before submission.</span>
      </div>
    </motion.div>
  );
};

export default FlagSubmissionPanel;