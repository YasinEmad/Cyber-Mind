import React from 'react';
import { Puzzle, Target } from 'lucide-react';

interface ProfileActivityTableProps {
  solvedPuzzles: any[];
  loadingPuzzles: boolean;
}

const ProfileActivityTable: React.FC<ProfileActivityTableProps> = ({ solvedPuzzles, loadingPuzzles }) => (
  <section className="bg-neutral-900/30 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
    <div className="p-8 border-b border-neutral-800 flex justify-between items-center">
      <h3 className="font-black uppercase tracking-widest text-sm">Deployment Logs</h3>
      <button className="text-xs text-red-500 font-bold hover:underline">Download Report</button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-black uppercase text-neutral-500 border-b border-neutral-800">
            <th className="px-8 py-4">Puzzle</th>
            <th className="px-8 py-4">Level</th>
            <th className="px-8 py-4">Category</th>
            <th className="px-8 py-4">Tags</th>
            <th className="px-8 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/50">
          {loadingPuzzles ? (
            <tr>
              <td colSpan={5} className="px-8 py-8 text-center text-neutral-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  Loading deployment data...
                </div>
              </td>
            </tr>
          ) : solvedPuzzles.length > 0 ? (
            solvedPuzzles.map((puzzle, index) => (
              <PuzzleActivityRow
                key={puzzle.id || puzzle._id || index}
                puzzle={puzzle}
                isRecent={index === 0}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-8 py-8 text-center text-neutral-600">
                <div className="flex flex-col items-center gap-2">
                  <Target size={24} className="text-neutral-700" />
                  <span className="text-sm">No puzzles solved yet</span>
                  <span className="text-xs">Start your first challenge!</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
);

const PuzzleActivityRow = ({ puzzle, isRecent }: { puzzle: any; isRecent: boolean }) => (
  <tr className={`hover:bg-white/[0.02] transition-colors ${isRecent ? 'bg-red-500/5 border-l-4 border-l-red-500' : ''}`}>
    <td className="px-8 py-5">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRecent ? 'bg-red-500/20' : 'bg-neutral-800'}`}>
          <Puzzle size={16} className={isRecent ? 'text-red-400' : 'text-neutral-400'} />
        </div>
        <div>
          <p className="font-bold text-sm text-neutral-200">{puzzle.title}</p>
          {isRecent && <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Latest</span>}
        </div>
      </div>
    </td>
    <td className="px-8 py-5">
      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded ${
        puzzle.level === 1 ? 'bg-green-500/20 text-green-400' :
        puzzle.level === 2 ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        Level {puzzle.level ?? '—'}
      </span>
    </td>
    <td className="px-8 py-5">
      <span className="text-xs font-mono text-neutral-400 bg-neutral-800/50 px-2 py-1 rounded">
        {puzzle.category || 'Unknown'}
      </span>
    </td>
    <td className="px-8 py-5">
      <div className="flex flex-wrap gap-1">
        {puzzle.tags?.slice(0, 3).map((tag: string, idx: number) => (
          <span key={idx} className="text-[9px] text-red-400 bg-red-950/30 border border-red-900/30 px-1.5 py-0.5 rounded font-mono uppercase">
            {tag}
          </span>
        ))}
        {puzzle.tags?.length > 3 && (
          <span className="text-[9px] text-neutral-500">+{puzzle.tags.length - 3}</span>
        )}
      </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Solved</span>
      </div>
    </td>
  </tr>
);

export default ProfileActivityTable;
