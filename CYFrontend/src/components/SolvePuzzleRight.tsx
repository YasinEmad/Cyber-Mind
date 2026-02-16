import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, CheckCircle, AlertCircle, Lightbulb, Lock, Zap } from 'lucide-react';

interface Props {
  puzzle: any;
  answer: string;
  setAnswer: (v: string) => void;
  feedback: 'idle' | 'correct' | 'incorrect';
  handleSubmit: (e: React.FormEvent) => void;
  submissionMessage: string | null;
  awardedPointsAmount: number | null;
  visibleHints: string[];
  revealedHintsCount: number;
  handleRevealHint: () => void;
}

const SolvePuzzleRight: React.FC<Props> = ({
  puzzle,
  answer,
  setAnswer,
  feedback,
  handleSubmit,
  submissionMessage,
  awardedPointsAmount,
  visibleHints,
  revealedHintsCount,
  handleRevealHint,
}) => {
  return (
    <div className="flex flex-col p-8 lg:p-12 bg-gradient-to-b from-black via-zinc-950 to-black justify-center relative overflow-hidden h-full">
      {/* Ambient effects */}
      <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: `radial-gradient(circle at 25% 25%, #f97316 2px, transparent 2px)`, backgroundSize: '50px 50px' }} />
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-3xl rounded-full"></div>

      <div className="max-w-lg w-full mx-auto space-y-8 relative z-10">
        {/* Input Section */}
        <motion.div 
          className="space-y-6" 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-900/30 to-transparent border border-red-600/60 rounded-lg">
                <Lock className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-300 tracking-wide">Solve the Challenge</h3>
                <p className="text-[10px] text-zinc-600 mt-1 font-mono">Enter the encryption key</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Field */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-orange-600/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <div className="relative">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="ENTER_KEY_"
                    className="w-full bg-gradient-to-b from-zinc-900/80 to-black border border-zinc-700 text-white font-mono text-lg p-5 focus:outline-none focus:border-red-600/80 transition-all placeholder:text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                    disabled={feedback === 'correct'}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-b-xl"></div>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <ChevronRight className="text-zinc-600 group-focus-within:text-red-500 transition-colors" size={20} />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button 
                type="submit" 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                className="w-full relative group"
                disabled={feedback === 'correct' || answer.trim() === ''}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 opacity-75 group-hover:opacity-100 group-disabled:opacity-30 transition-opacity duration-300 rounded-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 blur-lg opacity-0 group-hover:opacity-50 group-disabled:opacity-0 transition-opacity duration-300 rounded-xl"></div>
                <div className="relative bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all duration-300 rounded-xl border border-red-500/50 group-hover:border-red-400 group-disabled:from-zinc-700 group-disabled:to-zinc-700 group-disabled:text-zinc-600">
                  <span>Execute</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </form>
          </div>

          {/* Feedback Message */}
          <AnimatePresence>
            {feedback !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -10, scale: 0.95 }} 
                className="overflow-hidden"
              >
                <div className={`p-5 border rounded-lg font-mono text-sm uppercase tracking-wider flex items-start gap-3 backdrop-blur-sm ${
                  feedback === 'correct' 
                    ? 'bg-gradient-to-r from-green-900/40 to-green-950/20 border-green-600/50 text-green-300' 
                    : 'bg-gradient-to-r from-red-900/40 to-red-950/20 border-red-600/50 text-red-300'
                }`}>
                  <div className={`p-2 mt-0.5 flex-shrink-0 ${feedback === 'correct' ? 'bg-green-900/50' : 'bg-red-900/50'} rounded-lg`}>
                    {feedback === 'correct' ? (
                      <CheckCircle size={18} className="text-green-400" />
                    ) : (
                      <AlertCircle size={18} className="text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="font-bold text-xs">
                      {feedback === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
                    </div>
                    <div className="text-[11px] font-normal">{submissionMessage}</div>
                    {awardedPointsAmount !== null && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-block px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-green-100 rounded-lg text-xs font-mono font-bold mt-2"
                      >
                        +{awardedPointsAmount} PTS
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hints Section */}
        <motion.div 
          className="space-y-6 pt-6 border-t border-zinc-800/50"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-900/30 to-transparent border border-orange-600/50 rounded-lg">
                <Lightbulb className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-300 tracking-wide">Hints Available</h3>
                <p className="text-[9px] text-zinc-600 mt-1 font-mono">Data packets recovered</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-lg font-mono text-xs font-bold tracking-widest ${
              puzzle?.hints?.length - revealedHintsCount === 0
                ? 'bg-red-900/30 text-red-400 border border-red-600/30'
                : 'bg-orange-900/30 text-orange-400 border border-orange-600/30'
            }`}>
              {puzzle?.hints?.length - revealedHintsCount} LEFT
            </div>
          </div>

          {/* Hints Display */}
          <div className="space-y-3 min-h-[150px] max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {visibleHints.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-700/50 bg-gradient-to-b from-zinc-900/30 to-transparent rounded-lg group hover:border-zinc-600/50 transition-all duration-300 cursor-pointer"
                onClick={handleRevealHint}
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-4 mb-4 bg-gradient-to-br from-zinc-800 to-black border border-zinc-700/50 group-hover:border-zinc-600/50 transition-colors rounded-lg">
                  <Zap className="h-6 w-6 text-zinc-600 group-hover:text-orange-500 transition-colors" />
                </div>
                <span className="text-xs text-zinc-600 uppercase tracking-widest mb-2 font-bold">No Hints Revealed</span>
                <span className="text-[10px] text-zinc-700">Click to request first data packet</span>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {visibleHints.map((hint: string, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: i * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-lg"></div>
                    <div className="pl-5">
                      <div className="text-[9px] text-orange-600 mb-2 font-mono tracking-widest font-bold">PKT_{i + 1}</div>
                      <div className="bg-gradient-to-br from-zinc-900/60 to-black/60 p-4 border border-zinc-800/50 text-zinc-300 text-sm font-sans leading-relaxed rounded-lg group-hover:border-zinc-700/50 group-hover:bg-zinc-900/80 transition-all">
                        {hint}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Hint Request Button */}
          <motion.button 
            onClick={handleRevealHint} 
            disabled={revealedHintsCount === puzzle?.hints?.length || feedback === 'correct'} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-5 py-3 bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 text-sm font-bold text-zinc-400 uppercase tracking-wider hover:text-orange-500 hover:border-orange-600/50 hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-zinc-400 disabled:hover:border-zinc-700 transition-all duration-300 flex items-center justify-center gap-2 rounded-lg"
          >
            <Lightbulb size={14} />
            <span>Request Hint</span>
            <ArrowRight size={12} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default SolvePuzzleRight;
