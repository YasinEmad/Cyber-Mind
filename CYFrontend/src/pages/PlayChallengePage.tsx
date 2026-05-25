import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchChallengeById, evaluateChallengeWithAI, submitChallenge } from '@/redux/slices/challengeSlice';
import { selectUser, updateScore } from '@/redux/slices/userSlice';
import axios from '@/api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Shield, Play, RotateCcw, Terminal, 
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
  const [output, setOutput] = useState<string>("");
  const [activeLeftTab, setActiveLeftTab] = useState<'challenge' | 'recommendations'>('challenge');
  const [activeBottomTab, setActiveBottomTab] = useState<'output'>('output');
  const [isRunning, setIsRunning] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const chFromStore = useSelector((state: RootState) => state.challenges.challenge);
  const currentUser = useSelector(selectUser);
  const aiReviewStatus = useSelector((state: RootState) => state.challenges.aiReviewStatus);
  const aiReviewResult = useSelector((state: RootState) => state.challenges.aiReviewResult);
  const aiReviewError = useSelector((state: RootState) => state.challenges.error);
  const submitStatus = useSelector((state: RootState) => state.challenges.submitStatus);
  const submitResult = useSelector((state: RootState) => state.challenges.submitResult);

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
    setOutput("");
  }; 

  const handleRun = () => {
    setIsRunning(true);
    setActiveBottomTab('output');
    setOutput("Initializing security sandbox...\n> Analyzing AST...\n");
    
    setTimeout(() => {
      try {
        const testInput = "<script>alert('xss')</script>";
        // Simulate execution
        setOutput(prev => 
          prev + 
          `\n[LOG] Input received: ${testInput}` +
          `\n[LOG] Query constructed...` +
          `\n[WARN] Potential SQL syntax error detected in simulation.` +
          `\n[SUCCESS] Execution finished in 14ms.`
        );
      } catch (error) {
        // Handle error
      }
      setIsRunning(false);
    }, 1000);
  };

  // Test runner removed per request (dummy security-check messages eliminated)

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-gray-300 font-sans overflow-hidden">
      
      {/* --- Top Navigation Bar --- */}
      <header className="h-14 border-b border-gray-800 bg-black backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1.5 rounded-lg border border-gray-700 shadow-lg shadow-red-900/20">
            <Shield size={16} />
            <span className="font-bold text-sm tracking-wide">SEC-CHALLENGE-{challengeId}</span>
          </div>
          <span className="text-gray-600 text-sm">|</span>
          <span className="text-gray-400 text-sm font-medium">{chFromStore?.title || ''}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/80 px-3 py-1 text-xs text-gray-300">
            <span className="font-semibold text-emerald-300">Score</span>
            <span className="text-white">{currentUser?.profile?.totalScore ?? 0}</span>
          </div>

          <button 
            onClick={handleReset}
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all hover:border hover:border-gray-700"
            title="Reset Code"
          >
            <RotateCcw size={18} />
          </button>
          
          <div className="h-6 w-px bg-gray-800 mx-1"></div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg border border-gray-700 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-gray-900"
          >
            <Play size={16} className={isRunning ? "animate-pulse" : ""} />
            Run
          </button>

          {/* Run Tests button removed */}

          <button
            onClick={() => {
              if (!challengeId) return;
              dispatch(evaluateChallengeWithAI({ challengeId, code }));
            }}
            disabled={isRunning || aiReviewStatus === 'loading'}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-lg border border-blue-800 transition-all disabled:opacity-50"
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
            disabled={isRunning || submitStatus === 'loading'}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg border border-green-800 transition-all disabled:opacity-50"
            title="Submit your solution and earn points"
          >
            <Send size={16} className={submitStatus === 'loading' ? 'animate-pulse' : ''} />
            Submit & Earn
          </button>
        </div>
      </header>

      {/* --- Description banner --- */}
      {chFromStore && chFromStore.description && (
        <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 text-sm text-gray-300">
          {chFromStore.description}
        </div>
      )}

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Context & Instructions */}
        <div className="w-[400px] flex flex-col border-r border-gray-800 bg-black flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-800 bg-black">
            <button
              onClick={() => setActiveLeftTab('challenge')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === 'challenge' 
                  ? 'border-red-600 text-white bg-black' 
                  : 'border-transparent text-gray-600 hover:text-gray-300 hover:bg-black'
              }`}
            >
              <AlertTriangle size={14} /> Challenge
            </button>
            <button
              onClick={() => setActiveLeftTab('recommendations')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === 'recommendations' 
                  ? 'border-red-600 text-white bg-black' 
                  : 'border-transparent text-gray-600 hover:text-gray-300 hover:bg-black'
              }`}
            >
              <Zap size={14} /> Recommendations
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-900">
            <AnimatePresence mode='wait'>
              {activeLeftTab === 'challenge' ? (
                <motion.div 
                  key="vulns"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Challenge Details</h3>
                  {chFromStore && chFromStore.challengeDetails ? (
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">{chFromStore.challengeDetails}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">No details provided.</p>
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
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Security Recommendations</h3>
                  {chFromStore && chFromStore.recommendation ? (
                    <div className="bg-black border border-gray-800 rounded-lg p-4 shadow-xl shadow-black/50">
                      <p className="text-xs text-gray-500 leading-relaxed">{chFromStore.recommendation}</p>
                    </div>
                  ) : (
                    <div className="bg-black border border-gray-800 rounded-lg p-4 shadow-xl shadow-black/50">
                      <p className="text-xs text-gray-500 leading-relaxed">No recommendations provided for this challenge.</p>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL: Editor & Console */}
        <div className="flex-1 flex flex-col min-w-0 bg-black">
          
          {/* Editor Area */}
          <div className="flex-1 relative">
            <div className="absolute top-0 right-0 z-10 p-2">
              <span className="text-xs font-mono text-gray-600 opacity-50">JavaScript / Node.js</span>
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

          {/* AI Review feedback (renders inline below editor) */}
          {aiReviewStatus === 'loading' && (
            <div className="border-t border-gray-800 px-4 py-3 bg-gray-900 text-sm text-gray-400">Analyzing with AI&hellip;</div>
          )}

          {aiReviewResult && aiReviewResult.evaluation && (
            <div className="border-t border-gray-800 px-4 py-3 bg-gray-900 text-sm text-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {aiReviewResult.evaluation.fixed ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-400" />
                  )}
                  <span className="font-medium">AI Review</span>
                </div>
                <div className="text-xs text-gray-400">{aiReviewResult.evaluation.fixed ? 'Fixed' : 'Not fixed'}</div>
              </div>
              <p className="mt-2 text-sm text-gray-300">{aiReviewResult.evaluation.feedback}</p>
            </div>
          )}

          {aiReviewStatus === 'failed' && (
            <div className="border-t border-gray-800 px-4 py-3 bg-red-900 text-sm text-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-300" />
                <span className="font-medium">AI Review failed</span>
              </div>
              <p className="mt-2 text-sm">{aiReviewError || 'Evaluation service is temporarily unavailable. Please try again in a moment.'}</p>
            </div>
          )}

          {submitStatus === 'loading' && (
            <div className="border-t border-gray-800 px-4 py-3 bg-gray-900 text-sm text-gray-400">Submitting your solution&hellip;</div>
          )}

          {submitResult && (
            <div className={`border-t border-gray-800 px-4 py-3 text-sm text-gray-200 ${submitResult.success ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {submitResult.success ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                  <span className="font-medium">Submission Result</span>
                </div>
                {submitResult.awarded && (
                  <div className="text-xs font-bold text-green-400">+{submitResult.points} points!</div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-300">{submitResult.message}</p>
              {submitResult.alreadySolved && (
                <p className="mt-1 text-xs text-yellow-400">You already solved this challenge before.</p>
              )}
            </div>
          )}

          {submitStatus === 'failed' && (
            <div className="border-t border-gray-800 px-4 py-3 bg-red-900 text-sm text-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-300" />
                <span className="font-medium">Submission failed</span>
              </div>
              <p className="mt-2 text-sm">{aiReviewError || 'Failed to submit your solution. Please try again.'}</p>
            </div>
          )}

          {/* Bottom Console Area */}
          <div className="h-[35%] flex flex-col border-t border-gray-800 bg-black">
            {/* Console Tabs */}
            <div className="flex items-center border-b border-gray-800 bg-black px-2 h-10">
              <button
                onClick={() => setActiveBottomTab('output')}
                className={`px-4 h-full text-xs font-medium flex items-center gap-2 border-r border-gray-800 transition-colors ${
                  activeBottomTab === 'output' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-300'
                }`}
              >
                <Terminal size={12} /> Console Output
              </button>
              {/* Test Results tab removed; only Console Output is shown */}
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-black">
              {activeBottomTab === 'output' && (
                <div className="text-gray-400 whitespace-pre-wrap">
                  {output ? (
                    output
                  ) : (
                    <span className="text-gray-700 italic">Ready to execute. Click "Run" to test your code locally...</span>
                  )}
                </div>
              )}

              {/* Test results removed; only console output remains */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlayChallengePage;