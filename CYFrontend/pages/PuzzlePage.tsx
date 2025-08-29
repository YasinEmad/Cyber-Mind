
import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { Puzzle } from '../types';
import PuzzleCard from '../components/PuzzleCard';

const puzzles: Puzzle[] = [
  { id: 1, title: 'Cryptic Crossword', category: 'Logic', description: 'Unravel the hidden words through cryptic clues.' },
  { id: 2, title: 'Sudoku Extreme', category: 'Numbers', description: 'A challenging 9x9 grid that will test your limits.' },
  { id: 3, title: 'The Escapist', category: 'Riddle', description: 'Solve a series of riddles to find your way out.' },
  { id: 4, title: 'Pattern Recognition', category: 'Visual', description: 'Identify the next sequence in a complex visual pattern.' },
  { id: 5, title: 'Codebreaker', category: 'Logic', description: 'Decrypt the message using your wits and logic.' },
  { id: 6, title: 'Spatial Reasoning', category: 'Visual', description: 'Manipulate 3D objects in your mind to solve.' },
];

const PuzzlePage: React.FC = () => {
  return (
    <div className="relative animated-grid-bg">
        <PageWrapper>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white">Mind Puzzles</h1>
            <p className="text-slate-300 mt-2">Engage your brain and solve intricate puzzles.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {puzzles.map((puzzle, index) => (
              <PuzzleCard key={puzzle.id} puzzle={puzzle} index={index} />
            ))}
          </div>
        </PageWrapper>
    </div>
  );
};

export default PuzzlePage;