import { useState, useEffect } from 'react';
import {
  Puzzle as PuzzleIcon,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Skull
} from 'lucide-react';
import { PuzzleForm } from './PuzzleForm';
import DeleteAlert from './DeleteAlert';

// Redux Imports
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import {
  fetchPuzzles,
  deletePuzzle,
  createPuzzle,
  updatePuzzle,
  Puzzle
} from '../redux/slices/puzzleSlice';

export const PuzzlesViewAdmin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { puzzles, status, error } = useSelector((state: RootState) => state.puzzles);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [puzzleToDelete, setPuzzleToDelete] = useState<Puzzle | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPuzzles());
    }
  }, [status, dispatch]);

  const handleDelete = (puzzle: Puzzle) => {
    setPuzzleToDelete(puzzle);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (puzzleToDelete) {
      dispatch(deletePuzzle(puzzleToDelete._id));
      setIsAlertOpen(false);
      setPuzzleToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsAlertOpen(false);
    setPuzzleToDelete(null);
  };

  const handleSave = (puzzleData: Omit<Puzzle, '_id'> | Puzzle) => {
    if ('_id' in puzzleData) {
      dispatch(updatePuzzle({ id: puzzleData._id, updatedData: puzzleData }));
    } else {
      dispatch(createPuzzle(puzzleData));
    }
    setIsFormOpen(false);
    setSelectedPuzzle(null);
  };

  const handleEdit = (puzzle: Puzzle) => {
    setSelectedPuzzle(puzzle);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedPuzzle(null);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedPuzzle(null);
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-mono tracking-widest uppercase">Decrypting Data...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertCircle size={40} className="mb-4 animate-pulse" />
        <p className="font-bold">SYSTEM FAILURE: {error}</p>
        <button
          onClick={() => dispatch(fetchPuzzles())}
          className="mt-4 px-6 py-2 bg-red-950 border border-red-600 rounded text-red-400 hover:bg-red-600 hover:text-white transition-all font-mono"
        >
          RETRY_BOOT
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {isAlertOpen && puzzleToDelete && (
        <DeleteAlert
          title="PURGE PUZZLE"
          puzzleTitle={puzzleToDelete.title}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      {isFormOpen && (
        <PuzzleForm
          puzzle={selectedPuzzle}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
            Puzzle <span className="text-red-600">Archive</span>
          </h2>
          <p className="text-gray-500 mt-1 font-mono text-sm">Deploy and stabilize neural challenges.</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-red-600 hover:bg-red-700 text-white font-black py-2.5 px-6 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
        >
          <Plus size={20} />
          NEW_DEPLOYMENT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {puzzles.length > 0 ? (
          puzzles.map((puzzle: Puzzle) => (
            <div 
              key={puzzle._id} 
              className={`bg-zinc-950 border ${
                puzzle.active ? 'border-zinc-800' : 'border-red-900/50'
              } rounded-xl shadow-2xl p-6 flex flex-col hover:border-red-600/50 transition-all duration-300 group relative overflow-hidden`}
            >
              {/* Subtle accent line at the top of each card */}
              <div className={`absolute top-0 left-0 h-1 w-full ${puzzle.active ? 'bg-zinc-800' : 'bg-red-900/50'}`} />

              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${puzzle.active ? 'bg-zinc-900 text-red-500' : 'bg-red-950/20 text-red-800'}`}>
                  <PuzzleIcon size={24} />
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-[10px] font-black bg-zinc-900 text-zinc-400 border border-zinc-800 rounded uppercase tracking-tighter">
                    Lvl {puzzle.level}
                  </span>
                  {!puzzle.active && (
                    <span className="px-2 py-1 text-[10px] font-black bg-red-950/50 text-red-500 border border-red-900/50 rounded uppercase tracking-tighter">
                      OFFLINE
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">
                {puzzle.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] text-red-400 bg-red-950/30 border border-red-900/30 px-2 py-0.5 rounded font-mono uppercase">
                  {puzzle.tag}
                </p>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                  {puzzle.category}
                </p>
              </div>
              
              <p className="text-zinc-400 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                {puzzle.description}
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  onClick={() => handleEdit(puzzle)}
                  className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-900 rounded-lg transition-all"
                  title="Modify"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(puzzle)}
                  className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-950/20 rounded-lg transition-all"
                  title="Terminate"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl">
            <Skull size={48} className="text-zinc-800 mb-4" />
            <p className="text-zinc-600 font-mono italic">No data detected in primary archive.</p>
          </div>
        )}
      </div>
    </div>
  );
}