import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import { PlayCircle, ShieldCheck, Puzzle, BrainCircuit, Swords, Trophy, ChevronDown, ArrowRight } from 'lucide-react';

const sentence: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const word: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
};

const buttonsContainer: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.8,
      duration: 0.5,
    },
  },
};

// New component for floating icons
const FloatingIcon: React.FC<{ icon: React.ElementType, className: string, delay?: number, duration?: number }> = ({ icon: Icon, className, delay = 0, duration = 10 }) => {
  return (
    <motion.div
      className={`absolute z-0 text-slate-700/50 ${className}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, y: ['0%', '-20%', '0%'] }}
      transition={{ 
        delay: 1 + delay, // start after main animation
        duration, 
        repeat: Infinity, 
        ease: 'easeInOut' 
      }}
    >
      <Icon className="w-full h-full" />
    </motion.div>
  );
};

const fadeInUp: Variants = {
    offscreen: { y: 30, opacity: 0 },
    onscreen: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string, link: string }> = ({ icon, title, description, link }) => {
    return (
        <motion.div
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center flex flex-col items-center group transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/10"
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
        >
            <div className="inline-block bg-slate-700 text-cyan-400 p-5 rounded-full mb-6 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 32 })}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 mb-6 flex-grow">{description}</p>
            <Link to={link} className="font-semibold text-cyan-400 inline-flex items-center group-hover:text-cyan-300 transition-colors">
                Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
        </motion.div>
    );
};


const HomePage: React.FC = () => {
  const welcomeText = "Welcome to Cyber Mind";

  return (
    <PageWrapper>
      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
        {/* Background decorative shapes */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>

        {/* Floating Icons */}
        <FloatingIcon icon={BrainCircuit} className="w-24 h-24 top-1/4 left-1/4" delay={0.2} duration={12} />
        <FloatingIcon icon={Swords} className="w-20 h-20 top-1/2 right-1/4" delay={0.5} duration={10} />
        <FloatingIcon icon={Trophy} className="w-16 h-16 bottom-1/4 left-1/3" delay={0.8} duration={8} />


        <div className="text-center z-10">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-4 shimmer"
            variants={sentence}
            initial="hidden"
            animate="visible"
          >
            {welcomeText.split(" ").map((char, index) => (
              <motion.span key={char + "-" + index} variants={word} className="inline-block mr-4">
                {char}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            Your ultimate destination for competitive gaming, mind-bending puzzles, and daily challenges.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={buttonsContainer}
            initial="hidden"
            animate="visible"
          >
             <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              whileHover={{ y: -8, scale: 1.05 }}
            >
              <Link
                to="/game"
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20"
              >
                <PlayCircle className="mr-2 h-6 w-6" />
                Start Game
              </Link>
            </motion.div>
             <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              whileHover={{ y: -8, scale: 1.05 }}
            >
              <Link
                to="/puzzles"
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-lg shadow-purple-500/20"
              >
                <Puzzle className="mr-2 h-6 w-6" />
                Solve Puzzles
              </Link>
            </motion.div>
             <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
              whileHover={{ y: -8, scale: 1.05 }}
            >
              <Link
                to="/challenges"
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-slate-700 text-slate-100 font-bold rounded-lg shadow-lg"
              >
                <ShieldCheck className="mr-2 h-6 w-6" />
                Explore Challenges
              </Link>
            </motion.div>
          </motion.div>
        </div>
        <a href="#main-features" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer" title="Scroll down">
          <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
              <ChevronDown className="w-8 h-8 text-slate-500 hover:text-cyan-400 transition-colors" />
          </motion.div>
        </a>
      </div>

      {/* Main Features Section */}
      <section id="main-features" className="py-20 md:py-24">
          <motion.div
              className="text-center"
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ staggerChildren: 0.2 }}
          >
              <motion.h2 
                  className="text-4xl font-bold text-center text-white mb-4"
                  variants={fadeInUp}
              >
                  Dive Into The Arena
              </motion.h2>
              <motion.p
                  className="text-lg text-slate-400 mb-16 max-w-2xl mx-auto"
                  variants={fadeInUp}
              >
                  Explore different ways to challenge your mind and compete with others.
              </motion.p>
              <motion.div
                className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                variants={{ onscreen: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } } }}
              >
                  <FeatureCard
                      icon={<Puzzle />}
                      title="Engaging Puzzles"
                      description="From logic to riddles, our puzzles are designed to make you think."
                      link="/puzzles"
                  />
                  <FeatureCard
                      icon={<Swords />}
                      title="Daily Challenges"
                      description="Put your skills to the test with fresh challenges every day."
                      link="/challenges"
                  />
                  <FeatureCard
                      icon={<Trophy />}
                      title="Climb the Ranks"
                      description="Compete for glory and see your name on the global leaderboards."
                      link="/leaderboard"
                  />
              </motion.div>
          </motion.div>
      </section>
    </PageWrapper>
  );
};

export default HomePage;