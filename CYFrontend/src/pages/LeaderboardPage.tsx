
import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import LeaderboardItem from '@/components/LeaderboardItem';
import { LeaderboardUser } from '@/types';
import { ChevronDown } from 'lucide-react';

const leaderboardData: LeaderboardUser[] = [
  { rank: 1, username: 'CyberNinja', avatar: 'https://picsum.photos/id/10/100/100', score: 9850 },
  { rank: 2, username: 'VortexViper', avatar: 'https://picsum.photos/id/20/100/100', score: 9500 },
  { rank: 3, username: 'QuantumQuasar', avatar: 'https://picsum.photos/id/30/100/100', score: 9120 },
  { rank: 4, username: 'PixelProwler', avatar: 'https://picsum.photos/id/40/100/100', score: 8800 },
  { rank: 5, username: 'GhostGamer', avatar: 'https://picsum.photos/id/50/100/100', score: 8540 },
  { rank: 6, username: 'ShadowStriker', avatar: 'https://picsum.photos/id/60/100/100', score: 8210 },
  { rank: 7, username: 'FrostByte', avatar: 'https://picsum.photos/id/70/100/100', score: 7990 },
];

const LeaderboardPage: React.FC = () => {
  return (
    <PageWrapper>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
        <p className="text-slate-300 mt-2">See who's dominating the arena.</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-4">
          <div className="relative">
            <button className="flex items-center bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors">
              <span>Filter: All-Time</span>
              <ChevronDown className="ml-2 h-5 w-5"/>
            </button>
            {/* Dropdown menu (static) */}
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex justify-between items-center bg-slate-800/70 p-4 font-bold text-slate-400 text-sm">
              <span className="w-1/6 text-left pl-4">Rank</span>
              <span className="w-3/6 text-left">Player</span>
              <span className="w-2/6 text-right pr-4">Score</span>
          </div>
          <div className="space-y-2 p-2">
            {leaderboardData.map((user, index) => (
              <LeaderboardItem key={user.rank} user={user} index={index} />
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default LeaderboardPage;
