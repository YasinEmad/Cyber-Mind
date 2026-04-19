import { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Code,
  FileText,
  Lightbulb,
  Target
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createChallenge, fetchChallenges } from '../redux/slices/challengeSlice';
import type { Challenge } from '../redux/slices/challengeSlice';
import { AppDispatch, RootState } from '../redux/store';
import toast from 'react-hot-toast';

// Reuse the shared challenge type from Redux to match API data shape.

const ChallengeView = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { challenges, status } = useSelector((state: RootState) => state.challenges);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'easy' as 'easy' | 'medium' | 'hard',
    initialCode: '',
    challengeDetails: '',
    recommendation: '',
    hints: ['']
  });

  useEffect(() => {
    dispatch(fetchChallenges());
  }, [dispatch]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHintChange = (index: number, value: string) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

  const addHint = () => {
    setFormData(prev => ({ ...prev, hints: [...prev.hints, ''] }));
  };

  const removeHint = (index: number) => {
    if (formData.hints.length > 1) {
      const newHints = formData.hints.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, hints: newHints }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty hints
    const filteredHints = formData.hints.filter(hint => hint.trim() !== '');

    const challengeData = {
      ...formData,
      hints: filteredHints,
      challengeDetails: formData.challengeDetails || formData.description
    };

    try {
      await dispatch(createChallenge(challengeData)).unwrap();
      toast.success('Challenge created successfully!');
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        description: '',
        level: 'easy',
        initialCode: '',
        challengeDetails: '',
        recommendation: '',
        hints: ['']
      });
      dispatch(fetchChallenges());
    } catch (error) {
      toast.error('Failed to create challenge');
      console.error('Create challenge error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: 'easy',
      initialCode: '',
      challengeDetails: '',
      recommendation: '',
      hints: ['']
    });
  };
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Challenge Management</h2>
          <p className="text-gray-400 mt-1">Organize competitive challenges.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
        >
          <Plus size={20} />
          Add New Challenge
        </button>
      </div>

      {/* Add Challenge Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Add New Challenge</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Level *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Challenge Details */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Challenge Details
                </label>
                <textarea
                  value={formData.challengeDetails}
                  onChange={(e) => handleInputChange('challengeDetails', e.target.value)}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Detailed instructions for the challenge..."
                />
              </div>

              {/* Initial Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Code size={16} />
                  Initial Code (Vulnerable Code)
                </label>
                <textarea
                  value={formData.initialCode}
                  onChange={(e) => handleInputChange('initialCode', e.target.value)}
                  rows={8}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Paste the vulnerable code here..."
                />
              </div>

              {/* Recommendation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Target size={16} />
                  Recommendation
                </label>
                <textarea
                  value={formData.recommendation}
                  onChange={(e) => handleInputChange('recommendation', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Security recommendations and hints..."
                />
              </div>

              {/* Hints */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Lightbulb size={16} />
                  Hints
                </label>
                <div className="space-y-2">
                  {formData.hints.map((hint, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={hint}
                        onChange={(e) => handleHintChange(index, e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                        placeholder={`Hint ${index + 1}`}
                      />
                      {formData.hints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHint(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHint}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    + Add another hint
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {status === 'loading' ? 'Creating...' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges?.map((challenge: Challenge) => (
          <div key={challenge.id} className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 flex flex-col hover:border-yellow-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-900/30 rounded-lg text-yellow-400">
                <Trophy size={24} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  challenge.level === 'easy' ? 'bg-green-900/30 text-green-400' :
                  challenge.level === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-red-900/30 text-red-400'
                }`}>
                  {challenge.level?.toUpperCase()}
                </span>
                <span className="px-2 py-1 text-xs font-semibold bg-gray-700 text-yellow-500 rounded-full">
                  {challenge.points} XP
                </span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
            <p className="text-gray-400 mb-4 flex-grow line-clamp-3">{challenge.description}</p>

            {challenge.initialCode && (
              <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-600">
                <p className="text-xs text-gray-500 mb-1">Security Challenge</p>
                <pre className="text-xs text-gray-300 font-mono overflow-hidden max-h-20">
                  {challenge.initialCode.substring(0, 100)}...
                </pre>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors" title="Edit">
                <Edit size={18} />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors" title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {challenges?.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No challenges created yet.</p>
        </div>
      )}
    </div>
  );
};

export default ChallengeView;
