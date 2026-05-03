import React from 'react';
import { Shield } from 'lucide-react';

interface ProfileHeroSectionProps {
  user: any;
}

const ProfileHeroSection: React.FC<ProfileHeroSectionProps> = ({ user }) => (
  <>
    <div className="lg:col-span-2 bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 p-8 rounded-[2.5rem] flex flex-col justify-between min-h-[250px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
        <Shield size={120} className="text-red-600" />
      </div>
      <div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
          Welcome back, <br />
          <span className="text-red-600">{user?.name}</span>
        </h1>
        <p className="text-neutral-500 max-w-sm">Are you ready for more challenges ?</p>
      </div>
      <div className="flex gap-4">
        <button className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-bold shadow-lg shadow-red-900/40 transition-all">
          Start Challenge
        </button>
      </div>
    </div>

    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full border-4 border-red-900/30 border-t-red-600 flex items-center justify-center mb-4">
        <span className="text-2xl font-black text-white">42</span>
      </div>
      <p className="text-sm font-bold text-white uppercase tracking-widest">Global Rank</p>
      <p className="text-xs text-neutral-500 mt-1">Top 2% of Operators</p>
    </div>
  </>
);

export default ProfileHeroSection;
