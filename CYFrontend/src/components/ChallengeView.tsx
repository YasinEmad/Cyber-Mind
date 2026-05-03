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
  Target,
  AlertTriangle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createChallenge, fetchChallenges, updateChallenge, deleteChallenge } from '../redux/slices/challengeSlice';
import type { Challenge } from '../redux/slices/challengeSlice';
import { AppDispatch, RootState } from '../redux/store';
import toast from 'react-hot-toast';

const ChallengeView = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { challenges, status } = useSelector((state: RootState) => state.challenges);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; challenge: Challenge | null }>({ isOpen: false, challenge: null });
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

  const openEditModal = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title || '',
      description: challenge.description || '',
      level: challenge.level,
      initialCode: challenge.initialCode || '',
      challengeDetails: challenge.challengeDetails || '',
      recommendation: challenge.recommendation || '',
      hints: challenge.hints && challenge.hints.length > 0 ? challenge.hints : ['']
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;

    const filteredHints = formData.hints.filter(hint => hint.trim() !== '');

    const challengeData = {
      ...formData,
      hints: filteredHints,
      challengeDetails: formData.challengeDetails || formData.description
    };

    const challengeId = editingChallenge.id?.toString() || editingChallenge._id;
    if (!challengeId) {
      toast.error('Invalid challenge ID');
      return;
    }

    try {
      await dispatch(updateChallenge({ id: challengeId, challengeData })).unwrap();
      toast.success('Challenge updated successfully!');
      setIsEditModalOpen(false);
      setEditingChallenge(null);
      resetForm();
      dispatch(fetchChallenges());
    } catch (error) {
      toast.error('Failed to update challenge');
      console.error('Update challenge error:', error);
    }
  };

  const handleDeleteClick = (challenge: Challenge) => {
    setDeleteConfirm({ isOpen: true, challenge });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.challenge) return;

    const deleteId = deleteConfirm.challenge.id?.toString() || deleteConfirm.challenge._id;
    if (!deleteId) {
      toast.error('Invalid challenge ID');
      return;
    }

    try {
      await dispatch(deleteChallenge(deleteId)).unwrap();
      toast.success('Challenge deleted successfully!');
      setDeleteConfirm({ isOpen: false, challenge: null });
      dispatch(fetchChallenges());
    } catch (error) {
      toast.error('Failed to delete challenge');
      console.error('Delete challenge error:', error);
    }
  };

  // Reusable form input styling
  const inputClasses = "w-full bg-black border border-red-900/40 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none transition-colors";
  const modalHeaderClasses = "p-6 border-b border-red-900/40 bg-black";
  const modalBtnClasses = "px-4 py-2 text-gray-400 hover:text-white border border-red-900/40 rounded-lg hover:bg-red-900/20 transition-colors";

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Challenge Management</h2>
          <p className="text-red-400 mt-1">Organize competitive challenges.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
        >
          <Plus size={20} />
          Add New Challenge
        </button>
      </div>

      {/* Add Challenge Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-red-900/40 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className={modalHeaderClasses}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value as 'easy' | 'medium' | 'hard')}
                    className={inputClasses}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Challenge Details
                </label>
                <textarea
                  value={formData.challengeDetails}
                  onChange={(e) => handleInputChange('challengeDetails', e.target.value)}
                  rows={4}
                  className={inputClasses}
                  placeholder="Detailed instructions for the challenge..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Code size={16} />
                  Initial Code (Vulnerable Code)
                </label>
                <textarea
                  value={formData.initialCode}
                  onChange={(e) => handleInputChange('initialCode', e.target.value)}
                  rows={8}
                  className={inputClasses + " font-mono text-sm"}
                  placeholder="Paste the vulnerable code here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Target size={16} />
                  Recommendation
                </label>
                <textarea
                  value={formData.recommendation}
                  onChange={(e) => handleInputChange('recommendation', e.target.value)}
                  rows={3}
                  className={inputClasses}
                  placeholder="Security recommendations and hints..."
                />
              </div>

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
                        className={inputClasses}
                        placeholder={`Hint ${index + 1}`}
                      />
                      {formData.hints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHint(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHint}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    + Add another hint
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-red-900/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className={modalBtnClasses}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {status === 'loading' ? 'Creating...' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Challenge Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-red-900/40 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className={modalHeaderClasses}>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Edit Challenge</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingChallenge(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value as 'easy' | 'medium' | 'hard')}
                    className={inputClasses}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Challenge Details
                </label>
                <textarea
                  value={formData.challengeDetails}
                  onChange={(e) => handleInputChange('challengeDetails', e.target.value)}
                  rows={4}
                  className={inputClasses}
                  placeholder="Detailed instructions for the challenge..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Code size={16} />
                  Initial Code (Vulnerable Code)
                </label>
                <textarea
                  value={formData.initialCode}
                  onChange={(e) => handleInputChange('initialCode', e.target.value)}
                  rows={8}
                  className={inputClasses + " font-mono text-sm"}
                  placeholder="Paste the vulnerable code here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Target size={16} />
                  Recommendation
                </label>
                <textarea
                  value={formData.recommendation}
                  onChange={(e) => handleInputChange('recommendation', e.target.value)}
                  rows={3}
                  className={inputClasses}
                  placeholder="Security recommendations and hints..."
                />
              </div>

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
                        className={inputClasses}
                        placeholder={`Hint ${index + 1}`}
                      />
                      {formData.hints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHint(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHint}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    + Add another hint
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-red-900/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingChallenge(null);
                    resetForm();
                  }}
                  className={modalBtnClasses}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {status === 'loading' ? 'Updating...' : 'Update Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-red-700 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={24} />
                <h3 className="text-xl font-bold text-white">Delete Challenge</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold text-white">"{deleteConfirm.challenge?.title}"</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, challenge: null })}
                  className={modalBtnClasses}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={status === 'loading'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenges Table */}
      <div className="bg-black border border-red-900/40 rounded-xl overflow-hidden shadow-2xl shadow-red-900/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black border-b border-red-900/40">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-red-400 uppercase tracking-wider">Challenge</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-red-400 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-red-400 uppercase tracking-wider">Points</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-red-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-red-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/20">
              {challenges?.map((challenge: Challenge) => (
                <tr key={challenge.id || challenge._id} className="hover:bg-red-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-900/30 rounded-lg text-red-400 mr-3">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{challenge.title}</div>
                        {challenge.initialCode && (
                          <div className="text-xs text-red-500">Has vulnerable code</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      challenge.level === 'easy' ? 'bg-green-900/30 text-green-400' :
                      challenge.level === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {challenge.level?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {challenge.points} XP
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300 max-w-xs truncate">
                      {challenge.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(challenge)}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Edit Challenge"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(challenge)}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Challenge"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {challenges?.length === 0 && (
        <div className="text-center py-12 bg-black border border-red-900/40 rounded-xl">
          <Trophy size={48} className="text-red-600 mx-auto mb-4" />
          <p className="text-gray-400">No challenges created yet.</p>
        </div>
      )}
    </div>
  );
};

export default ChallengeView;
