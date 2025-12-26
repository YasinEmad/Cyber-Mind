import React from 'react';
import { motion, Variants } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { Link } from 'react-router-dom';
import { ChevronDown, Zap } from 'lucide-react';
import Lottie from 'lottie-react';

// Animation files
import heroAnimationJson from '/home/yasin/Cyber-Mind/CYFrontend/public/assets/Untitled file.json';
import puzzleAnimation from '/home/yasin/Cyber-Mind/CYFrontend/public/assets/puzzle.json';
import challingAnimation from '/home/yasin/Cyber-Mind/CYFrontend/public/assets/security code challinging.json';
import gameAnimation from '/home/yasin/Cyber-Mind/CYFrontend/public/assets/game.json';

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

// --- SIMPLIFIED FEATURE COMPONENT ---
interface FeatureItemProps {
  animationData: any;
  title: string;
  desc: string;
  btnText: string;
  index: number;
  link?: string; // optional prop for URL
}

const FeatureItem: React.FC<FeatureItemProps> = ({ 
  animationData, 
  title, 
  desc, 
  btnText, 
  index,
  link = "#" 
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={scaleIn}
    transition={{ delay: index * 0.2 }}
    className="flex flex-col items-center text-center p-4 group"
  >
    {/* Animation Container - Scaled up for focus */}
    <div className="mb-8 w-48 h-48 md:w-56 md:h-56 relative flex justify-center items-center">
      {/* Subtle background glow that reacts to group hover */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
        className="absolute inset-0 bg-red-600/5 blur-[60px] rounded-full group-hover:bg-red-600/10 transition-colors duration-700" 
      />
      
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ 
          type: 'spring',
          stiffness: 100,
          damping: 15,
          delay: index * 0.2 + 0.1
        }}
      >
        <Lottie 
          animationData={animationData} 
          loop 
          autoplay 
          className="w-full h-full drop-shadow-[0_0_20px_rgba(239,68,68,0.2)] group-hover:drop-shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-500" 
        />
      </motion.div>
    </div>

    {/* Text Content */}
    <motion.h3 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay: index * 0.2 + 0.4 }}
      className="text-2xl font-bold tracking-tight mb-4 text-white group-hover:text-red-500 transition-colors duration-300"
    >
      {title}
    </motion.h3>
    <motion.p 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay: index * 0.2 + 0.5 }}
      className="text-gray-400 text-base leading-relaxed mb-8 max-w-sm"
    >
      {desc}
    </motion.p>

    {/* Minimalist Button with Link */}
    <Link to={link}>
      <motion.button
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        transition={{ delay: index * 0.2 + 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative overflow-hidden px-6 py-2 border-b-2 border-red-600/50 hover:border-red-500 text-red-500 font-bold uppercase tracking-widest text-xs transition-all duration-300"
      >
        {btnText}
      </motion.button>
    </Link>
  </motion.div>
);

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
                  CYBER MIND
                </span>
              </motion.h1>
              <motion.p 
                variants={fadeInUp} 
                className="text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0 font-light mb-8"
              >
                Master the digital realm through interactive intelligence.
              </motion.p>
              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all shadow-lg flex items-center gap-2 mx-auto lg:mx-0">
                  <Zap className="w-5 h-5 fill-current" /> Start Journey
                </button>
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
                Explore Our <span className="text-red-500">Features</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Dive into interactive learning experiences designed to sharpen your cyber skills
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
                title="Mini Games"
                desc="Quick-fire reflex tests and cognitive drills designed to sharpen your cyber instincts."
                btnText="Play Games"
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