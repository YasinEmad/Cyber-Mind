import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Terminal, Eye, BrainCircuit, Lightbulb, Cpu, Sparkles } from 'lucide-react';
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
}

const SolvePuzzleLeft: React.FC<Props> = ({
  puzzle,
  puzzleId,
  displayedTitle,
  scrambleTitle,
  isHoveringTitle,
  setIsHoveringTitle,
  displayedScenario,
  revealedHintsCount,
  feedback,
}) => {
  const levelPoints = getPointsForLevel(puzzle?.level);
  try { console.debug('SolvePuzzleLeft: puzzle.level:', puzzle?.level, 'typeof:', typeof puzzle?.level, 'levelPoints:', levelPoints); } catch (e) {}

  return (
    <div className="flex flex-col p-6 lg:p-12 bg-gradient-to-b from-gray-900/50 to-black border-r border-gray-800/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-red-900/30"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-orange-900/30"></div>

      <div className="flex-1 relative z-10">
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="relative p-3 border border-red-900/50 bg-gradient-to-br from-red-900/20 to-transparent shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <Lock size={20} className="text-red-500" />
              <div className="absolute inset-0 bg-red-600/10 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase font-mono">
                ACCESS_NODE: #{puzzleId?.substring(0, 8)}
              </span>
              <span className="text-[9px] text-gray-600 tracking-widest font-mono mt-1">CATEGORY: {puzzle.category.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 tracking-widest font-mono">SECURE_CONNECTION</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <motion.h1
            className="text-5xl lg:text-6xl font-black text-white mb-10 tracking-tight leading-[0.95] font-mono cursor-pointer group"
            onMouseEnter={scrambleTitle}
            onMouseLeave={() => setIsHoveringTitle && setIsHoveringTitle(false)}
          >
            <div className="relative inline-block">
              <span className={`bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent transition-all duration-500 ${isHoveringTitle ? 'blur-[1px]' : ''}`}>
                {displayedTitle}
              </span>
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/10 to-orange-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {isHoveringTitle && (
                <Sparkles className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-orange-500 animate-pulse" size={20} />
              )}
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-red-600 to-orange-600 mt-4"></div>
          </motion.h1>
        </motion.div>

        <motion.div className="relative p-8 bg-gradient-to-br from-black to-gray-900/50 border border-gray-800/50 overflow-hidden group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-red-500/30">
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 animate-pulse"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-900/20 border border-red-900/30">
                <Terminal size={16} className="text-red-500" />
              </div>
              <span className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase">MISSION_BRIEF</span>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed font-sans">
              {displayedScenario}
            </p>

            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-800/50">
              <Eye className="h-4 w-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-mono tracking-widest">SCROLL_COMPLETE: {Math.round((displayedScenario.length / puzzle.scenario.length) * 100)}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="grid grid-cols-3 gap-6 mt-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        {[
          { icon: BrainCircuit, label: 'INTEL_LVL', value: puzzle.level, color: 'text-red-500', bg: 'from-red-900/20 to-transparent' },
          { icon: Lightbulb, label: 'DATA_PACKETS', value: `${revealedHintsCount}/${puzzle.hints.length}`, color: 'text-orange-500', bg: 'from-orange-900/20 to-transparent' },
          { icon: Cpu, label: 'STATUS', value: feedback === 'correct' ? 'SOLVED' : 'ACTIVE', color: feedback === 'correct' ? 'text-green-500' : 'text-red-500', bg: feedback === 'correct' ? 'from-green-900/20 to-transparent' : 'from-gray-900/20 to-transparent' },
        ].map((stat, index) => (
          <div key={index} className={`bg-gradient-to-br ${stat.bg} border border-gray-800/50 p-6 relative group hover:border-gray-700/50 transition-all duration-300`}>
            <div className="flex flex-col items-center">
              <div className={`p-3 mb-4 bg-gradient-to-br from-black to-gray-900 border border-gray-800/50 group-hover:border-gray-700/50 transition-colors ${stat.color.replace('text-', 'bg-')}/10`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-[9px] text-gray-500 tracking-widest mb-2 font-mono">{stat.label}</span>
              <span className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</span>
              {stat.label === 'INTEL_LVL' && (
                <span className="text-xs text-gray-400 mt-1 font-mono">+{levelPoints} pts</span>
              )}
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity"></div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default SolvePuzzleLeft;
