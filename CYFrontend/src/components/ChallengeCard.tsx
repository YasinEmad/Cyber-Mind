import React from 'react';
import { motion } from 'framer-motion';
import { Challenge, ChallengeDifficulty } from '../types';
import { Play, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
}

const difficultyStyles: Record<ChallengeDifficulty, { badge: string; glow: string }> = {
  [ChallengeDifficulty.Easy]: {
    badge: 'bg-gray-800 text-gray-400',
    glow: 'hover:shadow-[0_0_20px_rgba(75,85,99,0.15)]',
  },
  [ChallengeDifficulty.Medium]: {
    badge: 'bg-orange-950/40 text-orange-500',
    glow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]',
  },
  [ChallengeDifficulty.Hard]: {
    badge: 'bg-red-950/40 text-red-500',
    glow: 'hover:shadow-[0_0_20px_rgba(127,29,29,0.3)]',
  },
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, index }) => {
  const styles = difficultyStyles[challenge.difficulty];

  return (
    <motion.div
      className={`relative bg-black border border-gray-800 rounded-lg overflow-hidden group transition-all duration-500 hover:border-red-500/60 ${styles.glow}`}
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      {/* Red 500 Blur Glow */}
      <div className="absolute -inset-1 bg-red-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Subtle Sheen */}
      <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:left-[100%] transition-all duration-1000" />

      {/* Difficulty Tag */}
      <div
        className={`absolute top-0 right-0 px-5 py-1 text-[10px] font-black uppercase tracking-tighter text-white ${challenge.difficulty === ChallengeDifficulty.Hard ? 'bg-red-600' : 'bg-gray-800'}`}
        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0% 100%)' }}
      >
        {challenge.difficulty}
      </div>
      
      <div className="p-7 flex flex-col h-full relative z-10">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-red-500" />
            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">System.Ready</span>
          </div>

          <h3 className="text-2xl font-black text-white leading-none group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-orange-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
            {challenge.title}
          </h3>
          
          <p className="mt-4 text-sm text-gray-300 font-medium leading-relaxed">
            {challenge.description || 'Complete this challenge to prove your mettle and earn points. High-stakes execution required.'}
          </p>
        </div>

        <div className="mt-8">
          <Link
            to={`/challenges/${challenge.id}`}
            className="relative w-full flex items-center justify-center px-4 py-4 bg-gray-900 border border-gray-800 text-white font-black text-xs tracking-widest rounded-md overflow-hidden transition-all duration-300 group/btn"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            
            <span className="relative flex items-center">
              <Play className="mr-2 h-4 w-4 fill-current" />
              INITIATE SEQUENCE
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeCard;