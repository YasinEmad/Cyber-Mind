
import React from 'react';
import { motion } from 'framer-motion';
import { LeaderboardUser } from '../types';
import { Crown } from 'lucide-react';

interface LeaderboardItemProps {
  user: LeaderboardUser;
  index: number;
}

const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-300';
  if (rank === 3) return 'text-orange-400';
  return 'text-slate-400';
};

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ user, index }) => {
  return (
    <motion.div
      className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
        user.rank <= 3 ? 'bg-slate-700/50' : 'bg-slate-800/30 hover:bg-slate-700/50'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <div className="w-1/6 flex items-center justify-start pl-4">
        <span className={`text-lg font-bold ${getRankColor(user.rank)}`}>
          {user.rank}
        </span>
        {user.rank === 1 && <Crown className="ml-2 h-5 w-5 text-yellow-400" />}
      </div>
      <div className="w-3/6 flex items-center">
        <img src={user.avatar} alt={user.username} className="h-10 w-10 rounded-full mr-4 border-2 border-slate-600" />
        <span className="font-semibold text-white">{user.username}</span>
      </div>
      <div className="w-2/6 text-right pr-4">
        <span className="font-bold text-lg text-cyan-400">{user.score.toLocaleString()}</span>
      </div>
    </motion.div>
  );
};

export default LeaderboardItem;
