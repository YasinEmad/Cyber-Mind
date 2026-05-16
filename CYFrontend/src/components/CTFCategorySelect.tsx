import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ShieldAlert, ShieldCheck, Shield } from "lucide-react";

export interface CTFCategory {
  name: string;
  count: number;
  color: string; // Expected as a valid CSS color (e.g., hex "#ef4444" or rgb)
  icon: ReactNode;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
}

interface CTFCategorySelectProps {
  categories: CTFCategory[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  getCategoryStats: (category: string) => { total: number; completed: number };
}

export default function CTFCategorySelect({
  categories,
  activeCategory,
  onSelectCategory,
  getCategoryStats
}: CTFCategorySelectProps) {
  
  // Helper to render a difficulty badge
  const renderDifficulty = (difficulty: string) => {
    const config: Record<string, { color: string; icon: ReactNode }> = {
      Easy: { color: "text-green-400 bg-green-400/10 border-green-400/20", icon: <ShieldCheck className="w-3 h-3" /> },
      Medium: { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: <Shield className="w-3 h-3" /> },
      Hard: { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: <ShieldAlert className="w-3 h-3" /> },
    };

    const style = config[difficulty] || { color: "text-neutral-400 bg-neutral-400/10 border-neutral-400/20", icon: <Shield className="w-3 h-3" /> };

    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${style.color}`}>
        {style.icon}
        {difficulty}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header Section - Red Accent */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-1.5 rounded-lg bg-black/20 border border-neutral-800">
          <ChevronRight className="w-5 h-5 text-red-400" />
        </div>
        <h2 className="text-sm text-red-400 font-mono uppercase tracking-widest font-semibold">
          Select Challenge Category
        </h2>
      </div>

      {/* Grid Layout - Improved for responsiveness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat, index) => {
          const isActive = activeCategory === cat.name;
          const stats = getCategoryStats(cat.name);
          const progressPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

          return (
            <motion.button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              // Use dynamic inline styles for the border and glow based on the category's unique color prop (which can be red)
              style={{
                borderColor: isActive ? cat.color : undefined,
                boxShadow: isActive ? `0 10px 40px -10px ${cat.color}40` : undefined,
              }}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col justify-between min-h-[160px]
                ${isActive 
                  ? 'bg-neutral-950 z-10' 
                  : 'border-neutral-900 bg-black/60 hover:border-red-900 hover:bg-neutral-950/80'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Top Row: Icon, Title, Difficulty */}
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex items-center gap-4">
                  <div 
                    className="flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-300 border border-neutral-800"
                    style={{ 
                      backgroundColor: isActive ? `${cat.color}20` : 'rgba(18, 18, 18, 0.7)',
                      color: isActive ? cat.color : '#f87171' // Muted red for non-active icons
                    }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg tracking-wide transition-colors ${isActive ? 'text-white' : 'text-neutral-200'}`}>
                      {cat.name}
                    </h3>
                    <div className="text-xs font-mono text-neutral-500 mt-0.5">
                      {cat.count} AVAILABLE
                    </div>
                  </div>
                </div>
                {renderDifficulty(cat.difficulty)}
              </div>

              {/* Middle Row: Description */}
              <p className="text-sm text-neutral-400 mb-6 line-clamp-2 relative z-10 h-10">
                {cat.description}
              </p>

              {/* Bottom Row: Progress Stats & Bar */}
              <div className="w-full relative z-10 mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-medium text-neutral-400">Progress</span>
                  <span className="text-xs font-mono text-neutral-300">
                    <span style={{ color: isActive ? cat.color : undefined }}>{stats.completed}</span> / {stats.total}
                  </span>
                </div>
                
                <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden border border-neutral-700">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Subtle background glow matching the category color (which can be red) */}
              {isActive && (
                <motion.div
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none"
                  style={{ backgroundColor: cat.color, opacity: 0.15 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}