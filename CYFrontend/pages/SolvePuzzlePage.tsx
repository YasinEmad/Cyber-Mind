
import React from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const SolvePuzzlePage: React.FC = () => {
  const { puzzleId } = useParams<{ puzzleId: string }>();

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <motion.div
          className="w-full max-w-2xl p-8 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BrainCircuit className="mx-auto h-16 w-16 text-purple-400 mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Solving Puzzle #{puzzleId}</h1>
          <p className="text-slate-300 mb-8">
            The puzzle interface will be built here. Get ready to crack the code!
          </p>
          <div className="bg-slate-900/50 h-64 rounded-lg flex items-center justify-center">
            <p className="text-slate-500 italic">Puzzle content will appear here...</p>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default SolvePuzzlePage;
