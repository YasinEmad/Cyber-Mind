import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Terminal, Eye, BrainCircuit, Lightbulb, Cpu, Sparkles, Zap, Award } from 'lucide-react';
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
  
  // Determine difficulty color
  const getDifficultyInfo = (level: number) => {
    if (level <= 3) return { color: 'green', label: 'EASY', bg: 'from-green-600 to-green-700' }
    if (level <= 6) return { color: 'yellow', label: 'MEDIUM', bg: 'from-yellow-600 to-yellow-700' }
    if (level <= 9) return { color: 'orange', label: 'HARD', bg: 'from-orange-600 to-orange-700' }
    return { color: 'red', label: 'EXTREME', bg: 'from-red-600 to-red-700' }
  }
  
  const difficulty = getDifficultyInfo(puzzle?.level || 1)
  
  try { console.debug('SolvePuzzleLeft: puzzle.level:', puzzle?.level, 'typeof:', typeof puzzle?.level, 'levelPoints:', levelPoints); } catch (e) {}

  return (
    <div className="flex flex-col p-8 lg:p-12 bg-gradient-to-b from-zinc-900/40 via-black to-black border-r border-zinc-800/50 relative overflow-hidden h-full">
      {/* Ambient effects */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-red-600/5 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-600/5 blur-3xl rounded-full"></div>
      <div className="absolute top-0 right-1/4 w-32 h-32 border-t border-l border-red-500/10"></div>

      <div className="flex-1 relative z-10 space-y-8">
        {/* Header with Access Node */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative p-3 border border-red-600/60 bg-gradient-to-br from-red-600/20 to-transparent shadow-[0_0_20px_rgba(220,38,38,0.15)]">
              <Lock size={18} className="text-red-500" />
              <div className="absolute inset-0 bg-red-600/5 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-500 tracking-[0.3em] uppercase font-mono">
                NODE: {puzzleId?.substring(0, 8).toUpperCase()}
              </span>
              <span className="text-[9px] text-zinc-600 tracking-widest font-mono mt-1">CAT: {puzzle?.category?.toUpperCase()}</span>
            </div>
          </div>
          <motion.div 
            className={`px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider bg-gradient-to-r ${difficulty.bg} text-white border border-${difficulty.color}-500/60`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {difficulty.label}
          </motion.div>
        </motion.div>

        {/* Main Title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <motion.h1
            className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight leading-tight font-mono cursor-pointer group"
            onMouseEnter={scrambleTitle}
            onMouseLeave={() => setIsHoveringTitle && setIsHoveringTitle(false)}
          >
            <div className="relative inline-block">
              <span className={`bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent transition-all duration-500 ${isHoveringTitle ? 'blur-[0.5px]' : ''}`}>
                {displayedTitle}
              </span>
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/15 to-orange-600/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {isHoveringTitle && (
                <Sparkles className="absolute -right-8 top-0 text-orange-500 animate-pulse" size={20} />
              )}
            </div>
            <div className="h-1.5 w-20 bg-gradient-to-r from-red-600 to-orange-600 mt-4 rounded-full"></div>
          </motion.h1>
        </motion.div>

        {/* Mission Brief */}
        <motion.div 
          className="relative p-6 bg-gradient-to-br from-zinc-900/60 to-black border border-zinc-800 rounded-xl overflow-hidden group"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-red-500/20 group-hover:border-red-500/40 transition-colors"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Terminal size={14} className="text-orange-500" />
              <span className="text-[9px] font-bold text-zinc-400 tracking-[0.2em] uppercase">Brief</span>
            </div>

            <p className="text-zinc-300 text-sm leading-relaxed font-sans min-h-[120px] max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {displayedScenario}
            </p>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800/50">
              <Eye className="h-3 w-3 text-zinc-600" />
              <span className="text-[8px] text-zinc-600 font-mono tracking-widest">
                {displayedScenario.length > 0 ? 'Brief loaded' : 'Loading...'}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-zinc-800/50"></div>
              <span className="text-[8px] text-zinc-600 font-mono">{Math.round((displayedScenario.length / (puzzle?.scenario?.length || 1)) * 100)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-3 gap-4" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: BrainCircuit, label: 'Level', value: puzzle?.level || 1, color: 'red', badge: 'ALV' },
            { icon: Lightbulb, label: 'Hints', value: `${revealedHintsCount}/${puzzle?.hints?.length || 0}`, color: 'orange', badge: 'PKT' },
            { icon: Award, label: 'Reward', value: `+${levelPoints}`, color: 'green', badge: 'PTS' },
          ].map((stat, index) => (
            <motion.div 
              key={index} 
              className={`bg-gradient-to-br from-${stat.color}-900/15 to-transparent border border-${stat.color}-600/30 p-4 rounded-lg relative group hover:border-${stat.color}-500/50 transition-all duration-300 cursor-default`}
              whileHover={{ y: -2 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg bg-gradient-to-br from-${stat.color}-600/10 to-transparent"></div>
              
              <div className="relative z-10 flex flex-col items-center space-y-3">
                <div className={`p-2 bg-${stat.color}-900/30 border border-${stat.color}-600/30 rounded-lg group-hover:border-${stat.color}-500/50 transition-colors`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
                </div>
                <div className="text-center">
                  <div className={`text-[10px] text-${stat.color}-600 font-mono tracking-wider mb-1 uppercase font-bold`}>{stat.label}</div>
                  <div className={`text-lg font-black font-mono text-${stat.color}-400`}>{stat.value}</div>
                </div>
                <div className={`text-[7px] px-2 py-0.5 rounded bg-${stat.color}-900/40 text-${stat.color}-600 font-mono uppercase tracking-widest`}>
                  {stat.badge}
                </div>
              </div>
              
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-px bg-${stat.color}-600/50 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Status Bar */}
        <motion.div 
          className={`p-4 rounded-lg border-l-4 font-mono text-[9px] uppercase tracking-wider transition-all ${
            feedback === 'correct' 
              ? 'bg-green-900/20 border-l-green-600 text-green-400' 
              : feedback === 'incorrect'
              ? 'bg-red-900/20 border-l-red-600 text-red-400'
              : 'bg-blue-900/20 border-l-blue-600 text-blue-400'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2">
            <Zap size={12} />
            <span>
              {feedback === 'correct' ? '✓ Challenge Solved!' : feedback === 'incorrect' ? '✗ Incorrect Answer' : 'Awaiting Input'}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SolvePuzzleLeft;
