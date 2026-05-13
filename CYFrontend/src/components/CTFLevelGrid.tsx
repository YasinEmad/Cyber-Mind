import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Zap, Target, Lock, Star } from "lucide-react";
import ctfInfo from "@/utils/ctfinfo";

interface LevelData {
  level: number;
  name: string;
  description: string;
  category: string;
}

interface CTFLevelGridProps {
  category: string;
}

const getCategoryIcon = (cat: string) => {
  switch (cat) {
    case 'Linux': return <Terminal className="w-4 h-4" />;
    case 'Offensive Security': return <Shield className="w-4 h-4" />;
    case 'Network': return <Zap className="w-4 h-4" />;
    case 'Web Security': return <Target className="w-4 h-4" />;
    default: return <Lock className="w-4 h-4" />;
  }
};

export default function CTFLevelGrid({ category }: CTFLevelGridProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const filteredLevels = ctfInfo.levels.filter((level: LevelData) => level.category === category);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative p-6 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-red-500/20 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 p-[2px]">
          <div className="w-full h-full bg-gray-900/90 rounded-2xl" />
        </div>
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
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Link to={levelLink} className="block">
                    <motion.div
                      className={`relative aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${isFirst ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400 shadow-lg shadow-red-500/50' : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-red-400'} ${isSelected ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-gray-900' : ''}`}
                      whileHover={{ scale: 1.1, boxShadow: isFirst ? '0 0 30px rgba(239, 68, 68, 0.8)' : '0 0 20px rgba(239, 68, 68, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={(e) => {
                        setHoveredLevel(levelData.level);
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (rect) {
                          setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                        }
                      }}
                      onMouseLeave={() => setHoveredLevel(null)}
                      onClick={() => setSelectedLevel(levelData.level)}
                    >
                      <span className={`font-bold font-mono text-sm ${isFirst ? 'text-white' : 'text-gray-300'}`}>
                        {levelData.level}
                      </span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-900 animate-pulse" />
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
              style={{ left: tooltipPosition.x, top: tooltipPosition.y, transform: 'translate(-50%, -100%)' }}
            >
              <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/50 rounded-xl p-4 min-w-[280px] max-w-[320px] shadow-2xl backdrop-blur-sm">
                <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500/50" />
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryIcon(levelData.category)}
                  <div>
                    <div className="text-red-400 font-bold font-mono text-sm">Level {levelData.level}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">{levelData.category}</div>
                  </div>
                </div>
                <h4 className="text-white font-semibold mb-2 leading-tight">{levelData.name}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{levelData.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= (levelData.level <= 10 ? 1 : levelData.level <= 20 ? 2 : 3) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
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
