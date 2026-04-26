import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { Gamepad2, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

const Level27: React.FC = () => {
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
          <h1 className="text-4xl font-bold text-white mb-4">Level 27</h1>
          <p className="text-slate-300 mb-8">
          <div className="flex gap-4 justify-center mb-6">
            <Link
              to="/linux"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Monitor className="w-4 h-4" />
              Linux Terminal
            </Link>
          </div>
            Welcome to Level 27! This is a dedicated page for Level 27.
          </p>
          <div className="bg-slate-900/50 h-64 rounded-lg flex items-center justify-center">
            <p className="text-slate-500 italic">Level 27 content will appear here...</p>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Level27;
