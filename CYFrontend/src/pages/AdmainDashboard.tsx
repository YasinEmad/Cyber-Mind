import  { useState } from 'react';
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
  Users
} from 'lucide-react';

// --- Main App Component ---

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('puzzles');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 font-sans text-gray-100 overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-900">
          <LayoutDashboard className="text-blue-500 mr-3" size={28} />
          <h1 className="text-xl font-bold tracking-wider text-white">ADMIN<span className="text-blue-500">DASH</span></h1>
          <button 
            className="ml-auto lg:hidden text-gray-400"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col gap-1">
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

        {/* User Profile (Bottom of Sidebar) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
              AD
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden h-16 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-300">
                <Menu size={24} />
            </button>
            <span className="font-bold text-lg">Admin Dashboard</span>
            <div className="w-6"></div> {/* Spacer for center alignment */}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-900">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'puzzles' && <PuzzlesViewAdmin />}
            {activeTab === 'challenges' && <ChallengeView />}
            {activeTab === 'users-admin' && <GrantAdminSection />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;