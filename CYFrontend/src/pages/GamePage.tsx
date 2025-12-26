import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '@/components/PageWrapper';
import { motion, TargetAndTransition } from 'framer-motion';
import { Lock, Play } from 'lucide-react';

const levels = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  isLocked: i > 0, // Only level 1 is unlocked
}));

interface LevelNodeProps {
  level: { id: number; isLocked: boolean };
  index: number;
}

const LevelNode = React.memo<LevelNodeProps>(({ level, index }) => {
  const isUnlocked = !level.isLocked;

  const content = (
    <div
      className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300
        ${
          isUnlocked
            ? 'bg-slate-800/50 border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]'
            : 'bg-slate-800/20 border-slate-700'
        }
      `}
    >
      <div className={`text-3xl font-extrabold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
        {level.id}
      </div>
      <div className={`text-sm font-semibold ${isUnlocked ? 'text-cyan-400' : 'text-slate-600'}`}>
        Level
      </div>
      <div className="absolute top-2 right-2">
        {level.isLocked ? (
          <Lock className="h-4 w-4 text-slate-600" />
        ) : (
          <Play className="h-4 w-4 text-cyan-400" />
        )}
      </div>
      {isUnlocked && (
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 opacity-50"></div>
      )}
    </div>
  );

  const motionProps = {
    initial: { opacity: 0, scale: 0.5 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0
    },
    transition: {
      duration: 0.3,
      delay: index * 0.05
    }
  };
  
  const hoverEffect: TargetAndTransition = {
    scale: 1.05,
    y: "-5%",
    transition: { duration: 0.2 }
  };

  if (level.isLocked) {
    return <motion.div {...motionProps} className="cursor-not-allowed">{content}</motion.div>;
  }

  return (
    <motion.div {...motionProps} whileHover={hoverEffect}>
      <Link to={`/game/level/${level.id}`}>{content}</Link>
    </motion.div>
  );
});


const GamePage: React.FC = () => {
  const memoizedLevels = React.useMemo(() => 
    levels.map((level, index) => (
      <LevelNode key={level.id} level={level} index={index} />
    )),
    [] // levels array is static, so we only need to compute this once
  );

  return (
    <PageWrapper>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-900/50">
        {/* Matrix-like vertical lines */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(34, 211, 238, 0.03) 25%, rgba(34, 211, 238, 0.03) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, 0.03) 75%, rgba(34, 211, 238, 0.03) 76%, transparent 77%, transparent)', backgroundSize: '60px 60px' }}></div>

        {/* Floating cyber elements */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.8 + 0.5,
              opacity: 0
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
              rotate: [0, Math.random() * 360],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "linear",
              opacity: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            {i % 3 === 0 ? (
              <div className="w-12 h-12 border-2 border-cyan-400/30 rotate-45 shadow-[0_0_15px_rgba(34,211,238,0.3)] backdrop-blur-sm" />
            ) : i % 3 === 1 ? (
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.4)] backdrop-blur-sm" />
            ) : (
              <div className="w-10 h-10 border-2 border-cyan-400/40 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.3)] backdrop-blur-sm" />
            )}
          </motion.div>
        ))}
      </div>

      <div className="text-center mb-16 relative">
        <motion.h1 
          className="text-4xl font-bold text-white"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Play and learn
        </motion.h1>
        <motion.p 
          className="text-slate-300 mt-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Follow the path and unlock your potential.
        </motion.p>
      </div>
      <div className="relative max-w-5xl mx-auto py-10">
        {/* Decorative background lines */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
             <svg width="100%" height="100%" className="absolute opacity-20" style={{overflow: 'visible'}}>
                <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#22d3ee', stopOpacity: 0}} />
                        <stop offset="50%" style={{stopColor: '#22d3ee', stopOpacity: 0.5}} />
                        <stop offset="100%" style={{stopColor: '#22d3ee', stopOpacity: 0}} />
                    </linearGradient>
                </defs>
                {/* Simple connecting lines for desktop */}
                 <path d="M10% 20% H 90%" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="5 5" className="hidden lg:block"/>
                 <path d="M90% 80% H 10%" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="5 5" className="hidden lg:block"/>
            </svg>
        </div>

        <div className="relative flex flex-wrap justify-center items-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
          {memoizedLevels}
        </div>
      </div>
    </PageWrapper>
  );
};

export default GamePage;