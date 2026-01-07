import { useState } from 'react';
import { PuzzlesViewAdmin } from '../components/PuzzlesViewAdmin';
import ChallengeView from '../components/ChallengeView';
import GrantAdminSection from '../components/GrantAdminSection';
import SidebarItem from '../components/SidebarItem';
import { 
  Puzzle, 
  Trophy, 
  LayoutDashboard, 
  Menu,
  X,
  Users,
  ShieldAlert
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('puzzles');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // Changed to pure black background
    <div className="flex h-screen bg-black font-sans text-gray-200 overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-black border-r border-red-900/40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area - Red accents */}
        <div className="h-16 flex items-center px-6 border-b border-red-900/40 bg-black">
          <ShieldAlert className="text-red-600 mr-3" size={28} />
          <h1 className="text-xl font-bold tracking-tighter text-white">ADMIN<span className="text-red-600">CORE</span></h1>
          <button 
            className="ml-auto lg:hidden text-red-500"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col gap-1 px-2">
          <SidebarItem 
            icon={Puzzle} 
            label="Puzzles" 
            active={activeTab === 'puzzles'} 
            onClick={() => { setActiveTab('puzzles'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={Trophy} 
            label="Challenges" 
            active={activeTab === 'challenges'} 
            onClick={() => { setActiveTab('challenges'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={Users} 
            label="Users & Admin" 
            active={activeTab === 'users-admin'} 
            onClick={() => { setActiveTab('users-admin'); setIsMobileMenuOpen(false); }}
          />
        </nav>

        {/* User Profile (Bottom of Sidebar) - Changed to Red theme */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-red-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-red-700 to-black border border-red-600 flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]">
              AD
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-red-500 font-mono">Super_User</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header - Black and Red */}
        <div className="lg:hidden h-16 bg-black border-b border-red-900/40 flex items-center px-4 justify-between">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-red-500">
                <Menu size={24} />
            </button>
            <span className="font-bold text-lg text-white">Admin Dashboard</span>
            <div className="w-6"></div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black">
          <div className="max-w-6xl mx-auto">
            {/* Added a subtle glow behind the active view */}
            <div className="bg-zinc-950/50 rounded-xl border border-red-900/20 shadow-2xl shadow-red-900/5 p-2">
                {activeTab === 'puzzles' && <PuzzlesViewAdmin />}
                {activeTab === 'challenges' && <ChallengeView />}
                {activeTab === 'users-admin' && <GrantAdminSection />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;