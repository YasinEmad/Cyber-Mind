import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { Challenge, ChallengeDifficulty } from '@/types';
import ChallengeCard from '@/components/ChallengeCard';
import { motion, AnimatePresence } from 'framer-motion';

import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchChallenges } from '@/redux/slices/challengeSlice';


function mapToCard(ch: any): Challenge {
  const lvl = ch.level || ch.difficulty || 'easy';
  const difficulty = lvl.toLowerCase() === 'medium' ? ChallengeDifficulty.Medium : (lvl.toLowerCase() === 'hard' ? ChallengeDifficulty.Hard : ChallengeDifficulty.Easy);
  return {
    id: ch._id || ch.id,
    title: ch.title,
    description: ch.description,
    difficulty,
  };
}

const motivationalQuotes = [
  "EXCELLENCE IS NOT AN ACT, BUT A HABIT.",
  "PRECISION OVER SPEED. RESULTS OVER EXCUSES.",
  "BELIEVE YOU CAN AND YOU'RE HALFWAY THERE.",
  "STAY FOCUSED. STAY LETHAL.",
  "THE HARDER THE BATTLE, THE SWEETER THE VICTORY."
];

const MotivationalQuote: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % motivationalQuotes.length);
    }, 6000);
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
          transition={{ duration: 0.8 }}
        >
          {motivationalQuotes[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

const BackgroundParticle: React.FC = () => {
  const randomPosition = () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  });

  const pos = randomPosition();

  return (
    <motion.div
      className="absolute w-[1px] h-[1px] bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"
      initial={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity: 0 }}
      animate={{
        y: [0, -100],
        opacity: [0, 0.4, 0],
        transition: {
          duration: Math.random() * 5 + 5,
          repeat: Infinity,
          ease: "linear"
        }
      }}
    />
  );
};

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {[...Array(20)].map((_, i) => (
        <BackgroundParticle key={i} />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)]" />
    </div>
  );
};

const ChallengePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const storeChallenges = useSelector((state: RootState) => state.challenges.challenges);
  const status = useSelector((state: RootState) => state.challenges.status);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchChallenges());
  }, [dispatch]);

  const cards = storeChallenges.map(mapToCard);

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
};

export default ChallengePage;