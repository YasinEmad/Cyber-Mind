import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "@/api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Shield,
  Zap,
  ChevronRight,
  Play,
} from "lucide-react";
import CTFHeader from "@/components/CTFHeader";
import CTFCategorySelect from "@/components/CTFCategorySelect";
import CTFLevelGrid from "@/components/CTFLevelGrid";
import FeatureItem from "@/components/FeatureItem";

interface LevelData {
  id: number;
  order: number;
  name: string;
  description: string;
  category: string;
  hints?: string[];
  target?: string;
  difficulty?: string;
}

const keyframes = `
@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

@keyframes drift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-14px); }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.14; }
  50% { opacity: 0.28; }
}
`;

export default function CTFMindWelcome() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${Math.random() * 3 + 1}px`,
        color: Math.random() > 0.85 ? 'rgba(248, 113, 113, 0.45)' : 'rgba(148, 163, 184, 0.18)',
        delay: Math.random() * 2,
        duration: 5 + Math.random() * 6,
      })),
    []
  );
  const [phase, setPhase] = useState(6);
  const [activeCategory, setActiveCategory] = useState("Linux");
  const [backendLevels, setBackendLevels] = useState<LevelData[] | null>(null);
  const completedLevels = useSelector((state: RootState) => state.ctf.completedLevels);
  const allLevels = backendLevels ?? [];

  useEffect(() => {
    const fetchBackendLevels = async () => {
      try {
        const response = await axios.get('/ctf/info');
        if (response.data?.data?.levels) {
          setBackendLevels(response.data.data.levels);
        } else if (response.data?.levels) {
          setBackendLevels(response.data.levels);
        } else {
          setBackendLevels([]);
        }
      } catch (error) {
        console.error('Failed to load backend CTF levels:', error);
        setBackendLevels(null);
      }
    };

    fetchBackendLevels();
  }, []);

  const categoryCounts = allLevels.reduce<Record<string, number>>((acc, level) => {
    acc[level.category] = (acc[level.category] || 0) + 1;
    return acc;
  }, {});

  const categories = [
    {
      name: "Linux",
      count: categoryCounts["Linux"] || 0,
      color: "#ef4444", // Red
      icon: <Terminal className="w-5 h-5" />,
      description: "Master Linux system administration and security",
      difficulty: "Beginner to Intermediate"
    },
    {
      name: "Offensive Security",
      count: categoryCounts["Offensive Security"] || 0,
      color: "#dc2626", // Darker Red
      icon: <Shield className="w-5 h-5" />,
      description: "Practice offensive security techniques and exploit development",
      difficulty: "Intermediate"
    },
    {
      name: "Network",
      count: categoryCounts["Network"] || 0,
      color: "#b91c1c", // Deep Red
      icon: <Zap className="w-5 h-5" />,
      description: "Network protocols, traffic analysis, and security",
      difficulty: "Intermediate to Advanced"
    }
  ];

  const getCategoryStats = (category: string) => {
    const levels = allLevels.filter(level => level.category === category);
    const completed = levels.filter(level => completedLevels.includes(level.id)).length;
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
      <div className="min-h-screen bg-[#050505] text-neutral-200 overflow-x-hidden relative font-sans">
        
        {/* Modern Dark Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.18),transparent_23%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.12),transparent_35%),linear-gradient(180deg,rgba(10,10,10,0.94),rgba(2,2,2,0.98))]" />
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)] bg-[length:60px_60px]" />
          <div className="absolute inset-0 bg-black/35 shadow-[inset_0_0_180px_rgba(0,0,0,0.9)]" />

          {particles.map((particle, index) => (
            <motion.div
              key={index}
              className="absolute rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                background: particle.color,
                filter: 'blur(1px)',
              }}
              animate={{
                y: [0, -24, 0],
                opacity: [0.08, 0.45, 0.08],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: particle.delay,
              }}
            />
          ))}

          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: 'linear-gradient(180deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)',
              animation: 'scanline 10s linear infinite',
            }}
          />

          <div className="absolute top-10 left-10 w-14 h-14 border-l border-t border-neutral-800/60" />
          <div className="absolute top-10 right-10 w-14 h-14 border-r border-t border-neutral-800/60" />
          <div className="absolute bottom-10 left-10 w-14 h-14 border-l border-b border-neutral-800/60" />
          <div className="absolute bottom-10 right-10 w-14 h-14 border-r border-b border-neutral-800/60" />
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
                      animationPath="/animations/server.json"
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