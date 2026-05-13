import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Shield,
  Zap,
  Target,
  ChevronRight,
  Lock,
  Star,
  Play,
  BarChart3
} from "lucide-react";
import ctfInfo from "@/utils/ctfinfo";
import CTFHeader from "@/components/CTFHeader";
import CTFCategorySelect from "@/components/CTFCategorySelect";
import CTFLevelGrid from "@/components/CTFLevelGrid";
import FeatureItem from "@/components/FeatureItem";
import serverAnimation from '/home/yasin/Cyber-Mind/CYFrontend/public/assets/server.json';

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

export default function CTFMindWelcome() {
  const [phase, setPhase] = useState(6);
  const [activeCategory, setActiveCategory] = useState("Linux");
  const completedLevels = useSelector((state: RootState) => state.ctf.completedLevels);

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
      name: "Offensive Security",
      count: 10,
      color: "#ef4444",
      icon: <Shield className="w-5 h-5" />,
      description: "Practice offensive security techniques and exploit development",
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
    const completed = levels.filter(level => completedLevels.includes(level.level)).length;
    return {
      total: levels.length,
      completed: completed,
      difficulty: categories.find(c => c.name === category)?.difficulty || "Unknown",
      estimatedTime: category === "Linux" ? "2-3 weeks" : category === "Offensive Security" ? "3-4 weeks" : category === "Network" ? "4-5 weeks" : "2-3 weeks"
    };
  };

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

          {/* Ambient glow layers */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 18% 18%, rgba(239, 68, 68, 0.18), transparent 24%), radial-gradient(circle at 78% 18%, rgba(59, 130, 246, 0.14), transparent 20%), radial-gradient(circle at 22% 82%, rgba(16, 185, 129, 0.12), transparent 24%)',
              opacity: 0.9,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/95 via-black/20 to-transparent pointer-events-none" />

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
<CTFHeader
            title="CTF MIND"
            subtitle="Welcome to the ultimate cybersecurity training platform. Choose your path and begin your journey."
          />

          {/* Two Column Layout: Categories Left, Image Right */}
          <AnimatePresence mode="wait">
            {phase >= 6 && (
              <motion.div
                className="mb-12 grid lg:grid-cols-2 gap-12 items-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <CTFCategorySelect
                  categories={categories}
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
                  getCategoryStats={getCategoryStats}
                />

                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="relative w-full max-w-sm">
                    <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20 rounded-2xl blur-3xl" />
                    <FeatureItem
                      animationData={serverAnimation}
                      title="CTF"
                      desc="Compete in Capture The Flag events. Apply your skills in realistic challinging"
                      index={2}
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
              <CTFLevelGrid category={activeCategory} />
            </motion.div>
          )}

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