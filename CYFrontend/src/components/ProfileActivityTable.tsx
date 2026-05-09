import React from 'react';
import { Puzzle, Target, Flag, Shield, Award } from 'lucide-react';

interface ProfileActivityTableProps {
  solvedPuzzles: any[];
  loadingPuzzles: boolean;
  solvedCTFLevels?: any[];
  ctfCount?: number;
}

const ProfileActivityTable: React.FC<ProfileActivityTableProps> = ({ 
  solvedPuzzles, 
  loadingPuzzles, 
  solvedCTFLevels = [], 
  ctfCount 
}) => {
  const totalCTFSolved = ctfCount ?? solvedCTFLevels.length;
  const displayCTFLevels = solvedCTFLevels.slice(-5).reverse();
  
  return (
    <section className="space-y-6">
      {/* CTF Levels Section */}
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-700 rounded-2xl overflow-hidden hover:border-neutral-600 transition-all duration-300">
        <div className="p-6 border-b border-neutral-700 flex justify-between items-center bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Flag size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-sm text-white">CTF Challenges</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Recently completed levels</p>
            </div>
          </div>
          <span className="text-sm text-red-400 font-bold bg-red-500/10 px-3 py-1 rounded-full">
            {totalCTFSolved} Solved
          </span>
        </div>
        <div className="overflow-x-auto">
          {displayCTFLevels.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-bold uppercase text-neutral-500 border-b border-neutral-700 bg-neutral-900/30">
                  <th className="px-6 py-4">Challenge</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/50">
                {displayCTFLevels.map((level, index) => (
                  <CTFLevelRow
                    key={level.levelId || index}
                    level={level}
                    isRecent={index === 0}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-xl bg-neutral-800/50 flex items-center justify-center">
                  <Shield size={32} className="text-neutral-600" />
                </div>
              </div>
              {totalCTFSolved > 0 ? (
                <>
                  <p className="font-bold text-neutral-200 mb-1">
                    You have solved {totalCTFSolved} CTF level{totalCTFSolved === 1 ? '' : 's'}
                  </p>
                  <p className="text-sm text-neutral-500">Level details are syncing with your profile</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-neutral-200 mb-1">No CTF levels solved yet</p>
                  <p className="text-sm text-neutral-500">Complete your first flag to start earning points</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Puzzles Section */}
      <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-700 rounded-2xl overflow-hidden hover:border-neutral-600 transition-all duration-300">
        <div className="p-6 border-b border-neutral-700 flex justify-between items-center bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Puzzle size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-sm text-white">Recent Activity</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Last 5 solved puzzles</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold uppercase text-neutral-500 border-b border-neutral-700 bg-neutral-900/30">
                <th className="px-6 py-4">Puzzle</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/50">
              {loadingPuzzles ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-neutral-500 text-sm">Loading activity data...</span>
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
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-neutral-800/50 flex items-center justify-center">
                        <Target size={32} className="text-neutral-600" />
                      </div>
                      <p className="font-bold text-neutral-200">No puzzles solved yet</p>
                      <p className="text-sm text-neutral-500">Start solving challenges to build your profile</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const CTFLevelRow = ({ level, isRecent }: { level: any; isRecent: boolean }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/15 text-green-400 border border-green-500/30';
      case 'medium': return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30';
      case 'hard': return 'bg-red-500/15 text-red-400 border border-red-500/30';
      default: return 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/30';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <tr className={`hover:bg-white/[0.03] transition-colors ${isRecent ? 'bg-red-500/5' : ''}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isRecent ? 'bg-red-500/20' : 'bg-neutral-800/50'
          }`}>
            <Flag size={16} className={isRecent ? 'text-red-400' : 'text-neutral-500'} />
          </div>
          <div>
            <p className="font-bold text-sm text-neutral-200">{level.title}</p>
            {isRecent && (
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
                Latest Solve
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700">
          Lv {level.level}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg ${
          getDifficultyColor(level.difficulty)
        }`}>
          {level.difficulty}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-emerald-400" />
          <span className="text-sm font-bold text-emerald-400">+{level.pointsAwarded}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs text-neutral-500">{formatDate(level.completedAt)}</span>
      </td>
    </tr>
  );
};

const PuzzleActivityRow = ({ puzzle, isRecent }: { puzzle: any; isRecent: boolean }) => (
  <tr className={`hover:bg-white/[0.03] transition-colors ${isRecent ? 'bg-red-500/5' : ''}`}>
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isRecent ? 'bg-purple-500/20' : 'bg-neutral-800/50'
        }`}>
          <Puzzle size={16} className={isRecent ? 'text-purple-400' : 'text-neutral-500'} />
        </div>
        <div>
          <p className="font-bold text-sm text-neutral-200">{puzzle.title}</p>
          {isRecent && (
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
              Latest Solve
            </span>
          )}
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg border ${
        puzzle.level === 1 ? 'bg-green-500/15 text-green-400 border-green-500/30' :
        puzzle.level === 2 ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
        'bg-red-500/15 text-red-400 border-red-500/30'
      }`}>
        Lv {puzzle.level ?? '—'}
      </span>
    </td>
    <td className="px-6 py-4">
      <span className="text-xs font-mono text-neutral-400 bg-neutral-800/50 px-3 py-1.5 rounded-lg border border-neutral-700">
        {puzzle.category || 'General'}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-wrap gap-1">
        {puzzle.tags?.slice(0, 3).map((tag: string, idx: number) => (
          <span 
            key={idx} 
            className="text-[9px] text-red-400 bg-red-950/30 border border-red-900/30 px-1.5 py-0.5 rounded font-mono uppercase"
          >
            {tag}
          </span>
        ))}
        {puzzle.tags?.length > 3 && (
          <span className="text-[9px] text-neutral-500">+{puzzle.tags.length - 3}</span>
        )}
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">
          Completed
        </span>
      </div>
    </td>
  </tr>
);

export default ProfileActivityTable;
