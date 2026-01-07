import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Award, Send, Loader2, RotateCcw, Play, Beaker 
} from 'lucide-react';

interface HeaderProps {
  chFromStore: any;
  challengeId: string | undefined;
  totalTests: number;
  isAllTestsPassed: boolean;
  passedTests: number;
  submitStatus: string;
  isRunning: boolean;
  handleSubmit: () => void;
  handleReset: () => void;
  handleRun: () => void;
  handleTest: () => void;
}

export const ChallengeHeader: React.FC<HeaderProps> = ({
  chFromStore, challengeId, totalTests, isAllTestsPassed, passedTests,
  submitStatus, isRunning, handleSubmit, handleReset, handleRun, handleTest
}) => (
  <header className="h-16 border-b border-gray-700 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 shadow-md">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3 bg-gradient-to-r from-red-700 to-orange-700 text-white px-4 py-2 rounded-full border border-red-500/50 shadow-lg shadow-red-600/30">
        <Shield size={20} />
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide">
            {chFromStore?.title || 'Security Challenge'}
          </span>
          <span className="text-[10px] text-red-200 font-mono">ID: {challengeId}</span>
        </div>
      </div>
      
      {totalTests > 0 && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
          isAllTestsPassed 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-black/50 border-gray-700/50 text-white'
        }`}>
          <Award size={14} />
          <span>{passedTests}/{totalTests} Tests</span>
        </div>
      )}
    </div>

    <div className="flex items-center gap-3">
      <AnimatePresence>
        {isAllTestsPassed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <button
              onClick={handleSubmit}
              disabled={submitStatus === 'loading'}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white text-sm font-bold rounded-lg shadow-xl shadow-green-700/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              title="Submit your final solution"
            >
              {submitStatus === 'loading' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span>Submit Solution</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={handleReset} 
        className="flex items-center gap-2 px-3 py-2 text-white hover:text-white hover:bg-black rounded-lg transition-all border border-transparent hover:border-gray-600 group"
        title="Reset to original code"
      >
        <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-sm">Reset</span>
      </button>
      
      <div className="h-8 w-px bg-gray-700"></div>
      
      <button 
        onClick={handleRun} 
        disabled={isRunning}
        className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-black/50"
        title="Execute the code"
      >
        <Play size={16} className={isRunning ? "animate-pulse text-white" : "text-white"} />
        <span>Run Code</span>
      </button>
      
      <button 
        onClick={handleTest} 
        disabled={isRunning}
        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-sm font-bold rounded-lg shadow-xl shadow-red-700/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        title="Run security tests"
      >
        <Beaker size={16} className={isRunning ? "animate-spin text-yellow-300" : "text-yellow-300"} />
        <span>Run Tests</span>
      </button>
    </div>
  </header>
);

export default ChallengeHeader;