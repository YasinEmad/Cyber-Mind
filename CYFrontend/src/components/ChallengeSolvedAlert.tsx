import { motion } from 'framer-motion';
import { CheckCircle, Info, X } from 'lucide-react'; // Using Info for the already solved case
import React, { useEffect } from 'react';

interface ChallengeSolvedAlertProps {
  challengeTitle: string;
  points: number;
  onClose: () => void;
  isSolvedBefore: boolean;
}

const ChallengeSolvedAlert: React.FC<ChallengeSolvedAlertProps> = ({
  challengeTitle,
  points,
  onClose,
  isSolvedBefore,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (isSolvedBefore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-blue-500 rounded-lg shadow-xl p-6 z-50 w-full max-w-md text-white"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
            className="bg-blue-500 rounded-full p-3 mb-4"
          >
            <Info size={48} className="text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Solution Correct!</h2>
          <p className="text-lg mb-4">
            You have already solved{' '}
            <span className="font-semibold text-blue-400">{challengeTitle}</span>.
          </p>
          <div
            className="bg-gray-800 rounded-full px-4 py-2"
          >
            <p className="text-lg font-semibold text-gray-300">
              No points awarded this time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </motion.div>
    );
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      // Change: bg-gray-800 to bg-black, border-green-500 to border-red-600
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-red-600 rounded-lg shadow-xl p-6 z-50 w-full max-w-md text-white"
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
          // Change: bg-green-500 to bg-red-600
          className="bg-red-600 rounded-full p-3 mb-4"
        >
          <CheckCircle size={48} className="text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Challenge Solved!</h2>
        <p className="text-lg mb-4">
          Congratulations on solving{' '}
          {/* Change: text-green-400 to text-red-400 */}
          <span className="font-semibold text-red-400">{challengeTitle}</span>.
        </p>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          // Change: bg-gray-700 to bg-red-950 (a very dark red for contrast)
          className="bg-red-950 rounded-full px-4 py-2 border border-red-900"
        >
          <p className="text-xl font-bold">
            {/* Change: text-yellow-400 to text-red-400 */}
            +<span className="text-red-400">{points}</span> Points
          </p>
        </motion.div>
        <button
          onClick={onClose}
          // Change: hover:text-white to hover:text-red-500
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </button>
      </div>
    </motion.div>
  );
};

export default ChallengeSolvedAlert;