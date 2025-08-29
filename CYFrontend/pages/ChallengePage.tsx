
import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import { Challenge, ChallengeDifficulty } from '../types';
import ChallengeCard from '../components/ChallengeCard';
import { motion, AnimatePresence } from 'framer-motion';

const challenges: Challenge[] = [
  { id: 1, title: 'Speed Runner', difficulty: ChallengeDifficulty.Easy },
  { id: 2, title: 'Puzzle Master', difficulty: ChallengeDifficulty.Medium },
  { id: 3, title: 'Logic Legend', difficulty: ChallengeDifficulty.Hard },
  { id: 4, title: 'Quick Reflexes', difficulty: ChallengeDifficulty.Easy },
  { id: 5, title: 'Strategy King', difficulty: ChallengeDifficulty.Hard },
  { id: 6, title: 'Memory Maze', difficulty: ChallengeDifficulty.Medium },
  { id: 7, title: 'Trivia Titan', difficulty: ChallengeDifficulty.Easy },
  { id: 8, title: 'Endurance Trial', difficulty: ChallengeDifficulty.Hard },
];

const motivationalQuotes = [
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't watch the clock; do what it does. Keep going."
];

const MotivationalQuote: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="h-8 text-center mb-4">
       <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="text-slate-400 italic"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
        >
          "{motivationalQuotes[index]}"
        </motion.p>
      </AnimatePresence>
    </div>
  );
};


const BackgroundParticle: React.FC = () => {
  const randomPosition = () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  });

  return (
    <motion.div
      className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-30"
      initial={randomPosition()}
      animate={{
        x: randomPosition().x,
        y: randomPosition().y,
        transition: {
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "linear"
        }
      }}
    />
  );
};

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <BackgroundParticle key={i} />
      ))}
    </div>
  );
};

const ChallengePage: React.FC = () => {
  return (
    <PageWrapper>
      <AnimatedBackground />
      <MotivationalQuote />
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl font-bold text-white">Daily Challenges</h1>
        <p className="text-slate-300 mt-2">Test your skills against the clock.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {challenges.map((challenge, index) => (
          <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
        ))}
      </div>
    </PageWrapper>
  );
};

export default ChallengePage;