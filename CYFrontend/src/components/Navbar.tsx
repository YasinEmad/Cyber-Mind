import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Gamepad2, Menu, X, Home, Info, Swords, Trophy, Star, User, BrainCircuit, ShieldCheck } from 'lucide-react';
import { selectIsAdmin } from '@/redux/slices/userSlice';

const NavLinkItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-[#b91c1c] text-[#ffffff]'
            : 'text-[#d1d5db] hover:bg-[#0A0A0A] hover:text-[#ef4444]'
        }`
      }
    >
      {children}
    </NavLink>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
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
    <nav className="fixed top-0 left-0 right-25 bg-[#0A0A0A] backdrop-blur-md z-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-4 text-[#ffffff] ">
            <Gamepad2 className="h-8 w-8 text-[#ef4444]" />
            <span className="font-extrabold text-xl tracking-wide">Cyber Mind</span>
          </NavLink>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLinkItem key={link.name} to={link.path}>
                <link.icon className="h-5 w-5 mr-2 text-[#ef4444]" />
                {link.name}
              </NavLinkItem>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-[#0A0A0A] inline-flex items-center justify-center p-2 rounded-lg text-[#9ca3af] hover:text-[#ef4444] transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-[#374151]">
          <div className="px-4 pt-4 pb-3 space-y-1">
            {navLinks.map((link) => (
              <NavLinkItem key={link.name} to={link.path} onClick={() => setIsOpen(false)}>
                <link.icon className="h-5 w-5 mr-3 text-[#ef4444]" />
                {link.name}
              </NavLinkItem>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
