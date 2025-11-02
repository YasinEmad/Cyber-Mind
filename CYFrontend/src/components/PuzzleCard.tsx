
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Puzzle } from '../types';
import { BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PuzzleCardProps {
  puzzle: Puzzle;
  index: number;
}

const PuzzleCard: React.FC<PuzzleCardProps> = ({ puzzle, index }) => {
  const [displayedTitle, setDisplayedTitle] = useState(puzzle.title);
  const intervalRef = useRef<number | null>(null);
  const letters = "!<>-_\\/[]{}—=+*^?#________";

  const scrambleTitle = () => {
    let iteration = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(() => {
      setDisplayedTitle(
        puzzle.title
          .split("")
          .map((letter, index) => {
            if(index < iteration) {
              return puzzle.title[index];
            }
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("")
      );
      
      if(iteration >= puzzle.title.length){
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      
      iteration += 1 / 3;
    }, 30);
  };
  
  const resetTitle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setDisplayedTitle(puzzle.title);
  };

  return (
    <motion.div
      className="relative bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl group transition-all duration-300 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      onMouseEnter={scrambleTitle}
      onMouseLeave={resetTitle}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="p-6 flex flex-col h-full relative z-10">
        <div className="flex-grow">
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border bg-purple-600/30 text-purple-300 border-purple-500/50`}
          >
            {puzzle.category}
          </span>
          <h3 className="mt-4 text-xl font-bold text-white font-mono h-7">{displayedTitle}</h3>
          <p className="mt-2 text-sm text-slate-400">{puzzle.description}</p>
        </div>
        <div className="mt-6">
          <Link
            to={`/puzzles/${puzzle.id}`}
            className="w-full flex items-center justify-center px-4 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300"
          >
            <BrainCircuit className="mr-2 h-5 w-5" />
            Start Solving
          </Link>
        </div>
      </div>
       <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full filter blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
    </motion.div>
  );
};

export default PuzzleCard;