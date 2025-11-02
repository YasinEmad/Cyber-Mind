
import React from 'react';
import { motion } from 'framer-motion';
import { Challenge, ChallengeDifficulty } from '../types';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
}

const difficultyStyles: Record<ChallengeDifficulty, { banner: string; text: string }> = {
  [ChallengeDifficulty.Easy]: {
    banner: 'bg-green-500',
    text: 'text-green-300',
  },
  [ChallengeDifficulty.Medium]: {
    banner: 'bg-yellow-500',
    text: 'text-yellow-300',
  },
  [ChallengeDifficulty.Hard]: {
    banner: 'bg-red-500',
    text: 'text-red-300',
  },
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, index }: ChallengeCardProps) => {
  const styles = difficultyStyles[challenge.difficulty];

  return (
    <motion.div
      className="relative bg-slate-800 border border-slate-700 rounded-lg overflow-hidden group transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/10"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      {/* Sheen Effect */}
      <div className="absolute top-0 left-[-75%] w-1/2 h-full bg-gradient-to-r from-transparent to-white/20 transform -skew-x-30 group-hover:left-[125%] transition-all duration-700" />

      <div
        className={`absolute top-0 right-0 px-6 py-1 text-sm font-bold text-white ${styles.banner}`}
        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0% 100%)' }}
      >
        {challenge.difficulty}
      </div>
      
      <div className="p-6 flex flex-col h-full mt-4">
        <div className="flex-grow">
          <h3 className="mt-4 text-xl font-bold text-white">{challenge.title}</h3>
          <p className="mt-2 text-sm text-slate-400">Complete this challenge to prove your mettle and earn points.</p>
        </div>
        <div className="mt-6">
          <Link
            to={`/challenges/${challenge.id}`}
            className="w-full flex items-center justify-center px-4 py-3 bg-slate-700 text-slate-200 font-semibold rounded-md group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Challenge
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeCard;