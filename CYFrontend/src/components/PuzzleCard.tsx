import React, { useState, useRef } from 'react'
import { getPointsForLevel } from '@/lib/points'
import { motion } from 'framer-motion'
import { ChevronRight, Zap, Hash, Star, TrendingUp } from 'lucide-react'
import { Puzzle } from '../types'

interface PuzzleCardProps {
  puzzle: Puzzle
  index: number
}

const PuzzleCard: React.FC<PuzzleCardProps> = ({ puzzle, index }) => {
  const [displayedTitle, setDisplayedTitle] = useState(puzzle.title)
  const intervalRef = useRef<number | null>(null)

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  const scrambleTitle = () => {
    let iteration = 0
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = window.setInterval(() => {
      setDisplayedTitle(
        puzzle.title
          .split('')
          .map((char, idx) => {
            if (idx < iteration || char === ' ') return puzzle.title[idx]
            return letters[Math.floor(Math.random() * letters.length)]
          })
          .join('')
      )

      if (iteration >= puzzle.title.length) {
        clearInterval(intervalRef.current!)
      }

      iteration += 0.5
    }, 25)
  }

  const resetTitle = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisplayedTitle(puzzle.title)
  }

  // Determine display points from puzzle level (keeps in sync with backend logic)
  const rewardPoints = getPointsForLevel(puzzle.level)
  
  // Determine difficulty level based on puzzle level
  const getDifficultyColor = (level: number) => {
    if (level <= 3) return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', label: 'EASY' }
    if (level <= 6) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'MEDIUM' }
    if (level <= 9) return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', label: 'HARD' }
    return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'EXTREME' }
  }
  
  const difficulty = getDifficultyColor(puzzle.level || 1)

  return (
    <motion.div
      onMouseEnter={scrambleTitle}
      onMouseLeave={resetTitle}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="
        group relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-zinc-900/50 via-black to-zinc-950
        border border-zinc-800
        p-6
        hover:border-red-500/60
        hover:shadow-[0_20px_60px_rgba(239,68,68,0.2)]
        backdrop-blur-sm
      "
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-br from-red-600/10 via-transparent to-orange-600/5" />

      {/* Top Section: Index and Difficulty */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex items-center gap-1.5 text-zinc-500 group-hover:text-red-500 transition-colors">
          <Hash size={12} />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
            Challenge {index + 1}
          </span>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${difficulty.bg} border ${difficulty.border}`}>
          <TrendingUp size={12} className={difficulty.text} />
          <span className={`text-[9px] font-black uppercase tracking-tight ${difficulty.text}`}>
            {difficulty.label}
          </span>
        </div>
      </div>

      {/* Title and Description */}
      <div className="relative z-10 mb-8">
        <h3 className="text-lg font-black font-mono tracking-tight text-white group-hover:text-red-400 transition-colors duration-300 line-clamp-2">
          {displayedTitle}
        </h3>
        <p className="mt-2 text-[11px] text-zinc-500 line-clamp-2">
          Solve under time pressure. Logic focused task.
        </p>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mb-6 p-3 rounded-lg bg-black/40 border border-zinc-800/50">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Level</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-mono text-white font-bold">{puzzle.level || 1}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Reward</span>
          <div className="flex items-center gap-1">
            <Zap size={11} className="text-orange-500" />
            <span className="text-xs font-mono text-white font-bold">{rewardPoints}</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <Star size={12} className="text-yellow-500/60" />
          <span className="text-[8px] font-mono text-zinc-600 uppercase">Explore</span>
        </div>

        <button
          className="
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            bg-gradient-to-r from-red-600 to-red-700
            border border-red-500/60
            text-white
            text-[9px] font-black uppercase tracking-wider
            shadow-lg shadow-red-900/40
            hover:from-red-500 hover:to-red-600
            hover:border-red-400
            hover:shadow-red-900/60
            hover:scale-105
            active:scale-95
            transition duration-200
          "
        >
          Solve
          <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  )
}

export default PuzzleCard
