import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Shield, 
  Zap, 
  Target, 
  ChevronRight, 
  Lock, 
  Trophy, 
  Star, 
  Play,
  BarChart3,
  Users,
  Clock
} from "lucide-react";
import ctfInfo from "@/utils/ctfinfo";

interface LevelData {
  level: number;
  name: string;
  description: string;
  category: string;
}

const keyframes = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

@keyframes floatImage {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-8px) scale(1.02); }
}

@keyframes scanline {
  0% { top: -8%; }
  100% { top: 108%; }
}

@keyframes glitch {
  0%, 94%, 100% { clip-path: none; transform: translate(0); opacity: 1; }
  95% { clip-path: polygon(0 30%, 100% 30%, 100% 45%, 0 45%); transform: translate(-3px, 1px); opacity: 0.9; }
  97% { clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%); transform: translate(3px, -1px); opacity: 0.9; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
}

@keyframes levelPop {
  0% { transform: scale(0.6) translateY(15px); opacity: 0; }
  70% { transform: scale(1.1) translateY(-3px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes redGlow {
  0%, 100% { text-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.4); }
  50% { text-shadow: 0 0 30px rgba(239, 68, 68, 1), 0 0 60px rgba(239, 68, 68, 0.6); }
}

@keyframes matrixRain {
  0% { transform: translateY(-100vh); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes borderGlow {
  0%, 100% { border-color: rgba(239, 68, 68, 0.3); box-shadow: 0 0 20px rgba(239, 68, 68, 0.1); }
  50% { border-color: rgba(239, 68, 68, 0.8); box-shadow: 0 0 40px rgba(239, 68, 68, 0.3); }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
  33% { transform: translateY(-20px) rotate(120deg); opacity: 0.7; }
  66% { transform: translateY(-10px) rotate(240deg); opacity: 0.5; }
}

@keyframes hologram {
  0%, 100% { opacity: 0.8; transform: translateY(0px); }
  50% { opacity: 1; transform: translateY(-2px); }
}

@keyframes dataStream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cyberpunkGlow {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1), inset 0 0 20px rgba(239, 68, 68, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.5), 0 0 60px rgba(239, 68, 68, 0.2), inset 0 0 30px rgba(239, 68, 68, 0.2);
  }
}
`;

function LevelGrid({ show, category }: { show: boolean; category: string }) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const filteredLevels = ctfInfo.levels.filter((level: LevelData) => level.category === category);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Linux': return <Terminal className="w-4 h-4" />;
      case 'Windows': return <Shield className="w-4 h-4" />;
      case 'Network': return <Zap className="w-4 h-4" />;
      case 'Web Security': return <Target className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Grid container with cyberpunk styling */}
      <div className="relative p-6 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-red-500/20 rounded-2xl overflow-hidden">
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 p-[2px]">
          <div className="w-full h-full bg-gray-900/90 rounded-2xl" />
        </div>

        {/* Data stream effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-dataStream" />

        <div className="relative z-10">
          <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto">
            {filteredLevels.map((levelData, index) => {
              const isFirst = index === 0;
              const isHovered = hoveredLevel === levelData.level;
              const isSelected = selectedLevel === levelData.level;
              const levelLink = `/game/level/${levelData.level}`;

              return (
                <motion.div
                  key={levelData.level}
                  className="relative"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  <Link to={levelLink} className="block">
                    <motion.div
                      className={`relative aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        isFirst 
                          ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400 shadow-lg shadow-red-500/50' 
                          : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-red-400'
                      } ${isSelected ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-gray-900' : ''}`}
                      whileHover={{ 
                        scale: 1.1,
                        boxShadow: isFirst 
                          ? '0 0 30px rgba(239, 68, 68, 0.8)' 
                          : '0 0 20px rgba(239, 68, 68, 0.4)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={(e) => {
                        setHoveredLevel(levelData.level);
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (rect) {
                          setTooltipPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredLevel(null)}
                      onClick={() => setSelectedLevel(levelData.level)}
                    >
                      {/* Level number */}
                      <span className={`font-bold font-mono text-sm ${
                        isFirst ? 'text-white' : 'text-gray-300'
                      }`}>
                        {levelData.level}
                      </span>

                      {/* Status indicator */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-900 animate-pulse" />

                      {/* Hover glow effect */}
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-red-500/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Category stats */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-2">
              {getCategoryIcon(category)}
              <span>{category} Challenges</span>
            </div>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span> Available: {filteredLevels.length} Challenges</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Tooltip */}
      <AnimatePresence>
        {hoveredLevel && (() => {
          const levelData = ctfInfo.levels.find((level: LevelData) => level.level === hoveredLevel);
          if (!levelData) return null;

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed z-50 pointer-events-none"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/50 rounded-xl p-4 min-w-[280px] max-w-[320px] shadow-2xl backdrop-blur-sm">
                {/* Arrow */}
                <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500/50" />

                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryIcon(levelData.category)}
                  <div>
                    <div className="text-red-400 font-bold font-mono text-sm">
                      Level {levelData.level}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      {levelData.category}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-white font-semibold mb-2 leading-tight">
                  {levelData.name}
                </h4>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed">
                  {levelData.description}
                </p>

                {/* Difficulty indicator */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3 h-3 ${
                          star <= (levelData.level <= 10 ? 1 : levelData.level <= 20 ? 2 : 3) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-600'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {levelData.level <= 10 ? 'Easy' : levelData.level <= 20 ? 'Medium' : levelData.level <= 30 ? 'Hard' : 'Expert'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CTFMindWelcome() {
  const [phase, setPhase] = useState(0);
  const [activeCategory, setActiveCategory] = useState("Linux");
  const [showStats, setShowStats] = useState(false);

  const categories = [
    { 
      name: "Linux", 
      count: 10, 
      color: "#ef4444",
      icon: <Terminal className="w-5 h-5" />,
      description: "Master Linux system administration and security",
      difficulty: "Beginner to Intermediate"
    },
    { 
      name: "Windows", 
      count: 10, 
      color: "#3b82f6",
      icon: <Shield className="w-5 h-5" />,
      description: "Explore Windows security and Active Directory",
      difficulty: "Intermediate"
    },
    { 
      name: "Network", 
      count: 10, 
      color: "#10b981",
      icon: <Zap className="w-5 h-5" />,
      description: "Network protocols, traffic analysis, and security",
      difficulty: "Intermediate to Advanced"
    },
    { 
      name: "Web Security", 
      count: 5, 
      color: "#f59e0b",
      icon: <Target className="w-5 h-5" />,
      description: "Web vulnerabilities and application security",
      difficulty: "Advanced"
    }
  ];

  const getCategoryStats = (category: string) => {
    const levels = ctfInfo.levels.filter(level => level.category === category);
    return {
      total: levels.length,
      completed: Math.floor(Math.random() * levels.length), // Mock data
      difficulty: categories.find(c => c.name === category)?.difficulty || "Unknown",
      estimatedTime: category === "Linux" ? "2-3 weeks" : category === "Windows" ? "3-4 weeks" : category === "Network" ? "4-5 weeks" : "2-3 weeks"
    };
  };

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => setPhase(5), 3800),
      setTimeout(() => setPhase(6), 4800),
      setTimeout(() => setShowStats(true), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      <style>{keyframes}</style>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-x-hidden relative">
        {/* Enhanced Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.02]" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(239, 68, 68, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 1) 1px, transparent 1px)', 
              backgroundSize: '60px 60px',
            }} 
          />

          {/* Animated particles */}
          {Array.from({ length: 30 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: Math.random() > 0.7 ? '#ef4444' : Math.random() > 0.5 ? '#3b82f6' : '#10b981',
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Scanlines */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                'linear-gradient(0deg, transparent 0%, rgba(239, 68, 68, 0.03) 50%, transparent 100%)',
                'linear-gradient(0deg, transparent 0%, rgba(59, 130, 246, 0.03) 50%, transparent 100%)',
                'linear-gradient(0deg, transparent 0%, rgba(16, 185, 129, 0.03) 50%, transparent 100%)',
              ]
            }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          {/* Corner brackets */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-red-500/30" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-blue-500/30" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-green-500/30" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-yellow-500/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          {/* Header Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Status bar */}
            <motion.div 
              className="inline-flex items-center gap-4 mb-6 px-6 py-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-red-500/20 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-400 font-mono">SYSTEM ONLINE</span>
              </div>
              <div className="w-px h-4 bg-gray-600" />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-mono">1,247 ACTIVE USERS</span>
              </div>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                CTF MIND
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Welcome to the ultimate cybersecurity training platform. Choose your path and begin your journey.
            </motion.p>
          </motion.div>

          {/* Two Column Layout: Categories Left, Image Right */}
          <AnimatePresence mode="wait">
            {phase >= 6 && (
              <motion.div 
                className="mb-12 grid lg:grid-cols-2 gap-12 items-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Left Column: Category Selection */}
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <BarChart3 className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-red-300 font-mono uppercase tracking-wider">SELECT CHALLENGE CATEGORY</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat, index) => {
                    const isActive = activeCategory === cat.name;
                    const stats = getCategoryStats(cat.name);
                    
                    return (
                      <motion.button
                        key={cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm ${
                          isActive 
                            ? 'border-red-400 bg-gradient-to-br from-red-900/30 to-red-800/20 shadow-lg shadow-red-500/20' 
                            : 'border-gray-700 bg-gradient-to-br from-gray-900/50 to-gray-800/30 hover:border-gray-500'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div 
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <ChevronRight className="w-3 h-3 text-white" />
                          </motion.div>
                        )}

                        <div className="text-center">
                          {/* Icon */}
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
                            isActive ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/50 text-gray-400'
                          }`}>
                            {cat.icon}
                          </div>

                          {/* Title */}
                          <h3 className={`font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                            {cat.name}
                          </h3>

                          {/* Count */}
                          <div className={`text-sm mb-2 ${isActive ? 'text-red-300' : 'text-gray-500'}`}>
                            {cat.count} Challenges
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-gray-700/50 rounded-full h-1 mb-2">
                            <motion.div 
                              className={`h-1 rounded-full bg-gradient-to-r ${
                                cat.name === 'Linux' ? 'from-red-500 to-red-400' :
                                cat.name === 'Windows' ? 'from-blue-500 to-blue-400' :
                                cat.name === 'Network' ? 'from-green-500 to-green-400' :
                                'from-yellow-500 to-yellow-400'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
                              transition={{ delay: 1 + index * 0.1, duration: 1 }}
                            />
                          </div>

                          {/* Stats */}
                          <div className="text-xs text-gray-500">
                            {stats.completed}/{stats.total} Completed
                          </div>
                        </div>

                        {/* Hover effect */}
                        <motion.div
                          className={`absolute inset-0 rounded-2xl ${
                            cat.name === 'Linux' ? 'bg-red-500/5' :
                            cat.name === 'Windows' ? 'bg-blue-500/5' :
                            cat.name === 'Network' ? 'bg-green-500/5' :
                            'bg-yellow-500/5'
                          }`}
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        />
                      </motion.button>
                    );
                  })}
                  </div>

                  {/* Category Description */}
                  <motion.div 
                    className="mt-8"
                    key={activeCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                      {categories.find(c => c.name === activeCategory)?.icon}
                      <span className="text-gray-300 text-sm">
                        {categories.find(c => c.name === activeCategory)?.description}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column: CTF Image */}
                <motion.div 
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="relative w-full max-w-sm">
                    {/* Glowing background */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20 rounded-2xl blur-3xl" />
                    
                    {/* Image container */}
                    <motion.img
                      src="/assets/ctf-image.png"
                      alt="CTF Training"
                      className="relative w-full h-auto"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      onError={(e) => {
                        // Fallback to a colored placeholder if image doesn't exist
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />

                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level Grid */}
          {phase >= 6 && (
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <LevelGrid show={phase >= 6} category={activeCategory} />
            </motion.div>
          )}

          {/* Stats Dashboard */}
          <AnimatePresence>
            {showStats && (
              <motion.div 
                className="grid md:grid-cols-3 gap-6 mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {[
                  { icon: <Trophy className="w-6 h-6" />, label: "Global Rank", value: "#247", color: "text-yellow-400" },
                  { icon: <Target className="w-6 h-6" />, label: "Challenges Solved", value: "23/35", color: "text-green-400" },
                  { icon: <Clock className="w-6 h-6" />, label: "Time Invested", value: "47h 32m", color: "text-blue-400" }
                ].map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800/50 mb-3 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Start Button */}
          {phase >= 6 && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <motion.button
                onClick={() => {
                  const firstLevel = ctfInfo.levels.find(level => level.category === activeCategory)?.level;
                  if (firstLevel) {
                    window.location.href = `/game/level/${firstLevel}`;
                  }
                }}
                className="group relative px-12 py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:via-red-400 hover:to-red-500 text-white font-bold rounded-xl transition-all duration-300 transform shadow-2xl shadow-red-500/30 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <span className="relative z-10 flex items-center gap-3 font-mono">
                  <Play className="w-5 h-5" />
                  START {activeCategory.toUpperCase()} CHALLENGES
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.p 
                className="text-gray-500 text-sm mt-4 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Complete challenges sequentially • Difficulty increases progressively
              </motion.p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}