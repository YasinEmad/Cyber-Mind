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
  Play,
} from "lucide-react";
import ctfInfo from "@/utils/ctfinfo";
import CTFHeader from "@/components/CTFHeader";
import CTFCategorySelect from "@/components/CTFCategorySelect";
import CTFLevelGrid from "@/components/CTFLevelGrid";
import FeatureItem from "@/components/FeatureItem";
import serverAnimation from '@/assets/server.json';

const keyframes = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
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
      color: "#ef4444", // Red
      icon: <Terminal className="w-5 h-5" />,
      description: "Master Linux system administration and security",
      difficulty: "Beginner to Intermediate"
    },
    {
      name: "Offensive Security",
      count: 10,
      color: "#dc2626", // Darker Red
      icon: <Shield className="w-5 h-5" />,
      description: "Practice offensive security techniques and exploit development",
      difficulty: "Intermediate"
    },
    {
      name: "Network",
      count: 10,
      color: "#b91c1c", // Deep Red
      icon: <Zap className="w-5 h-5" />,
      description: "Network protocols, traffic analysis, and security",
      difficulty: "Intermediate to Advanced"
    },
    {
      name: "Web Security",
      count: 5,
      color: "#991b1b", // Darkest Red
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
      {/* Set base background to pure black / very dark neutral */}
      <div className="min-h-screen bg-[#050505] text-neutral-200 overflow-x-hidden relative font-sans">
        
        {/* Modern Dark Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          
          {/* Subtle dark geometric grid */}
          <div className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Deep ambient crimson glows - highly blurred and subtle */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 15% 20%, rgba(220, 38, 38, 0.03), transparent 40%), 
                radial-gradient(circle at 85% 80%, rgba(153, 27, 27, 0.04), transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.8), transparent 100%)
              `,
            }}
          />

          {/* Vignette effect to darken edges further */}
          <div className="absolute inset-0 bg-black/40 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

          {/* Minimalist modern particles (Ash/Ember style) */}
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: Math.random() > 0.8 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(115, 115, 115, 0.2)', // Mostly dark gray, rare red
                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.1, 0.5, 0.1],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Modern cinematic scanline overlay */}
          <motion.div
            className="absolute inset-0 w-full h-[10px] bg-gradient-to-b from-transparent via-red-900/5 to-transparent pointer-events-none opacity-50"
            style={{ animation: 'scanline 8s linear infinite' }}
          />

          {/* Sleek, subtle corner brackets */}
          <div className="absolute top-10 left-10 w-12 h-12 border-l border-t border-neutral-800" />
          <div className="absolute top-10 right-10 w-12 h-12 border-r border-t border-neutral-800" />
          <div className="absolute bottom-10 left-10 w-12 h-12 border-l border-b border-neutral-800" />
          <div className="absolute bottom-10 right-10 w-12 h-12 border-r border-b border-neutral-800" />
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
                    {/* Dark, subtle glow behind the server animation */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-red-900/10 via-black to-neutral-900/20 rounded-full blur-3xl" />
                    <FeatureItem
                      animationData={serverAnimation}
                      title="CTF"
                      desc="Compete in Capture The Flag events. Apply your skills in realistic challenges."
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
        </div>
      </div>
    </>
  );
}