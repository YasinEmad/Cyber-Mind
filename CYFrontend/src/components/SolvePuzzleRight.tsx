import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, Lightbulb, ChevronDown } from 'lucide-react';

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
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
}

const Divider = () => (
  <div className="h-px w-full bg-white/[0.06]" />
);

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
  isFocused,
  setIsFocused,
}) => {
  const hintsTotal = puzzle?.hints?.length ?? 0;
  const hintsLeft = hintsTotal - revealedHintsCount;
  const solved = feedback === 'correct';

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black via-gray-950 to-black">

      {/* ── Answer section ──────────────────────────────────────── */}
      <motion.div
        className="px-8 py-7 space-y-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Section label */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-red-500 uppercase tracking-[0.2em]">
            Your answer
          </span>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type your answer…"
              disabled={solved}
              autoComplete="off"
              spellCheck={false}
              className={`
                w-full bg-gray-900/40 border rounded-2xl
                px-5 py-4 text-[15px] text-gray-100 font-mono
                placeholder:text-gray-700
                focus:outline-none transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed
                ${isFocused
                  ? 'border-red-700/60 ring-2 ring-red-600/30 bg-gray-900/60 shadow-lg shadow-red-900/20'
                  : 'border-red-950/40 hover:border-red-900/60 hover:bg-gray-900/50'}
              `}
            />
            {/* char count */}
            {answer.length > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-mono text-gray-600 bg-gray-950/80 px-2 py-1 rounded-lg">
                {answer.length}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={solved || answer.trim() === ''}
            className={`
              w-full flex items-center justify-center gap-2
              py-3.5 rounded-2xl text-[13px] font-semibold tracking-wide
              transition-all duration-200
              disabled:opacity-30 disabled:cursor-not-allowed
              ${!solved && answer.trim()
                ? 'bg-gradient-to-r from-red-700 to-red-600 text-white hover:from-red-600 hover:to-red-500 active:scale-[0.99] shadow-lg shadow-red-900/50'
                : 'bg-gray-900/40 text-gray-600 border border-red-950/40'}
            `}
          >
            <span>Submit answer</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Keyboard hint */}
        <p className="text-center text-[10px] text-gray-700 font-mono">
          Press Enter to submit · Ctrl+H for hint
        </p>
      </motion.div>

      {/* ── Feedback ────────────────────────────────────────────── */}
      <AnimatePresence>
        {feedback !== 'idle' && (
          <motion.div
            className="px-8 pb-5"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <div className={`
              rounded-2xl border p-4 flex gap-3 shadow-lg
              ${feedback === 'correct'
                ? 'bg-gradient-to-r from-red-950/40 to-red-900/20 border-red-800/50 shadow-red-900/30'
                : 'bg-gradient-to-r from-red-950/50 to-red-900/30 border-red-800/60 shadow-red-900/40'}
            `}>
              <div className="flex-shrink-0 mt-0.5">
                {feedback === 'correct'
                  ? <CheckCircle2 size={16} className="text-red-500" />
                  : <XCircle size={16} className="text-red-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold mb-1 ${
                  feedback === 'correct' ? 'text-red-400' : 'text-red-300'
                }`}>
                  {feedback === 'correct' ? 'Correct!' : 'Not quite'}
                </p>
                {submissionMessage && (
                  <p className="text-[12px] text-gray-300 leading-relaxed">
                    {submissionMessage}
                  </p>
                )}
                {awardedPointsAmount != null && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center mt-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-900/40 to-red-800/30 border border-red-800/60 text-red-400 text-[11px] font-mono font-semibold shadow-lg shadow-red-900/30"
                  >
                    +{awardedPointsAmount} pts
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Divider />

      {/* ── Hints section ───────────────────────────────────────── */}
      <motion.div
        className="flex-1 flex flex-col px-8 py-7 space-y-5 overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb size={13} className="text-red-600" />
            <span className="text-[10px] font-medium text-red-500 uppercase tracking-[0.2em] font-semibold">
              Hints
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Progress dots */}
            <div className="flex gap-1">
              {Array.from({ length: hintsTotal }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < revealedHintsCount ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-700/40' : 'bg-gray-800/50'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-gray-600 font-medium">
              {revealedHintsCount}/{hintsTotal}
            </span>
          </div>
        </div>

        {/* Hints list */}
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800 pr-1">
          {visibleHints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-950/30 to-red-900/20 border border-red-900/40 flex items-center justify-center mb-1 shadow-lg shadow-red-950/20">
                <Lightbulb size={16} className="text-red-700" />
              </div>
              <p className="text-[13px] text-gray-400">No hints revealed yet</p>
              <p className="text-[11px] text-gray-600">Use the button below when you need a nudge</p>
            </div>
          ) : (
            visibleHints.map((hint, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                className="rounded-xl border border-red-900/40 bg-gradient-to-br from-red-950/20 to-red-900/10 p-4 space-y-1.5 hover:border-red-900/60 hover:bg-gradient-to-br hover:from-red-950/30 hover:to-red-900/20 transition-all duration-200 shadow-lg shadow-red-950/10"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-700/30" />
                  <span className="text-[10px] font-mono text-red-600 tracking-widest font-medium">
                    Hint {i + 1}
                  </span>
                </div>
                <p className="text-[13.5px] text-gray-200 leading-relaxed">{hint}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* Reveal button */}
        <button
          onClick={handleRevealHint}
          disabled={hintsLeft === 0 || solved}
          className={`
            w-full flex items-center justify-center gap-2
            py-3 rounded-2xl text-[13px] font-medium
            border transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
            ${hintsLeft > 0 && !solved
              ? 'border-red-900/50 text-red-500 hover:bg-red-950/15 hover:border-red-900/70 hover:text-red-400 shadow-lg shadow-red-950/20'
              : 'border-gray-800/40 text-gray-600'}
          `}
        >
          <ChevronDown size={13} />
          <span>
            {hintsLeft === 0
              ? 'All hints revealed'
              : `Reveal hint · ${hintsLeft} left`}
          </span>
        </button>
      </motion.div>
    </div>
  );
};

export default SolvePuzzleRight;