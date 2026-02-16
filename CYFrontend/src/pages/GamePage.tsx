import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '@/components/PageWrapper';
import { motion, TargetAndTransition } from 'framer-motion';
import { Lock, Play, Star, ChevronRight } from 'lucide-react';

interface Zone {
  id: number;
  name: string;
  description: string;
  color: string;
  textColor: string;
  glowColor: string;
  levels: Array<{ id: number; isLocked: boolean; completed?: boolean; stars?: number }>;
}

const zones: Zone[] = [
  {
    id: 1,
    name: 'Foundation',
    description: 'Master the basics',
    color: 'from-red-800 to-black',
    textColor: 'text-red-300',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    levels: Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      isLocked: i > 0,
      completed: i === 0,
      stars: i === 0 ? 3 : 0,
    })),
  },
  {
    id: 2,
    name: 'Intermediate',
    description: 'Increase difficulty',
    color: 'from-red-900 to-red-800',
    textColor: 'text-red-400',
    glowColor: 'rgba(220, 38, 38, 0.3)',
    levels: Array.from({ length: 3 }, (_, i) => ({
      id: i + 4,
      isLocked: i === 0,
      completed: false,
      stars: 0,
    })),
  },
  {
    id: 3,
    name: 'Advanced',
    description: 'Push your limits',
    color: 'from-black to-red-900',
    textColor: 'text-red-200',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    levels: Array.from({ length: 2 }, (_, i) => ({
      id: i + 7,
      isLocked: true,
      completed: false,
      stars: 0,
    })),
  },
  {
    id: 4,
    name: 'Expert',
    description: 'Conquer the challenge',
    color: 'from-red-950 to-black',
    textColor: 'text-red-100',
    glowColor: 'rgba(255, 0, 0, 0.4)',
    levels: Array.from({ length: 2 }, (_, i) => ({
      id: i + 9,
      isLocked: true,
      completed: false,
      stars: 0,
    })),
  },
];

interface LevelNodeProps {
  level: { id: number; isLocked: boolean; completed?: boolean; stars?: number };
  index: number;
  zone: Zone;
}

