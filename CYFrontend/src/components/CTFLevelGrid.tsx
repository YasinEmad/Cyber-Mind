import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Zap, Lock, Star, Crosshair } from "lucide-react";
import ctfInfo from "@/utils/ctfinfo";
import axios from "@/api/axios";

interface LevelData {
  level: number;
  name: string;
  description: string;
  category: string;
  hints?: string[];
  target?: string;
  difficulty?: string;
}

interface CTFLevelGridProps {
  category: string;
}

const getCategoryIcon = (cat: string) => {
  const iconClasses = "w-4 h-4 text-red-500";
  switch (cat) {
    case 'Linux': return <Terminal className={iconClasses} />;
    case 'Offensive Security': return <Shield className={iconClasses} />;
    case 'Network': return <Zap className={iconClasses} />;
    default: return <Lock className={iconClasses} />;
  }
};

export default function CTFLevelGrid({ category }: CTFLevelGridProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [backendLevels, setBackendLevels] = useState<LevelData[] | null>(null);
  const [_loading, _setLoading] = useState(true);
  const [_error, _setError] = useState<string | null>(null);

  // Fetch CTF levels from backend
  useEffect(() => {
    const fetchCTFLevels = async () => {
      try {
        _setLoading(true);
        const response = await axios.get("/ctf/info");
        console.log("Backend CTF response:", response.data);
        
        // Backend returns { success: true, data: { levels: [...] } }
        if (response.data && response.data.data && response.data.data.levels) {
          setBackendLevels(response.data.data.levels);
          _setError(null);
          console.log("Loaded backend levels:", response.data.data.levels);
        } else if (response.data && response.data.levels) {
          // Fallback for different response structure
          setBackendLevels(response.data.levels);
          _setError(null);
        } else {
          setBackendLevels([]);
          _setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch CTF levels from backend:", err);
        _setError("Failed to load CTF levels");
        // Fall back to frontend data if backend fails
        setBackendLevels(ctfInfo.levels);
      } finally {
        _setLoading(false);
      }
    };

    fetchCTFLevels();
  }, []);

  // Use backend levels if available, otherwise fall back to frontend data
  const levelsData = backendLevels !== null ? backendLevels : ctfInfo.levels;
  const filteredLevels = levelsData.filter((level: LevelData) => level.category === category);

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Main Console Frame */}
      <div className="relative p-8 bg-black/60 backdrop-blur-xl border border-neutral-900 rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden group">
        
        {/* Futuristic Corner Brackets inside the panel */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-900/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neutral-800 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neutral-800 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-900/40 pointer-events-none" />

        {/* Tech Blueprint Grid Texture Backdrop */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-repeat"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        />

        <div className="relative z-10">
          
          {/* Top Panel Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-900 font-mono text-[10px] tracking-wider text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
              <span className="text-neutral-400 font-bold uppercase">DIRECTORY_INDEX </span>
            </div>
            <div className="flex items-center gap-4">
              <span>SYS_STATUS: <span className="text-emerald-500">ONLINE</span></span>
            </div>
          </div>

          {/* Level Grid Matrix */}
          <div className="grid grid-cols-5 gap-4 mx-auto relative">
            
            {filteredLevels.map((levelData, index) => {
              const isFirst = index === 0;
              const isHovered = hoveredLevel === levelData.level;
              const isSelected = selectedLevel === levelData.level;
              const levelLink = `/game/level/${levelData.level}`;

              return (
                <motion.div
                  key={levelData.level}
                  className="relative aspect-square"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02, type: "spring", stiffness: 260, damping: 20 }}
                >
                  <Link to={levelLink} className="block h-full w-full">
                    <motion.div
                      className={`relative h-full w-full rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 font-mono overflow-hidden
                        ${isFirst 
                          ? 'bg-neutral-950 border-red-900/60 text-red-400 shadow-[inset_0_0_12px_rgba(239,68,68,0.05)]' 
                          : 'bg-neutral-950/30 border-neutral-900 text-neutral-600 hover:text-neutral-200'
                        } 
                        ${isSelected ? 'border-red-500 text-white bg-black ring-1 ring-red-500/20' : ''}`}
                      whileHover={{ 
                        scale: 1.04, 
                        borderColor: isSelected ? "#ef4444" : "rgba(239, 68, 68, 0.5)",
                        backgroundColor: "#000000"
                      }}
                      whileTap={{ scale: 0.96 }}
                      onMouseEnter={(e) => {
                        setHoveredLevel(levelData.level);
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (rect) {
                          setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 12 });
                        }
                      }}
                      onMouseLeave={() => setHoveredLevel(null)}
                      onClick={() => setSelectedLevel(levelData.level)}
                    >
                      {/* Tech Corner Accent inside node */}
                      {isHovered && (
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-red-500 pointer-events-none" />
                      )}

                      {/* Micro Node ID */}
                      <span className="text-[9px] text-neutral-600 absolute top-1 left-1.5 pointer-events-none">
                        N{String(levelData.level).padStart(2, '0')}
                      </span>

                      {/* Display Level Number */}
                      <span className="text-base font-bold tracking-tight relative z-10 mt-1">
                        {String(levelData.level).padStart(2, '0')}
                      </span>
                      
                      {/* Interactive target laser line on hover */}
                      {isHovered && (
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-500"
                          layoutId="activeUnderline"
                        />
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Grid Footer Terminal Meta info */}
          <div className="mt-8 pt-5 border-t border-neutral-900 flex items-center justify-between px-1 font-mono text-[11px] tracking-wide text-neutral-500">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded bg-red-950/20 border border-red-900/30">
                {getCategoryIcon(category)}
              </div>
              <div>
                <span className="text-neutral-300 font-bold uppercase tracking-wider block leading-none mb-0.5">{category}</span>
                <span className="text-[9px] text-neutral-600">CLUSTER VECTORS READY</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-neutral-600">NODES COMPILATION: </span>
              <span className="text-red-500 font-bold">{filteredLevels.length}</span>
              <span className="text-neutral-700"> / </span>
              <span className="text-neutral-400">30 MAX</span>
            </div>
          </div>

        </div>
      </div>

      {/* Advanced Diagnostics Tooltip */}
      <AnimatePresence>
        {hoveredLevel && (() => {
          const levelData = levelsData.find((level: LevelData) => level.level === hoveredLevel);
          if (!levelData) return null;

          const diffLevel = ((levelData as any)?.difficulty as string)?.toLowerCase() || '';
          const isHard = diffLevel === 'hard' || levelData.level > 20;
          const isMedium = diffLevel === 'medium' || (levelData.level > 10 && levelData.level <= 20);
          const starCount = diffLevel === 'hard' ? 3 : diffLevel === 'medium' ? 2 : 1;

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed z-50 pointer-events-none"
              style={{ left: tooltipPosition.x, top: tooltipPosition.y, transform: 'translate(-50%, -100%)' }}
            >
              <div className="bg-black/95 border border-neutral-800 rounded-lg p-4 min-w-[300px] max-w-[340px] shadow-[0_25px_50px_rgba(0,0,0,0.95)] backdrop-blur-xl relative">
                
                {/* Tech aesthetics on tooltip corners */}
                <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-red-950/40 border-b border-l border-neutral-800 text-[8px] font-mono text-red-400 tracking-tighter">
                  DIAG_SUB_RXT
                </div>

                <div className="flex items-center gap-2 mb-2.5">
                  <Crosshair className="w-3.5 h-3.5 text-red-500 animate-spin-slow" />
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                    TARGET NODE // SYSTEM_0{levelData.level}
                  </span>
                </div>

                <h4 className="text-neutral-100 font-bold text-sm tracking-wide mb-1 leading-tight font-mono">
                  &gt; {levelData.name}
                </h4>
                
                <p className="text-neutral-400 text-xs leading-relaxed mb-4 font-sans">
                  {levelData.description}
                </p>

                {/* Hints Section from Backend */}
                {levelData.hints && levelData.hints.length > 0 && (
                  <div className="mb-4 pt-3 border-t border-neutral-900">
                    <span className="text-neutral-600 text-[9px] uppercase block mb-2 font-mono">Hints</span>
                    <ul className="text-neutral-400 text-xs space-y-1">
                      {levelData.hints.slice(0, 3).map((hint, idx) => (
                        <li key={idx} className="text-neutral-500 list-disc list-inside">
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-900 font-mono text-[10px]">
                  <div className="bg-neutral-950/60 p-2 rounded border border-neutral-900/60">
                    <span className="text-neutral-600 block text-[9px] uppercase">Threat Level</span>
                    <span className={`font-bold tracking-wide
                      ${isHard ? 'text-red-400' : isMedium ? 'text-amber-500' : 'text-emerald-400'}`}>
                      {isHard ? 'HIGH_CRITICAL' : isMedium ? 'MID_MEDIUM' : 'LOW_EASY'}
                    </span>
                  </div>
                  
                  <div className="bg-neutral-950/60 p-2 rounded border border-neutral-900/60 flex flex-col justify-between">
                    <span className="text-neutral-600 text-[9px] uppercase">Node Security</span>
                    <div className="flex gap-0.5 items-center mt-0.5">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className={`w-2.5 h-2.5 ${star <= starCount ? 'text-red-500 fill-red-500/20' : 'text-neutral-800'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated connection checksum string */}
                <div className="mt-3 text-center text-[8px] font-mono text-neutral-700 tracking-widest uppercase">
                  SHA-256 CHECK: 0x{levelData.level}F9A...SECURE
                </div>

              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}