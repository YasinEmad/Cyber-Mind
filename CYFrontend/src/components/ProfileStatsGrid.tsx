import React from 'react';
import { Trophy, CheckSquare, Puzzle, Flag, type IconProps } from 'lucide-react';

interface ProfileStatsGridProps {
  user: any;
}

const ProfileStatsGrid: React.FC<ProfileStatsGridProps> = ({ user }) => (
  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatBox icon={<Trophy />} label="Puzzles Points" value={user?.profile?.totalScore?.toLocaleString() || '0'} color="text-red-500" />
    <StatBox icon={<CheckSquare />} label="Completed" value={user?.profile?.challengesDone?.toString() || '0'} color="text-orange-500" />
    <StatBox icon={<Puzzle />} label="Puzzles" value={user?.profile?.puzzlesDone?.toString() || '0'} color="text-neutral-200" />
    <StatBox icon={<Flag />} label="Captures" value={user?.profile?.flags?.toString() || '0'} color="text-red-600" />
  </section>
);

const StatBox = ({ icon, label, value, color }: { icon: React.ReactElement<IconProps>; label: string; value: string; color: string }) => (
  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-[2rem] hover:border-neutral-700 transition-all">
    <div className={`mb-4 ${color}`}>{React.cloneElement(icon, { size: 24 })}</div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{label}</p>
    <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
  </div>
);

export default ProfileStatsGrid;
