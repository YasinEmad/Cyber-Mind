import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { Challenge, ChallengeDifficulty } from '@/types';
import ChallengeCard from '@/components/ChallengeCard';
import { motion, AnimatePresence } from 'framer-motion';

import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchChallenges } from '@/redux/slices/challengeSlice';

const motivationalQuotes = [
  "EXCELLENCE IS NOT AN ACT, BUT A HABIT.",
  "PRECISION OVER SPEED. RESULTS OVER EXCUSES.",
  "BELIEVE YOU CAN AND YOU'RE HALFWAY THERE.",
  "STAY FOCUSED. STAY LETHAL.",
  "THE HARDER THE BATTLE, THE SWEETER THE VICTORY."
];

const MotivationalQuote: React.FC = React.memo(() => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % motivationalQuotes.length);
    }, 8000); // Increased from 6s to 8s to reduce frequency
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="h-12 flex items-center justify-center mb-8 border-y border-gray-800 bg-black/40">
       <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="text-[10px] tracking-[0.2em] font-black text-gray-500 uppercase"
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.2em" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }} // Slightly longer transition
        >
          {motivationalQuotes[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
});

const BackgroundParticle: React.FC<{ delay: number }> = React.memo(({ delay }) => {
  return (
    <motion.div
      className="absolute w-[1px] h-[1px] bg-red-500/30 rounded-full"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -100],
        opacity: [0, 0.3, 0],
      }}
      transition={{
        duration: Math.random() * 8 + 12, // Longer duration
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
    />
  );
});

const AnimatedBackground: React.FC = React.memo(() => {
  // Generate particles once and memoize them
  const particles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({ id: i, delay: Math.random() * 10 })), // Reduced from 20 to 12
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {particles.map((particle) => (
        <BackgroundParticle key={particle.id} delay={particle.delay} />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)]" />
    </div>
  );
});

const ChallengePage: React.FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const storeChallenges = useSelector((state: RootState) => state.challenges.challenges);
  const status = useSelector((state: RootState) => state.challenges.status);

  const mapToCard = useCallback((ch: any): Challenge => {
    const lvl = ch.level || ch.difficulty || 'easy';
    const difficulty = lvl.toLowerCase() === 'medium' ? ChallengeDifficulty.Medium : (lvl.toLowerCase() === 'hard' ? ChallengeDifficulty.Hard : ChallengeDifficulty.Easy);
    return {
      id: ch._id || ch.id,
      title: ch.title,
      description: ch.description,
      difficulty,
    };
  }, []);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchChallenges());
  }, [dispatch, status]); // Added status to dependencies

  // Memoize the cards to prevent unnecessary re-computations
  const cards = useMemo(() => 
    storeChallenges.map(mapToCard), 
    [storeChallenges, mapToCard]
  );

  return (
    <PageWrapper>
      <div className="relative min-h-screen pb-20">
        <AnimatedBackground />
        
        <div className="relative z-10 pt-8">
          <MotivationalQuote />

          <div className="text-center mb-16 px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase"
            >
              Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Challenges</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 mt-4 font-bold tracking-[0.3em] uppercase text-xs"
            >
              System Online // Test your limits
            </motion.p>
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {cards.map((challenge, index) => (
                <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
});

export default ChallengePage;