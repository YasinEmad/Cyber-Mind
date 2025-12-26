
import React from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

const PlayLevelPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <motion.div
          className="w-full max-w-2xl p-8 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Gamepad2 className="mx-auto h-16 w-16 text-cyan-400 mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Level {levelId}</h1>
          <p className="text-slate-300 mb-8">
            The game for this level will be built here. Have fun!
          </p>
          <div className="bg-slate-900/50 h-64 rounded-lg flex items-center justify-center">
            <p className="text-slate-500 italic">Level {levelId} content will appear here...</p>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default PlayLevelPage;
