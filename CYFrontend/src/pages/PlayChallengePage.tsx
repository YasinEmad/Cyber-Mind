import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchChallengeById, evaluateChallengeWithAI, submitChallenge } from '@/redux/slices/challengeSlice';
import { selectUser, updateScore, addCompletedLevel } from '@/redux/slices/userSlice';
import axios from '@/api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Shield, RotateCcw, 
  CheckCircle, AlertTriangle, 
  Zap,
  XCircle, Lightbulb, Send
} from 'lucide-react';

// NOTE: In a real app, you might keep PageWrapper if it handles global auth checks,
// but for a full-screen IDE experience, we usually bypass generic wrappers.

const PlayChallengePage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();

  // --- State Management ---
  const [code, setCode] = useState<string>("");
  const [activeLeftTab, setActiveLeftTab] = useState<'challenge' | 'recommendations'>('challenge');

  const dispatch = useDispatch<AppDispatch>();
  const chFromStore = useSelector((state: RootState) => state.challenges.challenge);
  const currentUser = useSelector(selectUser);
  const aiReviewStatus = useSelector((state: RootState) => state.challenges.aiReviewStatus);
  const aiReviewResult = useSelector((state: RootState) => state.challenges.aiReviewResult);
  const aiReviewError = useSelector((state: RootState) => state.challenges.error);
  const submitStatus = useSelector((state: RootState) => state.challenges.submitStatus);
  const submitResult = useSelector((state: RootState) => state.challenges.submitResult);

  const [showSubmitToast, setShowSubmitToast] = useState<boolean>(false);
  const [showAIOverlay, setShowAIOverlay] = useState<boolean>(false);
  const [scoreUpdatedForSubmission, setScoreUpdatedForSubmission] = useState<boolean>(false);

  useEffect(() => {
    if (challengeId) dispatch(fetchChallengeById(challengeId));
  }, [dispatch, challengeId]);

  useEffect(() => {
    if (!chFromStore) return;
    if (chFromStore.code) setCode(chFromStore.code);
  }, [chFromStore]);
  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleReset = () => {
    setCode(chFromStore?.code || "");
  };

  // Test runner removed per request (dummy security-check messages eliminated)

  useEffect(() => {
    if (submitResult) {
      setShowSubmitToast(true);
      const t = setTimeout(() => setShowSubmitToast(false), 6000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [submitResult]);

  useEffect(() => {
    if (submitResult && submitResult.success && submitResult.awarded && currentUser && !scoreUpdatedForSubmission) {
      const currentScore = currentUser.profile?.totalScore ?? 0;
      const nextScore = currentScore + (submitResult.points || 0);
      dispatch(updateScore(nextScore));
      if (challengeId) {
        dispatch(addCompletedLevel(Number(challengeId)));
      }
      setScoreUpdatedForSubmission(true);
    }

    if (submitResult && !submitResult.awarded) {
      setScoreUpdatedForSubmission(false);
    }
  }, [submitResult, currentUser, dispatch, challengeId, scoreUpdatedForSubmission]);

  useEffect(() => {
    if (aiReviewStatus === 'loading' || aiReviewResult || aiReviewStatus === 'failed') {
      setShowAIOverlay(true);
    }
  }, [aiReviewStatus, aiReviewResult]);

  // DEBUG: log AI review lifecycle to help diagnose rendering issues
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[PlayChallengePage] aiReviewStatus=', aiReviewStatus, 'aiReviewResult=', aiReviewResult, 'aiReviewError=', aiReviewError);
  }, [aiReviewStatus, aiReviewResult, aiReviewError]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050202] text-red-100 font-sans overflow-hidden">
      
      {/* --- Top Navigation Bar --- */}
      <header className="h-14 border-b border-red-900/50 bg-black/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-700/95 text-white px-3 py-1.5 rounded-xl border border-red-800 shadow-xl shadow-red-900/20">
            <Shield size={16} />
            <span className="font-bold text-sm tracking-wide">SEC-CHALLENGE-{challengeId}</span>
          </div>
          <span className="text-red-500/70 text-sm">|</span>
          <span className="text-red-200 text-sm font-medium">{chFromStore?.title || ''}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-red-800 bg-red-950/70 px-3 py-1 text-xs text-red-100">
            <span className="font-semibold text-red-300">Score</span>
            <span className="text-white">{currentUser?.profile?.totalScore ?? 0}</span>
          </div>

          <button 
            onClick={handleReset}
            className="p-2 text-red-300 hover:text-white hover:bg-red-950 rounded-lg transition-all hover:border hover:border-red-700"
            title="Reset Code"
          >
            <RotateCcw size={18} />
          </button>
          
          
          <button
            onClick={() => {
              if (!challengeId) return;
              dispatch(evaluateChallengeWithAI({ challengeId, code }));
            }}
            disabled={aiReviewStatus === 'loading'}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm font-medium rounded-lg border border-red-800 transition-all disabled:opacity-50"
            title="AI Review: evaluate your fix without awarding points"
          >
            <Lightbulb size={16} className={aiReviewStatus === 'loading' ? 'animate-pulse' : ''} />
            AI Review
          </button>

          <button
            onClick={() => {
              if (!challengeId) return;
              dispatch(submitChallenge({ challengeId, answer: code }));
            }}
            disabled={submitStatus === 'loading'}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-900 hover:bg-red-800 text-white text-sm font-medium rounded-lg border border-red-950 transition-all disabled:opacity-50"
            title="Submit your solution and earn points"
          >
            <Send size={16} className={submitStatus === 'loading' ? 'animate-pulse' : ''} />
            Submit & Earn
          </button>
        </div>
      </header>
      
      {/* Submission toast: shows result in a compact fixed card */}
      {submitResult && showSubmitToast && (
        <div className="fixed top-16 right-4 z-50 w-[380px]">
          <div className={`relative p-3 rounded-xl shadow-xl text-red-100 border ${submitResult.success ? 'bg-[#071211] border-red-700' : 'bg-[#140101] border-red-900'}`}>
            <button onClick={() => setShowSubmitToast(false)} aria-label="Close" className="absolute top-2 right-3 text-red-300 hover:text-red-100">×</button>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {submitResult.success ? (
                  <CheckCircle size={18} className="text-red-300" />
                ) : (
                  <XCircle size={18} className="text-red-400" />
                )}
              </div>
              <div>
                <div className="font-semibold">Submission Result</div>
                <div className="text-sm text-red-200 mt-1">{submitResult.message}</div>
                {submitResult.awarded && (
                  <div className="mt-2 text-xs font-bold text-red-300">+{submitResult.points} points!</div>
                )}
                {submitResult.alreadySolved && (
                  <div className="mt-1 text-xs text-red-300">You already solved this challenge before.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      

      {/* --- Description banner --- */}
      {chFromStore && chFromStore.description && (
        <div className="px-4 py-3 bg-red-950/90 border-b border-red-900 text-sm text-red-200">
          {chFromStore.description}
        </div>
      )}

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Context & Instructions */}
        <div className="w-[400px] flex flex-col border-r border-red-900 bg-[#080404] flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-red-900 bg-[#080404]">
            <button
              onClick={() => setActiveLeftTab('challenge')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === 'challenge' 
                  ? 'border-red-600 text-red-100 bg-black' 
                  : 'border-transparent text-red-500 hover:text-red-300 hover:bg-red-950/70'
              }`}
            >
              <AlertTriangle size={14} /> Challenge
            </button>
            <button
              onClick={() => setActiveLeftTab('recommendations')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === 'recommendations' 
                  ? 'border-red-600 text-red-100 bg-black' 
                  : 'border-transparent text-red-500 hover:text-red-300 hover:bg-red-950/70'
              }`}
            >
              <Zap size={14} /> Recommendations
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-black">
            <AnimatePresence mode='wait'>
              {activeLeftTab === 'challenge' ? (
                <motion.div 
                  key="vulns"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider mb-2">Challenge Details</h3>
                  {chFromStore && chFromStore.challengeDetails ? (
                    <p className="text-sm text-red-100 mb-4 leading-relaxed">{chFromStore.challengeDetails}</p>
                  ) : (
                    <p className="text-sm text-red-400 mb-4 leading-relaxed">No details provided.</p>
                  )}
                </motion.div>
              ) : activeLeftTab === 'recommendations' ? (
                <motion.div 
                  key="recommendations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider mb-4">Security Recommendations</h3>
                  {chFromStore && chFromStore.recommendation ? (
                    <div className="bg-black border border-red-900 rounded-2xl p-4 shadow-xl shadow-red-950/30">
                      <p className="text-sm text-red-100 leading-relaxed">{chFromStore.recommendation}</p>
                    </div>
                  ) : (
                    <div className="bg-black border border-red-900 rounded-2xl p-4 shadow-xl shadow-red-950/30">
                      <p className="text-sm text-red-400 leading-relaxed">No recommendations provided for this challenge.</p>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL: Editor & Console */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070303]">
          
          {/* Editor Area */}
          <div className="flex-1 relative">
            <div className="absolute top-0 right-0 z-10 p-2">
              <span className="text-xs font-mono text-red-300/80">JavaScript / Node.js</span>
            </div>
            <Editor
              height="100%" 
              defaultLanguage="javascript" 
              value={code}
              onChange={handleEditorChange} 
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 24,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20 },
              }}
            />
          </div>

          {/* AI Review overlay (centered modal) */}
          {showAIOverlay && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowAIOverlay(false)} />
              <div className={`relative max-w-4xl w-full rounded-2xl border border-red-900/80 p-6 ${aiReviewStatus === 'failed' ? 'bg-[#140101]' : 'bg-[#111111]'} text-red-100 shadow-2xl`}> 
                <button onClick={() => setShowAIOverlay(false)} aria-label="Close" className="absolute top-4 right-4 text-red-300 hover:text-red-100">×</button>

                {aiReviewStatus === 'loading' ? (
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                    <div className="text-sm">Analyzing with AI&hellip;</div>
                  </div>
                ) : aiReviewStatus === 'failed' ? (
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-900/70">
                      <AlertTriangle size={20} className="text-red-300" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-red-100">AI Review failed</p>
                      <p className="mt-2 text-sm text-red-300">{aiReviewError || 'Evaluation service is temporarily unavailable. Please try again in a moment.'}</p>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const evaluation = aiReviewResult?.evaluation ?? aiReviewResult;
                    const fixed = evaluation?.fixed ?? false;
                    const feedback = evaluation?.feedback ?? evaluation?.message ?? JSON.stringify(evaluation);
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${fixed ? 'bg-red-700/20' : 'bg-red-900/30'}`}>
                              {fixed ? <CheckCircle size={20} className="text-red-300" /> : <AlertTriangle size={20} className="text-red-400" />}
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-red-100">AI Review</p>
                              <p className="text-xs text-red-300">{fixed ? 'Fix detected. You can submit your solution.' : 'Review the feedback below to improve your patch.'}</p>
                            </div>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${fixed ? 'bg-red-700/70 text-red-100' : 'bg-red-900/80 text-red-200'}`}>{fixed ? 'Fixed' : 'Needs review'}</span>
                        </div>

                        <div className="rounded-xl border border-red-900/70 bg-black/80 p-4 text-sm text-red-200">
                          {feedback}
                        </div>
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          )}

          {submitStatus === 'loading' && (
            <div className="border-t border-red-900/60 px-4 py-3 bg-red-950 text-sm text-red-300">Submitting your solution&hellip;</div>
          )}

          

          

        </div>
      </div>
    </div>
  );
};

export default PlayChallengePage;