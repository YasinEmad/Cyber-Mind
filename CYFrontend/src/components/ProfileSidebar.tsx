import React from 'react';
import { Edit, LogOut, Activity, Zap } from 'lucide-react';

interface ProfileSidebarProps {
  user: any;
  onEdit: () => void;
  onLogout: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user, onEdit, onLogout }) => (
  <aside className="w-80 h-full bg-neutral-900/50 border-r border-neutral-800 flex flex-col items-center py-10 px-6 relative z-20">
    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-600 via-orange-500 to-transparent opacity-50" />

    <div className="mb-12 flex items-center gap-3">
      <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
        <Zap className="text-white" size={20} fill="currentColor" />
      </div>
      <span className="font-black text-xl tracking-tighter text-white uppercase">Cyber-Mind</span>
    </div>

    <div className="flex flex-col items-center mb-10">
      <div className="relative group cursor-pointer" onClick={onEdit}>
        <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-500" />
        <img
          src={user?.photoURL || 'https://picsum.photos/id/239/200/200'}
          alt="User"
          className="relative w-28 h-28 rounded-full border-2 border-neutral-800 object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-red-600 p-2 rounded-full border-4 border-neutral-900 group-hover:scale-110 transition-transform">
          <Edit size={12} className="text-white" />
        </div>
      </div>
      <h2 className="mt-4 text-xl font-bold text-white tracking-tight">{user?.name || 'Agent'}</h2>
      <span className="text-neutral-500 text-xs font-mono uppercase tracking-[0.2em] mt-1">Lvl 4 Operator</span>
    </div>

    <nav className="w-full space-y-2 flex-1">
      <NavItem icon={<Activity size={18} />} label="Overview" active />
    </nav>

    <button
      onClick={onLogout}
      className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all group"
    >
      <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
      <span className="font-bold text-sm uppercase tracking-widest">Terminate</span>
    </button>
  </aside>
);

const NavItem = ({ icon, label, active = false }: { icon: React.ReactElement; label: string; active?: boolean }) => (
  <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200'}`}>
    {icon}
    <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
  </div>
);

export default ProfileSidebar;
