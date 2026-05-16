import React from 'react';
import { Shield, TrendingUp } from 'lucide-react';

interface ProfileHeroSectionProps {
  user: any;
}

const ProfileHeroSection: React.FC<ProfileHeroSectionProps> = ({ user }) => {
  const solvedCount = user?.profile?.solvedCTFLevels?.length || 0;
  const totalScore = user?.profile?.totalScore || 0;

  return (
    <>
      <div className="lg:col-span-2 bg-gradient-to-br from-neutral-900 via-red-950/10 to-black border border-neutral-700 p-8 rounded-2xl flex flex-col justify-between min-h-[280px] relative overflow-hidden group hover:border-neutral-600 transition-all duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Shield size={120} className="text-red-600" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-600 rounded-full"></div>
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Welcome back</span>
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-3">
            {user?.name}
          </h1>
          <p className="text-neutral-400 max-w-md text-sm leading-relaxed">Ready to strengthen your cybersecurity skills and climb the global leaderboard?</p>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-green-400" />
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest">CTF Progress</p>
                <p className="text-2xl font-black text-white">{solvedCount}</p>
              </div>
            </div>
            <div className="w-px h-12 bg-neutral-700"></div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest">Total Points</p>
              <p className="text-2xl font-black text-emerald-400">{totalScore.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeroSection;
