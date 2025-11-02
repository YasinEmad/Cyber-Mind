
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Gamepad2, Menu, X, Home, Info, Swords, Trophy, Star, User, BrainCircuit } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'About', path: '/about', icon: Info },
  { name: 'Game', path: '/game', icon: Swords },
  { name: 'Puzzles', path: '/puzzles', icon: BrainCircuit },
  { name: 'Challenges', path: '/challenges', icon: Star },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { name: 'Profile', path: '/profile', icon: User },
];

const NavLinkItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-slate-700 text-cyan-400'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <NavLink to="/" className="flex items-center space-x-2 text-white">
              <Gamepad2 className="h-8 w-8 text-cyan-400" />
              <span className="font-bold text-xl">Cyber Mind</span>
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <NavLinkItem key={link.name} to={link.path}>
                  <link.icon className="h-5 w-5 mr-2" />
                  {link.name}
                </NavLinkItem>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
                <div className="relative group">
                    <img className="h-10 w-10 rounded-full border-2 border-slate-600 group-hover:border-cyan-400 transition-all" src="https://picsum.photos/id/237/100/100" alt="User Avatar"/>
                    <div className="absolute top-0 right-0 -mt-1 -mr-1 h-3 w-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
                     <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
                        <a href="#profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Your Profile</a>
                        <a href="#settings" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Settings</a>
                        <a href="#logout" className="block px-4 py-2 text-sm text-red-400 hover:bg-slate-700">Sign out</a>
                    </div>
                </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLinkItem key={link.name} to={link.path} onClick={() => setIsOpen(false)}>
                <link.icon className="h-5 w-5 mr-3" />
                {link.name}
              </NavLinkItem>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src="https://picsum.photos/id/237/100/100" alt="" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">Tom Cook</div>
                <div className="text-sm font-medium leading-none text-slate-400">tom@example.com</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
