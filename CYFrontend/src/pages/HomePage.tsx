import React from 'react';
import { motion, Variants } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { Link } from 'react-router-dom';
import { ChevronDown, Zap } from 'lucide-react';
import Lottie from 'lottie-react';

// Animation files
import heroAnimationJson from '@/assets/Untitled file.json';
import puzzleAnimation from '@/assets/puzzle.json';
import challingAnimation from '@/assets/security code challinging.json';
import gameAnimation from '@/assets/ctf.json';

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      damping: 25, 
      stiffness: 100,
      duration: 0.8 
    } 
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.8 
    }
  },
};

const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      duration: 0.8
    }
  }
};

const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      duration: 0.8
    }
  }
};

import FeatureItem from '../components/FeatureItem';

// Scroll indicator component
const ScrollIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.5, duration: 1 }}
    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
  >
    <motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <ChevronDown className="w-6 h-6 text-gray-400" />
    </motion.div>
  </motion.div>
);

const HomePage: React.FC = () => {
  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 selection:text-red-200 overflow-x-hidden">
        
        {/* --- Background Elements --- */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
              backgroundSize: '40px 40px',
              maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
            }} 
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" 
          />
        </div>

        {/* --- HERO SECTION --- */}
        <section className="relative min-h-screen flex flex-col justify-center items-center pt-0 pb-10 px-4">
          <motion.div 
            className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={slideInFromLeft}
              className="text-center lg:text-left order-2 lg:order-1 z-10"
            >
              <motion.h1 
                variants={fadeInUp} 
                className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-6"
              >
                WELCOME TO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                  Cyber MIND
                </span>
              </motion.h1>
              <motion.p 
                variants={fadeInUp} 
                className="text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0 font-light mb-8"
              >
                Think like a hacker. Solve like a defender. Train your mind in ethical cybersecurity through real-world CTF challenges.
              </motion.p>
              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/game">
                  <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all shadow-lg flex items-center gap-2 mx-auto lg:mx-0">
                    <Zap className="w-5 h-5 fill-current" /> Start Journey
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={slideInFromRight}
              className="order-1 lg:order-2 flex justify-center"
            >
              <Lottie 
                animationData={heroAnimationJson} 
                loop 
                autoplay 
                className="w-full max-w-[450px]" 
              />
            </motion.div>
          </motion.div>
          
          {/* Scroll Indicator */}
          <ScrollIndicator />
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="relative py-24 px-4 z-20">
          <div className="container mx-auto max-w-7xl">
            {/* Section Title */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Train Your <span className="text-red-500">Security Mindset</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Master cryptography, penetration testing, and vulnerability analysis through hands-on challenges
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={containerVariants}
              className="grid md:grid-cols-3 gap-16 md:gap-8"
            >
              <FeatureItem
                animationData={puzzleAnimation}
                title="Puzzles"
                desc="Decode cryptic messages and solve logic grids. Enhance your problem-solving capabilities."
                btnText="Solve Now"
                link="/puzzles"
                index={0}
              />
              <FeatureItem 
                animationData={challingAnimation}
                title="Challenges"
                desc="Defend against simulated threats. Test your security knowledge in real-time scenarios."
                btnText="Defend System"
                link="/challenges"
                index={1}
              />
              <FeatureItem 
                animationData={gameAnimation}
                title="CTF"
                desc="Compete in Capture The Flag events. Apply your skills in realistic challinging"
                btnText="Start CTF"
                link="/game"
                index={2}
              />
            </motion.div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default HomePage;