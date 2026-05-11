import React from 'react';
import { Trophy, CheckSquare, Puzzle, Flag } from 'lucide-react';

interface ProfileStatsGridProps {
  user: any;
}

const ProfileStatsGrid: React.FC<ProfileStatsGridProps> = ({ user }) => (
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatBox icon={<Trophy />} label="Total Points" value={user?.profile?.totalScore?.toLocaleString() || '0'} color="text-emerald-400" />
    <StatBox icon={<CheckSquare />} label="Challenges Completed" value={user?.profile?.challengesDone?.toString() || '0'} color="text-blue-400" />
    <StatBox icon={<Puzzle />} label="Puzzles" value={user?.profile?.puzzlesDone?.toString() || '0'} color="text-purple-400" />
    <StatBox icon={<Flag />} label="CTFs Solved" value={(user?.profile?.solvedCTFLevels?.length || 0).toString()} color="text-red-400" />
  </section>
);

const StatBox = ({ icon, label, value, color }: { icon: React.ReactElement<{ size?: number | string }>; label: string; value: string; color: string }) => (
  <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-700 p-6 rounded-xl hover:border-neutral-600 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-lg bg-neutral-800/50 group-hover:bg-neutral-800 transition-colors ${color}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500 mb-1">{label}</p>
    <p className="text-3xl font-black text-white tracking-tight">{value}</p>
  </div>
);

export default ProfileStatsGrid;
