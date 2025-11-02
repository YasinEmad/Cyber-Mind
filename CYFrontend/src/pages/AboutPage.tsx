
import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { Cpu, Target, Award, PlayCircle } from 'lucide-react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delay: number }> = ({ icon, title, children, delay }) => {
  return (
    <motion.div
      className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <div className="inline-block bg-cyan-500/20 text-cyan-400 p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{children}</p>
    </motion.div>
  );
};


const AboutPage: React.FC = () => {
  return (
    <PageWrapper>
      <div className="text-center mb-12">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          About Cyber Mind
        </motion.h1>
        <motion.p 
          className="text-slate-300 mt-4 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Cyber Mind is a cutting-edge platform designed to push the boundaries of your intellect and skill. We believe in the power of play to sharpen the mind and foster a community of thinkers, creators, and competitors.
        </motion.p>
      </div>

      {/* Video Explanation Section */}
      <motion.div 
        className="w-full max-w-3xl mx-auto my-16"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">See It In Action</h2>
        <div className="aspect-[16/9] w-full bg-slate-900/50 border-2 border-slate-700 rounded-2xl flex items-center justify-center cursor-pointer group hover:border-cyan-400 transition-all duration-300 shadow-2xl shadow-cyan-900/20">
            <PlayCircle className="w-20 h-20 text-slate-500 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300" />
        </div>
      </motion.div>

      {/* Key Features Section */}
      <div className="my-16">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Our Core Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard title="Cutting-Edge Puzzles" icon={<Cpu size={32} />} delay={0.6}>
            Engage with uniquely crafted puzzles that challenge your logic, creativity, and problem-solving abilities.
          </FeatureCard>
          <FeatureCard title="Competitive Challenges" icon={<Target size={32} />} delay={0.8}>
            Test your skills against the clock and other players in daily and weekly challenges with unique objectives.
          </FeatureCard>
          <FeatureCard title="Rewarding Progression" icon={<Award size={32} />} delay={1.0}>
            Earn points, climb the leaderboards, and unlock achievements as you prove your mastery across all activities.
          </FeatureCard>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AboutPage;
