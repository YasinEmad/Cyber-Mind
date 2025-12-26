import { useState, useEffect } from 'react';
import {
  Puzzle as PuzzleIcon,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle
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
    try { console.debug('PuzzlesViewAdmin.handleSave: level:', (puzzleData as any).level, 'typeof:', typeof (puzzleData as any).level); } catch (e) {}
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
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
        <p>Loading puzzles...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-400">
        <AlertCircle size={40} className="mb-4" />
        <p>Error loading puzzles: {error}</p>
        <button
          onClick={() => dispatch(fetchPuzzles())}
          className="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {isAlertOpen && puzzleToDelete && (
        <DeleteAlert
          title="Delete Puzzle"
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

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Puzzle Management</h2>
          <p className="text-gray-400 mt-1">Create and manage game puzzles.</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
        >
          <Plus size={20} />
          Add New Puzzle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {puzzles.length > 0 ? (
          puzzles.map((puzzle: Puzzle) => (
            <div key={puzzle._id} className={`bg-gray-800 border ${puzzle.active ? 'border-gray-700' : 'border-red-900/50'} rounded-xl shadow-lg p-6 flex flex-col hover:border-blue-500 transition-colors`}>

              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400">
                  <PuzzleIcon size={24} />
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-xs font-semibold bg-gray-700 text-gray-300 rounded-full">
                    Level {puzzle.level}
                  </span>
                  {!puzzle.active && (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-900/50 text-red-300 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{puzzle.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs text-blue-300 bg-blue-900/20 px-2 py-1 rounded-full font-semibold">{puzzle.tag}</p>
                <p className="text-gray-400 text-sm uppercase tracking-wide font-semibold">{puzzle.category}</p>
              </div>
              <p className="text-gray-400 mb-6 flex-grow line-clamp-3">
                {puzzle.description}
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleEdit(puzzle)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(puzzle)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No puzzles found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}