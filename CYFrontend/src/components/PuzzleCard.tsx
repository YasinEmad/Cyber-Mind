import React, { useState, useRef } from 'react'
import { getPointsForLevel } from '@/lib/points'
import { motion } from 'framer-motion'
import { ChevronRight, Zap, Hash } from 'lucide-react'
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

  return (
    <motion.div
      onMouseEnter={scrambleTitle}
      onMouseLeave={resetTitle}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ duration: 0.25 }}
      className="
        group relative overflow-hidden rounded-2xl
        bg-gradient-to-b from-zinc-900 to-black
        border border-zinc-800
        p-6
        hover:border-red-500/40
        hover:shadow-[0_12px_40px_rgba(153,27,27,0.25)]
      "
    >
      <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5" />

      <div className="relative z-10 flex justify-between items-start mb-5">
        <div className="flex items-center gap-1.5 text-zinc-500 group-hover:text-red-500 transition-colors">
          <Hash size={12} />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
            Task {index + 1}
          </span>
        </div>

        <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-black border border-zinc-800">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase tracking-tight">
            LVL {puzzle.level || '01'}
          </span>
        </div>
      </div>

      <div className="relative z-10 mb-7">
        <h3 className="text-lg font-black font-mono tracking-tight text-white group-hover:text-red-500 transition-colors truncate">
          {displayedTitle}
        </h3>
        <p className="mt-2 text-[11px] text-zinc-600">
          Solve under time pressure. Logic focused task.
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-5 border-t border-zinc-800">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
            Reward
          </span>
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-orange-500" />
            <span className="text-sm font-mono font-black text-white">
              {rewardPoints}
              <span className="ml-1 text-[10px] text-zinc-500">PTS</span>
            </span>
          </div>
        </div>

        <button
          className="
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            bg-red-600
            border border-red-500/40
            text-white
            text-[10px] font-black uppercase tracking-wider
            shadow-md shadow-red-900/30
            hover:bg-red-500
            hover:scale-105
            active:scale-95
            transition
          "
        >
          Deploy
          <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  )
}

export default PuzzleCard
