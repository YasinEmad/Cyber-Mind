import  { useEffect } from 'react';
import { 
  Puzzle as PuzzleIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  AlertCircle
} from 'lucide-react';

// Redux Imports
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store'; // Adjust path to your store file
import { 
  fetchPuzzles, 
  deletePuzzle, 
  Puzzle // Import the type
} from '../redux/slices/puzzleSlice'; // Adjust path to your slice file

export const PuzzlesViewAdmin = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Access state from Redux
  const { puzzles, status, error } = useSelector((state: RootState) => state.puzzles);

  // Fetch puzzles on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPuzzles());
    }
  }, [status, dispatch]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this puzzle?')) {
      dispatch(deletePuzzle(id));
    }
  };

  // --- Render States ---

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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Puzzle Management</h2>
          <p className="text-gray-400 mt-1">Create and manage game puzzles.</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
          <Plus size={20} />
          Add New Puzzle
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {puzzles.length > 0 ? (
          puzzles.map((puzzle: Puzzle) => (
            <div key={puzzle._id} className={`bg-gray-800 border ${puzzle.active ? 'border-gray-700' : 'border-red-900/50'} rounded-xl shadow-lg p-6 flex flex-col hover:border-blue-500 transition-colors`}>
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400">
                  <PuzzleIcon size={24} />
                </div>
                <div className="flex gap-2">
                   {/* Logic to determine badge color based on level or category */}
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
              <p className="text-gray-400 mb-2 text-sm uppercase tracking-wide font-semibold">{puzzle.category}</p>
              <p className="text-gray-400 mb-6 flex-grow line-clamp-3">
                {puzzle.description}
              </p>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button 
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors" 
                  title="Edit"
                  // Add onClick handler for Edit here
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(puzzle._id)}
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