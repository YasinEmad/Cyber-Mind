import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ChevronRight, ArrowRight, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

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
    <div className="flex flex-col p-6 lg:p-12 bg-gradient-to-b from-black to-gray-900/30 justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle at 25% 25%, #dc2626 2px, transparent 2px)`, backgroundSize: '50px 50px' }} />

      <div className="max-w-md w-full mx-auto space-y-12 relative z-10">
        <motion.div className="space-y-8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-900/20 to-transparent border border-red-900/30">
              <Key className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase">Authentication Required</h3>
              <p className="text-[10px] text-gray-600 mt-1 font-mono">ENTER_ENCRYPTION_KEY_BELOW</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-orange-600/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="ENTER_ENCRYPTION_KEY_"
                  className="w-full bg-gradient-to-b from-gray-900 to-black border border-gray-800 text-white font-mono text-xl p-6 focus:outline-none focus:border-red-500/50 transition-all placeholder:text-gray-700 disabled:opacity-30"
                  disabled={feedback === 'correct'}
                  autoComplete="off"
                  spellCheck="false"
                />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <ChevronRight className="text-gray-600 group-focus-within:text-red-500 transition-colors" size={20} />
                </div>
              </div>
            </div>

            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 opacity-100 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-red-600 to-orange-600 text-white py-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 transition-all duration-300 border border-transparent group-hover:border-white/20">
                <span className="relative">Confirm Execution <span className="absolute -right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={16} /></span></span>
              </div>
            </motion.button>
          </form>

          <AnimatePresence>
            {feedback !== 'idle' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className={`p-5 border font-mono text-xs uppercase tracking-wider flex items-center gap-3 backdrop-blur-sm ${feedback === 'correct' ? 'bg-gradient-to-r from-red-900/20 to-green-900/10 border-red-500/30 text-green-400' : 'bg-gradient-to-r from-red-900/20 to-red-950/20 border-red-900/50 text-red-400'}`}>
                  <div className={`p-2 ${feedback === 'correct' ? 'bg-green-900/30' : 'bg-red-900/30'}`}>{feedback === 'correct' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}</div>
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-500 mb-1">RESPONSE:</div>
                    <div className="flex items-center gap-3">
                      <div>{submissionMessage}</div>
                      {awardedPointsAmount !== null && <div className="px-2 py-1 bg-green-700 text-green-100 rounded text-xs font-mono uppercase">+{awardedPointsAmount} pts</div>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div className="space-y-8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between border-b border-gray-800/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-900/20 to-transparent border border-orange-900/30">
                <Lightbulb className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase">Recovered Intel</h3>
                <p className="text-[10px] text-gray-600 mt-1 font-mono">DATA_PACKETS_RECOVERED</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-gradient-to-br from-gray-900 to-black border border-gray-800/50">
              <span className="text-[10px] text-red-500 font-mono tracking-widest">PKT_{revealedHintsCount}</span>
            </div>
          </div>

          <div className="space-y-4 min-h-[180px]">
            {visibleHints.length === 0 ? (
              <motion.div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-800/50 bg-gradient-to-b from-gray-900/20 to-transparent group hover:border-gray-700/50 transition-all duration-300 cursor-pointer" onClick={handleRevealHint} whileHover={{ scale: 1.01 }}>
                <div className="p-4 mb-4 bg-gradient-to-br from-black to-gray-900 border border-gray-800/50 group-hover:border-gray-700/50 transition-colors">
                  <Key className="h-6 w-6 text-gray-600 group-hover:text-orange-500 transition-colors" />
                </div>
                <span className="text-xs text-gray-600 uppercase tracking-widest mb-2">No Intel Requested</span>
                <span className="text-[10px] text-gray-700">Click to request first data packet</span>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {visibleHints.map((h: string, i: number) => (
                  <motion.div key={i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="pl-6">
                      <div className="text-[10px] text-gray-600 mb-2 font-mono tracking-widest">PKT_{i + 1}</div>
                      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 p-4 border border-gray-800/50 text-gray-300 text-sm font-sans leading-relaxed group-hover:border-gray-700/50 transition-all">{h}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
            <div className="text-[10px] text-gray-600 font-mono">{puzzle.hints.length - revealedHintsCount} PACKETS REMAINING</div>
            <motion.button onClick={handleRevealHint} disabled={revealedHintsCount === puzzle.hints.length || feedback === 'correct'} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gradient-to-br from-gray-900 to-black border border-gray-800/50 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-orange-500 hover:border-orange-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2">
              <span>Request Intel</span>
              <ArrowRight size={12} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SolvePuzzleRight;
