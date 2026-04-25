import type { FC } from 'react';
import { toast } from 'react-hot-toast';
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
}

export const ChallengeHeader: FC<HeaderProps> = ({
  chFromStore, challengeId, totalTests, isAllTestsPassed, passedTests,
  submitStatus, isRunning, handleSubmit, handleReset, handleRun
}) => (
  <header className="h-16 border-b border-red-900/40 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 shadow-md">
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
            : 'bg-black/50 border-red-900/40 text-white'
        }`}>
          <Award size={14} />
          <span>{passedTests}/{totalTests} Tests</span>
        </div>
      )}
    </div>

    <div className="flex items-center gap-3">
      <button
        type="button"
        onPointerDown={() => console.debug('ChallengeHeader submit pointerdown')}
        onClick={() => {
          console.debug('ChallengeHeader submit clicked');
          toast('Submitting for AI review...', { icon: '🚀' });
          handleSubmit();
        }}
        disabled={submitStatus === 'loading'}
        className="pointer-events-auto flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white text-sm font-bold rounded-lg shadow-xl shadow-green-700/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        title="Submit your solution for AI review"
      >
        {submitStatus === 'loading' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        <span>{submitStatus === 'loading' ? 'Submitting...' : 'Submit for AI Review'}</span>
      </button>

      <button 
        type="button"
        onClick={handleReset} 
        className="flex items-center gap-2 px-3 py-2 text-white hover:text-white hover:bg-black rounded-lg transition-all border border-transparent hover:border-red-900/40 group"
        title="Reset to original code"
      >
        <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-sm">Reset</span>
      </button>
      
      <div className="h-8 w-px bg-red-900/10"></div>
      
      <button 
        type="button"
        onClick={handleRun} 
        disabled={isRunning}
        className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-red-900/20 text-white text-sm font-medium rounded-lg border border-red-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-900/20"
        title="Execute the code"
      >
        <Play size={16} className={isRunning ? "animate-pulse text-white" : "text-white"} />
        <span>Run Code</span>
      </button>
    </div>
  </header>
);

export default ChallengeHeader;