import React from 'react';
import { Edit, LogOut, Activity, Zap } from 'lucide-react';

interface ProfileSidebarProps {
  user: any;
  onEdit: () => void;
  onLogout: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user, onEdit, onLogout }) => {
  const getAvatarUrl = () => {
    if (user?.profile?.avatar) {
      return `https://cyber-mind.onrender.com/uploads/${user.profile.avatar}`;
    }
    return user?.photoURL || 'https://picsum.photos/id/239/200/200';
  };

  return (
  <aside className="w-72 h-full bg-gradient-to-b from-neutral-900 via-neutral-900 to-black border-r border-neutral-700 flex flex-col items-center py-8 px-6 relative z-20">
    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-600 via-orange-500 to-transparent opacity-30" />

    <div className="mb-10 flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
        <Zap className="text-white" size={20} fill="currentColor" />
      </div>
      <span className="font-black text-lg tracking-tighter text-white uppercase">Cyber-Mind</span>
    </div>

    <div className="flex flex-col items-center mb-10 w-full">
      <div className="relative group cursor-pointer mb-4" onClick={onEdit}>
        <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />
        <img
          src={getAvatarUrl()}
          alt="User"
          className="relative w-24 h-24 rounded-full border-2 border-neutral-700 object-cover group-hover:border-red-600/50 transition-colors"
        />
        <div className="absolute bottom-1 right-1 bg-red-600 p-2 rounded-full border-3 border-neutral-900 group-hover:scale-110 transition-transform shadow-lg">
          <Edit size={11} className="text-white" />
        </div>
      </div>
      <h2 className="text-lg font-bold text-white tracking-tight text-center">{user?.name || 'Agent'}</h2>
      <span className="text-neutral-500 text-xs font-mono uppercase tracking-[0.2em] mt-2 px-3 py-1 bg-neutral-800/50 rounded-full border border-neutral-700">Lvl 4 Operator</span>
    </div>

    <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent mb-6"></div>

    <nav className="w-full space-y-2 flex-1">
      <NavItem icon={<Activity size={18} />} label="Overview" active />
    </nav>

    <button
      onClick={onLogout}
      className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group border border-transparent hover:border-red-500/30"
    >
      <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
      <span className="font-bold text-sm uppercase tracking-widest">Terminate</span>
    </button>
  </aside>
);

};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactElement; label: string; active?: boolean }) => (
  <div className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all border ${active ? 'bg-red-600/10 text-red-400 border-red-600/30' : 'text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300 border-transparent hover:border-neutral-700'}`}>
    {icon}
    <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
  </div>
);

export default ProfileSidebar;
