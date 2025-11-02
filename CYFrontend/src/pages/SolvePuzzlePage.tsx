// src/pages/SolvePuzzlePage.tsx

import React, { useState, useRef, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  Lightbulb,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Lock,
} from 'lucide-react';

// --- Static Data (Embedded) ---

export interface IPuzzle {
  id: string;
  title: string;
  description: string;
  scenario: string;
  hints: string[];
  answer: string;
}

const MOCK_PUZZLE: IPuzzle = {
  id: '1',
  title: 'The Binary Blockade',
  description: 'A locked door, a keypad, and a strange binary clue.',
  scenario:
    "You stand before a massive steel door. A small keypad glows with a 10-digit display. Next to it, a cryptic message is etched into the wall: 'To pass, you must find the 10-bit key. It is the sum of two smaller keys: 10110 and 01101.' What 10-digit number do you enter?",
  hints: [
    'The problem involves binary numbers.',
    'You need to perform binary addition on the two "smaller keys".',
    'Remember the rules for carrying over in binary: 1 + 1 = 10 (0 and carry the 1).',
    'The final answer should be 10 digits long. You may need to pad with leading zeros.',
  ],
  answer: '101011',
};

// --- Page Component ---

const SolvePuzzlePage: React.FC = () => {
  const puzzle = MOCK_PUZZLE;
  const { puzzleId } = { puzzleId: puzzle.id };

  // --- States ---
  const [revealedHintsCount, setRevealedHintsCount] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // --- Title Scramble Effect ---
  const [displayedTitle, setDisplayedTitle] = useState(puzzle.title);
  const titleIntervalRef = useRef<number | null>(null);
  const letters = '!<>-_\\/[]{}—=+*^?#_';

  const scrambleTitle = () => {
    let iteration = 0;
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
    }

    titleIntervalRef.current = window.setInterval(() => {
      setDisplayedTitle(
        puzzle.title
          .split('')
          .map((_, index) => {
            if (index < iteration) {
              return puzzle.title[index];
            }
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join('')
      );

      if (iteration >= puzzle.title.length) {
        if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);
      }

      iteration += 1 / 3;
    }, 30);
  };

  // --- Scenario Typewriter Effect ---
  const [displayedScenario, setDisplayedScenario] = useState('');

  useEffect(() => {
    scrambleTitle();

    let index = 0;
    const scenarioInterval = setInterval(() => {
      if (index < puzzle.scenario.length) {
        setDisplayedScenario(puzzle.scenario.substring(0, index + 1));
        index++;
      } else {
        clearInterval(scenarioInterval);
      }
    }, 20);

    return () => {
      if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);
      clearInterval(scenarioInterval);
    };
  }, [puzzle.scenario, puzzle.title]);

  // --- Handlers ---
  const handleRevealHint = () => {
    if (revealedHintsCount < puzzle.hints.length) {
      setRevealedHintsCount((prevCount) => prevCount + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== 'idle' || answer.trim() === '') return;

    if (answer.trim() === puzzle.answer) {
      setFeedback('correct');
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 3000);
    } else {
      setFeedback('incorrect');
      setTimeout(() => setFeedback('idle'), 2000);
    }
  };

  const visibleHints = puzzle.hints.slice(0, revealedHintsCount);

  return (
    <PageWrapper>
      {/* Success Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="fixed w-2 h-2 bg-purple-500 rounded-full pointer-events-none z-50"
            initial={{ left: '50%', top: '50%', scale: 0, opacity: 1 }}
            animate={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Full Screen Layout */}
      <div className="min-h-screen bg-slate-900 grid lg:grid-cols-2">
        
        {/* Left Side - Puzzle Information */}
        <div className="flex flex-col justify-between p-8 lg:p-12 bg-slate-800 border-r border-slate-700">
          
          {/* Header */}
          <div>
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Lock className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm font-semibold text-purple-400 tracking-wider">
                  PUZZLE #{puzzleId}
                </p>
                <p className="text-xs text-slate-400">Logic Challenge</p>
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-5xl font-bold text-white mb-6 font-mono"
              onMouseEnter={scrambleTitle}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {displayedTitle}
            </motion.h1>

            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-slate-300 text-lg leading-relaxed">
                {displayedScenario}
                {displayedScenario.length < puzzle.scenario.length && (
                  <motion.span
                    className="inline-block w-0.5 h-5 bg-purple-400 ml-1"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </p>
            </motion.div>
          </div>

          {/* Puzzle Stats */}
          <motion.div
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <BrainCircuit className="h-5 w-5 text-purple-400 mb-2" />
              <p className="text-xs text-slate-400">Difficulty</p>
              <p className="text-sm font-semibold text-white">Medium</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <Lightbulb className="h-5 w-5 text-yellow-400 mb-2" />
              <p className="text-xs text-slate-400">Hints Used</p>
              <p className="text-sm font-semibold text-white">
                {revealedHintsCount}/{puzzle.hints.length}
              </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <CheckCircle className="h-5 w-5 text-green-400 mb-2" />
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-sm font-semibold text-white">
                {feedback === 'correct' ? 'Solved' : 'Active'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Interaction Area */}
        <div className="flex flex-col p-8 lg:p-12 bg-slate-900">
          
          {/* Answer Input Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your Answer</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    if (feedback !== 'idle') setFeedback('idle');
                  }}
                  placeholder="Enter your solution..."
                  className="w-full bg-slate-800 border border-slate-600 text-white text-lg p-4 rounded-lg focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={feedback === 'correct'}
                />
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="w-full bg-purple-600 text-white font-semibold px-6 py-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={feedback === 'correct' || answer.trim() === ''}
              >
                Submit Answer
                <ArrowRight size={20} />
              </motion.button>
            </form>

            {/* Feedback Message */}
            <AnimatePresence mode="wait">
              {feedback !== 'idle' && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 10 }}
                  exit={{ opacity: 0, y: -10 }}
                  animate={feedback}
                  variants={{
                    correct: { opacity: 1, y: 0, x: 0 },
                    incorrect: {
                      opacity: 1,
                      y: 0,
                      x: [0, -8, 8, -8, 8, 0],
                      transition: { duration: 0.5 },
                    },
                  }}
                  className={`flex items-center gap-3 mt-4 p-4 rounded-lg font-semibold ${
                    feedback === 'correct'
                      ? 'bg-green-900/50 text-green-300 border border-green-700'
                      : 'bg-red-900/50 text-red-300 border border-red-700'
                  }`}
                >
                  {feedback === 'correct' ? (
                    <>
                      <CheckCircle size={20} />
                      <span>Correct! Puzzle solved successfully.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} />
                      <span>Incorrect. Please try again.</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Hints Section */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Hints</h2>
              <span className="text-sm text-slate-400">
                {revealedHintsCount} of {puzzle.hints.length} revealed
              </span>
            </div>

            <div className="space-y-3 mb-6 min-h-[200px]">
              <AnimatePresence mode="popLayout">
                {visibleHints.length === 0 && (
                  <motion.div
                    className="flex flex-col items-center justify-center py-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Lightbulb className="h-12 w-12 text-slate-600 mb-3" />
                    <p className="text-slate-400">
                      No hints revealed yet. Click below when you need help.
                    </p>
                  </motion.div>
                )}

                {visibleHints.map((hint, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800 border border-slate-700 p-4 rounded-lg"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-slate-200 flex-1">{hint}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={handleRevealHint}
              disabled={revealedHintsCount === puzzle.hints.length || feedback === 'correct'}
              className="w-full bg-slate-800 border border-slate-700 text-white font-semibold py-3 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.98 }}
            >
              {revealedHintsCount === puzzle.hints.length
                ? 'All Hints Revealed'
                : feedback === 'correct'
                ? 'Puzzle Solved'
                : 'Reveal Next Hint'}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SolvePuzzlePage;