const LevelNode = React.memo<LevelNodeProps>(({ level, index, zone }) => {
  const isUnlocked = !level.isLocked;
  const isCompleted = level.completed;

  const content = (
    <div
      className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 group
        ${
          isUnlocked
            ? isCompleted
              ? `bg-gradient-to-br ${zone.color} border-yellow-400/60 shadow-[0_0_20px_${zone.glowColor}]`
              : `bg-black/40 border-red-600/60 shadow-[0_0_20px_${zone.glowColor}]`
            : 'bg-black/30 border-red-900/40'
        }
      `}
    >
      <div className={`text-2xl md:text-3xl font-extrabold ${isUnlocked ? (isCompleted ? 'text-yellow-300' : 'text-red-100') : 'text-slate-500'}`}>
        {level.id}
      </div>
      <div className={`text-xs font-semibold ${isUnlocked ? 'text-cyan-300' : 'text-slate-600'}`}>
        Level
      </div>
      
      {/* Lock/Play Icon */}
      <div className="absolute top-2 right-2">
        {level.isLocked ? (
          <Lock className="h-4 w-4 text-slate-500" />
        ) : (
          <div className={`${isCompleted ? 'text-yellow-400' : 'text-red-400'}`}>
            <Play className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Stars for completed levels */}
      {isCompleted && level.stars && (
        <div className="absolute bottom-1 flex gap-1">
          {[...Array(Math.min(level.stars, 3))].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      )}

      {/* Glow ring on hover for unlocked */}
      {isUnlocked && (
        <div className="absolute inset-0 rounded-full border-2 border-red-300/0 group-hover:border-red-300/60 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      )}
    </div>
  );

  const motionProps = {
    initial: { opacity: 0, scale: 0.3, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0
    },
    transition: {
      duration: 0.4,
      delay: index * 0.06,
      type: 'spring',
      stiffness: 100,
    }
  };
  
  const hoverEffect: TargetAndTransition = isUnlocked
    ? {
        scale: 1.08,
        y: -8,
        transition: { duration: 0.2 }
      }
    : {};

  if (level.isLocked) {
    return <motion.div {...motionProps} className="cursor-not-allowed">{content}</motion.div>;
  }

  return (
    <motion.div {...motionProps} whileHover={hoverEffect}>
      <Link to={`/game/level/${level.id}`} className="block">{content}</Link>
    </motion.div>
  );
});



const GamePage: React.FC = () => {
  // Generate random positions for background elements
  const bgElements = React.useMemo(() => 
    Array.from({ length: 15 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 300 + 100,
      duration: Math.random() * 40 + 40,
      delay: Math.random() * 5,
    })),
    []
  );

  const floatingNodes = React.useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 30 + 20,
      delay: Math.random() * 10,
      color: ['cyan', 'blue', 'purple', 'pink'][Math.floor(Math.random() * 4)],  // will be remapped to red variants
    })),
    []
  );

  return (
    <PageWrapper>
      {/* Enhanced Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Base gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black"></div>

        {/* Radial gradient overlays for depth */}
        <div className="absolute inset-0 bg-radial-gradient" style={{
          background: `radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)`
        }}></div>
        <div className="absolute inset-0" style={{
          background: `radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)`
        }}></div>

        {/* Animated gradient shift */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 0deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.08), rgba(185, 28, 28, 0.08), rgba(239, 68, 68, 0.08))`
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
        ></motion.div>

        {/* Advanced grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{ 
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent 0px, transparent 80px, rgba(239, 68, 68, 0.1) 80px, rgba(239, 68, 68, 0.1) 81px),
              repeating-linear-gradient(90deg, transparent 0px, transparent 80px, rgba(239, 68, 68, 0.1) 80px, rgba(239, 68, 68, 0.1) 81px)
            `,
            backgroundSize: '80px 80px'
          }}
        ></div>

        {/* Scan lines effect */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ 
            backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
            backgroundSize: '100% 4px',
            animation: 'scanlines 8s linear infinite'
          }}
        >
          <style>{`
            @keyframes scanlines {
              0% { transform: translateY(0); }
              100% { transform: translateY(10px); }
            }
          `}</style>
        </div>

        {/* Large floating glowing orbs - background layer */}
        {bgElements.map((elem, i) => (
          <motion.div
            key={`bg-${i}`}
            className="absolute rounded-full blur-3xl pointer-events-none"
            style={{
              left: `${elem.x}%`,
              top: `${elem.y}%`,
              width: elem.size,
              height: elem.size,
              background: i % 3 === 0 
                ? 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0) 70%)'
                : i % 3 === 1
                ? 'radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0) 70%)'
                : 'radial-gradient(circle, rgba(185, 28, 28, 0.1) 0%, rgba(185, 28, 28, 0) 70%)'
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: elem.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: elem.delay,
            }}
          ></motion.div>
        ))}

        {/* Floating illuminated nodes */}
        {floatingNodes.map((node) => (
          <motion.div
            key={`node-${node.id}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: node.size,
              height: node.size,
              background: 
                node.color === 'cyan' ? 'rgba(239, 68, 68, 0.8)' :
                node.color === 'blue' ? 'rgba(220, 38, 38, 0.7)' :
                node.color === 'purple' ? 'rgba(185, 28, 28, 0.6)' :
                'rgba(239, 68, 68, 0.6)',
              boxShadow:
                node.color === 'cyan' ? '0 0 20px rgba(239, 68, 68, 0.8)' :
                node.color === 'blue' ? '0 0 15px rgba(220, 38, 38, 0.7)' :
                node.color === 'purple' ? '0 0 15px rgba(185, 28, 28, 0.6)' :
                '0 0 12px rgba(239, 68, 68, 0.6)',
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: node.delay,
            }}
          ></motion.div>
        ))}

        {/* Connection lines between nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <linearGradient id="connGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.6)" />
              <stop offset="100%" stopColor="rgba(220, 38, 38, 0.6)" />
            </linearGradient>
          </defs>
          {floatingNodes.slice(0, 10).map((node1, i) => {
            const node2 = floatingNodes[(i + 1) % 10];
            return (
              <line
                key={`line-${i}`}
                x1={`${node1.x}%`}
                y1={`${node1.y}%`}
                x2={`${node2.x}%`}
                y2={`${node2.y}%`}
                stroke="url(#connGrad1)"
                strokeWidth="1.5"
                opacity="0.5"
              />
            );
          })}
        </svg>

        {/* Ambient light pulses */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.05) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.05) 0%, transparent 60%)',
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        ></motion.div>

        {/* Vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/50 pointer-events-none"></div>
      </div>

      {/* Header */}
      <div className="relative text-center mb-12 md:mb-16 z-20">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent mb-4">
            World Map
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Navigate through zones and master cybersecurity challenges. Unlock new areas as you progress.
          </p>
        </motion.div>
      </div>

      {/* Zones Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="space-y-16 md:space-y-20">
          {zones.map((zone, zoneIndex) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: zoneIndex * 0.15 }}
              className="relative"
            >
              {/* Zone Card Background */}
              <div className="absolute -inset-4 md:-inset-6 rounded-3xl opacity-0 group hover:opacity-100 transition-all duration-300 pointer-events-none"></div>

              {/* Zone Header */}
              <div className="relative mb-8 flex items-center gap-4 group">
                <div className={`flex-1 h-1 bg-gradient-to-r ${zone.color} rounded-full opacity-60`}></div>
                <div className="flex-shrink-0">
                  <motion.div
                    className={`inline-block`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <h2 className={`text-2xl md:text-3xl font-bold ${zone.textColor}`}>
                      {zone.name}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 text-center">
                      {zone.description}
                    </p>
                  </motion.div>
                </div>
                <div className={`flex-1 h-1 bg-gradient-to-l ${zone.color} rounded-full opacity-60`}></div>
              </div>

              {/* Zone Background */}
              <div className={`relative rounded-3xl bg-gradient-to-br ${zone.color} p-8 md:p-12 overflow-hidden border border-slate-700/50 shadow-xl`}>
                {/* Animated zone glow */}
                <div className={`absolute inset-0 opacity-10 blur-3xl pointer-events-none`} style={{ background: zone.glowColor }}></div>

                {/* Connecting path SVG */}
                {zone.levels.length > 1 && (
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none" 
                    style={{ overflow: 'visible' }}
                  >
                    <defs>
                      <linearGradient id={`pathGrad-${zone.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 0 }} />
                        <stop offset="50%" style={{ stopColor: '#22d3ee', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                    <path 
                      d={`M 5% 50% Q 50% 30%, 95% 50%`}
                      stroke={`url(#pathGrad-${zone.id})`}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="8 4"
                      className="opacity-40"
                    />
                  </svg>
                )}

                {/* Levels Grid */}
                <div className="relative z-20 flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-10">
                  {zone.levels.map((level, buildingIndex) => (
                    <LevelNode
                      key={level.id}
                      level={level}
                      index={buildingIndex}
                      zone={zone}
                    />
                  ))}
                </div>

                {/* Zone border accent */}
                <div className="absolute inset-0 rounded-3xl border-2 border-gradient pointer-events-none opacity-30" 
                  style={{
                    borderImage: `linear-gradient(135deg, transparent, ${zone.glowColor}, transparent) 1`
                  }}
                ></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress indicator at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative z-20 mt-16 mb-8 text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black/50 border border-red-600/50 backdrop-blur-sm">
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-red-600' : 'bg-slate-700'
                }`}
                animate={i === 0 ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ))}
          </div>
          <span className="text-red-400 text-sm font-semibold ml-2">Level 1 Complete - 1/10</span>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default GamePage;