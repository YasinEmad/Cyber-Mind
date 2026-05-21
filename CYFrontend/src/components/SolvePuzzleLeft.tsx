import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Terminal, Eye, BrainCircuit, Lightbulb, Award, Clock, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { getPointsForLevel } from '@/lib/points';

interface Props {
  puzzle: any;
  puzzleId?: string;
  displayedTitle: string;
  scrambleTitle: () => void;
  isHoveringTitle: boolean;
  setIsHoveringTitle?: (v: boolean) => void;
  displayedScenario: string;
  revealedHintsCount: number;
  feedback: 'idle' | 'correct' | 'incorrect';
  elapsedTime: number;
  formatTime: (ms: number) => string;
}

const DIFFICULTY_MAP: Record<string, { label: string; color: string; dot: string }> = {
  easy:    { label: 'Easy',    color: 'text-red-500', dot: 'bg-red-500' },
  medium:  { label: 'Medium',  color: 'text-red-600',   dot: 'bg-red-600'   },
  hard:    { label: 'Hard',    color: 'text-red-700',  dot: 'bg-red-700'  },
  extreme: { label: 'Extreme', color: 'text-red-800',    dot: 'bg-red-800'    },
};

function getDifficulty(level: number) {
  if (level <= 3) return DIFFICULTY_MAP.easy;
  if (level <= 6) return DIFFICULTY_MAP.medium;
  if (level <= 9) return DIFFICULTY_MAP.hard;
  return DIFFICULTY_MAP.extreme;
}

const Divider = () => (
  <div className="h-px w-full bg-white/[0.06]" />
);

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: string;
}> = ({ icon: Icon, label, value, sub }) => (
  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-gradient-to-br from-gray-900/60 to-black/60 border border-red-950/40 hover:border-red-900/60 hover:bg-gradient-to-br hover:from-gray-900/80 hover:to-black/80 transition-all duration-200 shadow-lg shadow-red-950/30">
    <div className="flex items-center gap-2">
      <Icon size={13} className="text-gray-500" />
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-xl font-semibold text-gray-100 leading-none tabular-nums">{value}</div>
    {sub && <div className="text-[10px] text-gray-600 font-mono">{sub}</div>}
  </div>
);

const SolvePuzzleLeft: React.FC<Props> = ({
  puzzle,
  puzzleId,
  displayedTitle,
  displayedScenario,
  revealedHintsCount,
  feedback,
  elapsedTime,
  formatTime,
}) => {
  const levelPoints = getPointsForLevel(puzzle?.level);
  const difficulty = getDifficulty(puzzle?.level || 1);
  const loadPct = Math.round((displayedScenario.length / (puzzle?.scenario?.length || 1)) * 100);

  const statusConfig = {
    correct: {
      icon: CheckCircle2,
      text: 'Challenge solved',
      className: 'text-red-400 bg-gradient-to-r from-red-950/40 to-red-900/20 border-red-800/50 shadow-lg shadow-red-900/30',
    },
    incorrect: {
      icon: XCircle,
      text: 'Incorrect — try again',
      className: 'text-red-500 bg-gradient-to-r from-red-950/50 to-red-900/30 border-red-800/60 shadow-lg shadow-red-900/40',
    },
    idle: {
      icon: Circle,
      text: 'Awaiting your answer',
      className: 'text-gray-500 bg-gradient-to-r from-gray-900/50 to-gray-800/30 border-gray-800/40 shadow-lg shadow-gray-950/30',
    },
  }[feedback];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black via-gray-950 to-black border-r border-red-950/30">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <motion.div
        className="flex items-center justify-between px-8 py-5"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-900/40 to-red-950/50 border border-red-900/50 shadow-lg shadow-red-950/30">
            <Lock size={14} className="text-red-600" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-gray-500 tracking-[0.2em] uppercase leading-none">
              {puzzleId?.substring(0, 8).toUpperCase() ?? '—'}
            </p>
            <p className="text-[10px] font-mono text-gray-600 tracking-widest mt-0.5 uppercase">
              {puzzle?.category ?? 'General'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dot}`} />
          <span className={`text-[11px] font-semibold tracking-wide ${difficulty.color}`}>
            {difficulty.label}
          </span>
        </div>
      </motion.div>

      <Divider />

      {/* ── Scrollable body ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-7 space-y-7 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">

        {/* Title */}
       <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.08, duration: 0.4, ease: "easeOut" }}
>
  <h1
    className="
      text-[28px]
      font-semibold
      leading-snug
      tracking-tight
      bg-gradient-to-r
      from-rose-500
      via-red-400
      to-orange-300
      bg-clip-text
      text-transparent
    "
  >
    {displayedTitle}
  </h1>
</motion.div>

        {/* Description card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
          className="rounded-2xl border border-red-900/40 bg-gradient-to-br from-red-950/20 to-black/40 overflow-hidden shadow-lg shadow-red-950/20"
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-red-900/30 bg-red-950/10">
            <Terminal size={12} className="text-red-600" />
            <span className="text-[10px] font-medium text-red-400 uppercase tracking-[0.2em]">
              Scenario
            </span>
            <div className="flex-1" />
            {loadPct < 100 ? (
              <span className="text-[10px] font-mono text-red-500 font-semibold">{loadPct}%</span>
            ) : (
              <div className="flex items-center gap-1">
                <Eye size={10} className="text-red-600" />
                <span className="text-[10px] font-mono text-red-400 font-semibold">Loaded</span>
              </div>
            )}
          </div>

          <div className="px-5 py-4">
            <div className="text-[14px] text-gray-300 leading-[1.85] min-h-[100px] max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-red-900/50 whitespace-pre-wrap break-words">
              {displayedScenario || <span className="text-gray-600 italic">Loading scenario…</span>}
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4, ease: 'easeOut' }}
        >
          <StatCard
            icon={BrainCircuit}
            label="Level"
            value={puzzle?.level ?? 1}
            sub={`Difficulty ${difficulty.label}`}
          />
          <StatCard
            icon={Clock}
            label="Elapsed"
            value={formatTime(elapsedTime)}
            sub="hh:mm:ss"
          />
          <StatCard
            icon={Lightbulb}
            label="Hints used"
            value={`${revealedHintsCount} / ${puzzle?.hints?.length ?? 0}`}
            sub={revealedHintsCount === 0 ? 'None revealed' : `${puzzle?.hints?.length - revealedHintsCount} remaining`}
          />
          <StatCard
            icon={Award}
            label="Reward"
            value={`+${levelPoints}`}
            sub="points on solve"
          />
        </motion.div>

        {/* Status pill */}
        <motion.div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-[12px] font-medium transition-all duration-300 ${statusConfig.className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <StatusIcon size={14} />
          <span>{statusConfig.text}</span>
        </motion.div>

      </div>
    </div>
  );
};

export default SolvePuzzleLeft;