import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { PlayCircle, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

const AboutPage: React.FC = () => {
  return (
    <PageWrapper>
      <motion.div 
        className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 flex flex-col items-start min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section - Left Aligned */}
        <div className="w-full max-w-3xl mb-20 relative z-10">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2.5 mb-8 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 backdrop-blur-md shadow-[inset_0_0_12px_rgba(239,68,68,0.1)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-red-300 uppercase">
              Elevating Minds Through Play
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-extrabold text-white mb-8 tracking-tight leading-[1.1]"
          >
            About{" "}
            <span className="bg-gradient-to-br from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(239,68,68,0.4)]">
              Cyber Mind
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-400/90 leading-relaxed font-light max-w-2xl"
          >
            Experience how Cyber Mind transforms cognitive training through immersive challenges, puzzles, and <span className="text-gray-200 font-medium">CTF competitions</span>.
          </motion.p>
        </div>

        {/* Video Showcase Section */}
        <motion.div
          variants={itemVariants}
          className="w-full relative group mt-4 z-20"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
          
          <div className="relative aspect-[16/9] w-full bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/10 transition-all duration-700 hover:border-red-500/40 shadow-2xl">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/WAvchbP2kXM"
              title="Cyber Mind About Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>

        {/* Footer Quote - Bottom Right Aligned */}
        <motion.div
          variants={itemVariants}
          className="w-full mt-32 flex justify-end relative"
        >
          <div className="text-right flex flex-col items-end border-r-2 border-red-900/50 pr-6 py-1 hover:border-red-500 transition-colors duration-500">
            <p className="text-2xl md:text-3xl font-light text-gray-500 italic tracking-wide">
              "Where intellect meets <span className="text-gray-300">innovation</span>"
            </p>
          </div>
        </motion.div>

      </motion.div>
    </PageWrapper>
  );
};

export default AboutPage;