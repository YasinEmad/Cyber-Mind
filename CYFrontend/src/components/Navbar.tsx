import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Gamepad2, Menu, X, Home, Info, Swords, Trophy, Star, User, BrainCircuit, ShieldCheck } from 'lucide-react';
import { selectUser, selectIsAdmin } from '@/redux/slices/userSlice';

const NavLinkItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-cyan-600 text-white'
            : 'text-slate-300 hover:bg-slate-700 hover:text-cyan-400'
        }`
      }
    >
      {children}
    </NavLink>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Game', path: '/game', icon: Swords },
    { name: 'Puzzles', path: '/puzzles', icon: BrainCircuit },
    { name: 'Challenges', path: '/challenges', icon: Star },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0A0A0A] backdrop-blur-md shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2 text-white">
            <Gamepad2 className="h-8 w-8 text-cyan-400" />
            <span className="font-extrabold text-xl tracking-wide">Cyber Mind</span>
          </NavLink>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLinkItem key={link.name} to={link.path}>
                <link.icon className="h-5 w-5 mr-2" />
                {link.name}
              </NavLinkItem>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <img
                className="h-10 w-10 rounded-full border-2 border-slate-600 group-hover:border-cyan-400 transition-all"
                src={user?.photoURL || 'https://picsum.photos/id/239/200/200'}
                alt="User Avatar"
              />
              <div className="absolute top-0 right-0 -mt-1 -mr-1 h-3 w-3 bg-green-400 rounded-full border-2 border-slate-900"></div>

              {/* Dropdown */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
                <NavLink
                  to="/profile"
                  className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-cyan-400"
                >
                  Your Profile
                </NavLink>
                <NavLink
                  to="/profile"
                  className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-cyan-400"
                >
                  Settings
                </NavLink>
                <a
                  href="#logout"
                  className="block px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-500"
                >
                  Sign out
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-400"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#000814] border-t border-slate-700">
          <div className="px-4 pt-4 pb-3 space-y-1">
            {navLinks.map((link) => (
              <NavLinkItem key={link.name} to={link.path} onClick={() => setIsOpen(false)}>
                <link.icon className="h-5 w-5 mr-3" />
                {link.name}
              </NavLinkItem>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-700">
            <div className="flex items-center px-5">
              <img
                className="h-10 w-10 rounded-full"
                src={user?.photoURL || 'https://picsum.photos/id/239/200/200'}
                alt="User"
              />
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user?.name || 'User'}</div>
                <div className="text-sm font-medium text-slate-400">{user?.email || 'No email'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
