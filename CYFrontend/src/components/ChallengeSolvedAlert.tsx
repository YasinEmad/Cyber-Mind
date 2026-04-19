import { motion } from 'framer-motion';
import { CheckCircle, Info, X } from 'lucide-react'; // Using Info for the already solved case
import * as React from 'react';

interface ChallengeSolvedAlertProps {
  challengeTitle: string;
  points: number;
  onClose: () => void;
  isSolvedBefore: boolean;
  isIncorrect?: boolean;
  message?: string;
}

const ChallengeSolvedAlert: React.FC<ChallengeSolvedAlertProps> = ({
  challengeTitle,
  points,
  onClose,
  isSolvedBefore,
  isIncorrect = false,
  message,
}) => {
  const feedbackSummary = message
    ? message
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(' ')
    : 'The vulnerability is still present. Please review your solution and try again.';

  const shortFeedback = feedbackSummary.length > 220
    ? `${feedbackSummary.slice(0, 220)}...`
    : feedbackSummary;

  if (isSolvedBefore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
        className="fixed top-24 right-4 z-50 w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-950/95 shadow-2xl p-4 text-slate-100 backdrop-blur"
      >
        <div className="relative flex flex-col gap-3 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-500 p-2 text-slate-950">
                <Info size={20} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-sky-300">Already solved</p>
                <p className="font-semibold text-white">{challengeTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              aria-label="Close alert"
            >
              <X size={18} />
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900/95 border border-slate-800 px-4 py-3">
            <p className="text-sm text-slate-300">You have already solved this challenge, so no additional points were awarded.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isIncorrect) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
        className="fixed top-24 right-4 z-50 w-full max-w-sm rounded-3xl border border-orange-600 bg-slate-950/95 shadow-2xl p-4 text-white backdrop-blur"
      >
        <div className="relative flex flex-col gap-3 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-500 p-2 text-slate-950">
                <X size={20} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-orange-300">AI Review</p>
                <p className="font-semibold text-white">{challengeTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              aria-label="Close alert"
            >
              <X size={18} />
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900/95 border border-slate-800 px-4 py-3">
            <p className="text-sm leading-relaxed text-slate-200">{shortFeedback}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
      className="fixed top-24 right-4 z-50 w-full max-w-sm rounded-3xl border border-emerald-500 bg-slate-950/95 shadow-2xl p-4 text-white backdrop-blur"
    >
      <div className="relative flex flex-col gap-3 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500 p-2 text-slate-950">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-emerald-300">Challenge Solved</p>
              <p className="font-semibold text-white">{challengeTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="Close alert"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-3xl bg-slate-900/95 border border-slate-800 px-4 py-3">
          <p className="text-sm text-slate-200">You earned <span className="font-semibold text-emerald-300">{points}</span> points.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeSolvedAlert;