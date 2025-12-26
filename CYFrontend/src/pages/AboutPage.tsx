import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { PlayCircle, Sparkles, Target, Users } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <PageWrapper>
      <div className="text-center mb-16">
        <motion.div
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-red-900/30 to-red-900/10 border border-red-800/30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Sparkles className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium text-red-300">Elevating Minds Through Play</span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          About <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Cyber Mind</span>
        </motion.h1>

        <motion.p
          className="text-xl text-gray-300 mt-8 max-w-3xl mx-auto leading-relaxed font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
Experience how Cyber Mind transforms cognitive training through immersive challenges, puzzles, and games        </motion.p>
      </div>

  

      <motion.div
        className="w-full max-w-4xl mx-auto my-16"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="relative aspect-video w-full bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden border-2 border-gray-800 cursor-pointer group hover:border-red-500/70 transition-all duration-500 shadow-2xl shadow-red-900/30">
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/50">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
          </div>
          
          {/* Play button container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-3xl group-hover:bg-red-500/30 transition-all duration-500" />
              <PlayCircle className="relative w-24 h-24 text-white/90 group-hover:text-red-400 group-hover:scale-110 transition-all duration-300 z-10 drop-shadow-2xl" />
            </div>
          </div>

          {/* Hover effect label */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-medium rounded-full">
              Watch Demo
            </span>
          </div>
        </div>

        {/* Video description */}
        <p className="text-center text-gray-500 text-sm mt-6">
          2:30 min showcase • Updated this week • 4K resolution available
        </p>
      </motion.div>

      {/* Closing statement */}
      <motion.div
        className="max-w-3xl mx-auto mt-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="text-2xl md:text-3xl font-light text-gray-300 italic mb-4">
          "Where intellect meets innovation"
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-orange-500 mx-auto rounded-full mt-6" />
      </motion.div>
    </PageWrapper>
  );
};

export default AboutPage;