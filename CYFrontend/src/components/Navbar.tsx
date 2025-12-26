import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Menu, X, Home, Info, Swords, 
  Trophy, Star, User, BrainCircuit, ShieldCheck 
} from 'lucide-react';
import { selectIsAdmin } from '@/redux/slices/userSlice';

// --- ANIMATED LINK COMPONENT ---
const NavLinkItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-transparent ${
          isActive
            ? 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
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

  // Mobile Menu Animation Variants
  const menuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    open: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <NavLink to="/" className="group flex items-center space-x-3 text-white">
            <div className="relative">
              <Gamepad2 className="h-8 w-8 text-red-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              {/* Logo Glow Effect */}
              <div className="absolute inset-0 bg-red-500 blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
            </div>
            <span className="font-black text-xl tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">
              Cyber Mind
            </span>
          </NavLink>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {navLinks.map((link) => (
              <NavLinkItem key={link.name} to={link.path}>
                <link.icon className="h-4 w-4 mr-2" />
                {link.name}
              </NavLinkItem>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative group p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              {isOpen ? <X className="h-6 w-6 relative z-10" /> : <Menu className="h-6 w-6 relative z-10" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Animated) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="lg:hidden overflow-hidden bg-black/90 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLinkItem to={link.path} onClick={() => setIsOpen(false)}>
                    <link.icon className="h-5 w-5 mr-3" />
                    {link.name}
                  </NavLinkItem>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}