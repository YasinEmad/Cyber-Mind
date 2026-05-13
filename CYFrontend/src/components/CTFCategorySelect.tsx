import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export interface CTFCategory {
  name: string;
  count: number;
  color: string;
  icon: ReactNode;
  description: string;
  difficulty: string;
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
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <ChevronRight className="w-5 h-5 text-red-400" />
        <span className="text-sm text-red-300 font-mono uppercase tracking-wider">SELECT CHALLENGE CATEGORY</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat, index) => {
          const isActive = activeCategory === cat.name;
          const stats = getCategoryStats(cat.name);

          return (
            <motion.button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm ${isActive
                ? 'border-red-400 bg-gradient-to-br from-red-900/30 to-red-800/20 shadow-lg shadow-red-500/20'
                : 'border-gray-700 bg-gradient-to-br from-gray-900/50 to-gray-800/30 hover:border-gray-500'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
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
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${isActive ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/50 text-gray-400'}`}>
                  {cat.icon}
                </div>

                <h3 className={`font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {cat.name}
                </h3>
                <div className={`text-sm mb-2 ${isActive ? 'text-red-300' : 'text-gray-500'}`}>
                  {cat.count} Challenges
                </div>

                <div className="w-full bg-gray-700/50 rounded-full h-1 mb-2">
                  <motion.div
                    className={`h-1 rounded-full bg-gradient-to-r ${cat.name === 'Linux' ? 'from-red-500 to-red-400' : cat.name === 'Offensive Security' ? 'from-blue-500 to-blue-400' : cat.name === 'Network' ? 'from-green-500 to-green-400' : 'from-yellow-500 to-yellow-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    transition={{ delay: 1 + index * 0.1, duration: 1 }}
                  />
                </div>

                <div className="text-xs text-gray-500">
                  {stats.completed}/{stats.total} Completed
                </div>
              </div>

              <motion.div
                className={`absolute inset-0 rounded-2xl ${cat.name === 'Linux' ? 'bg-red-500/5' : cat.name === 'Offensive Security' ? 'bg-blue-500/5' : cat.name === 'Network' ? 'bg-green-500/5' : 'bg-yellow-500/5'}`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
