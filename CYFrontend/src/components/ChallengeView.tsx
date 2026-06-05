import { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Code,
  FileText,
  Target,
  AlertTriangle,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createChallenge, fetchChallenges, updateChallenge, deleteChallenge, deleteAllChallenges } from '../redux/slices/challengeSlice';
import type { Challenge } from '../redux/slices/challengeSlice';
import { selectUser } from '../redux/slices/userSlice';
import { AppDispatch, RootState } from '../redux/store';
import toast from 'react-hot-toast';

const ChallengeView = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { challenges, status } = useSelector((state: RootState) => state.challenges);
  const currentUser = useSelector(selectUser);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; challenge: Challenge | null }>({ isOpen: false, challenge: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [progressFilter, setProgressFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'easy' as 'easy' | 'medium' | 'hard',
    initialCode: '',
    challengeDetails: '',
    recommendation: '',
  });

  useEffect(() => {
    dispatch(fetchChallenges());
  }, [dispatch]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const solvedChallengeIds = useMemo(() => {
    const ids = currentUser?.profile?.solvedChallenges ?? currentUser?.solvedChallenges ?? [];
    return new Set(ids.map((id) => String(id)));
  }, [currentUser]);

  const filteredChallenges = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return challenges.filter((challenge) => {
      const challengeKey = String(challenge.id || challenge._id || challenge.uuid || '');
      const isSolved = solvedChallengeIds.has(challengeKey);

      if (difficultyFilter !== 'all') {
        const normalizedLevel = challenge.level?.toLowerCase() || (challenge as any).difficulty?.toString().toLowerCase() || '';
        if (normalizedLevel !== difficultyFilter) {
          return false;
        }
      }

      if (progressFilter === 'solved' && !isSolved) {
        return false;
      }
      if (progressFilter === 'unsolved' && isSolved) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        challenge.title,
        challenge.description,
        challenge.challengeDetails,
        challenge.recommendation,
        challenge.level,
        (challenge as any).difficulty?.toString(),
        (challenge as any).category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [challenges, difficultyFilter, progressFilter, searchTerm, solvedChallengeIds]);

  const visibleCount = filteredChallenges.length;
  const totalCount = challenges.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const challengeData = {
      ...formData,
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
        recommendation: ''
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
      recommendation: ''
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
      recommendation: challenge.recommendation || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;

    const challengeData = {
      ...formData,
      challengeDetails: formData.challengeDetails || formData.description
    };

    const challengeId = editingChallenge.uuid || editingChallenge.id?.toString() || editingChallenge._id;
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

    const deleteId = deleteConfirm.challenge.uuid || deleteConfirm.challenge.id?.toString() || deleteConfirm.challenge._id;
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

  const handleDeleteAllChallenges = async () => {
    const confirmed = window.confirm('Delete all challenges? This cannot be undone.');
    if (!confirmed) return;

    try {
      await dispatch(deleteAllChallenges()).unwrap();
      toast.success('All challenges removed successfully.');
      dispatch(fetchChallenges());
    } catch (error) {
      toast.error('Failed to delete all challenges');
      console.error('Delete all challenges error:', error);
    }
  };

  // Reusable form input styling
  const inputClasses = "w-full bg-black border border-red-900/40 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none transition-colors";
  const modalHeaderClasses = "p-6 border-b border-red-900/40 bg-black";
  const modalBtnClasses = "px-4 py-2 text-gray-400 hover:text-white border border-red-900/40 rounded-lg hover:bg-red-900/20 transition-colors";

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Challenge Management</h2>
          <p className="text-red-400 mt-1">Organize competitive challenges.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus size={20} />
            Add New Challenge
          </button>
          <button
            onClick={handleDeleteAllChallenges}
            className="bg-zinc-900 hover:bg-red-950 text-red-400 border border-red-700 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            title="Remove every challenge level"
          >
            <Trash2 size={20} />
            Remove All Levels
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] mb-8">
        <div className="rounded-2xl border border-red-900/40 bg-zinc-950 p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, category, keywords..."
              className={`${inputClasses} pl-10`}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-300 mb-2">Difficulty</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'easy', 'medium', 'hard'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDifficultyFilter(option as 'all' | 'easy' | 'medium' | 'hard')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${difficultyFilter === option ? 'bg-red-600 text-white' : 'bg-black border border-red-900/40 text-gray-300 hover:bg-red-900/20'}`}
                  >
                    {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-300 mb-2">Progress</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'solved', 'unsolved'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setProgressFilter(option as 'all' | 'solved' | 'unsolved')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${progressFilter === option ? 'bg-red-600 text-white' : 'bg-black border border-red-900/40 text-gray-300 hover:bg-red-900/20'}`}
                  >
                    {option === 'all' ? 'All Challenges' : option === 'solved' ? 'Solved' : 'Unsolved'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-900/40 bg-zinc-950 p-4 flex flex-col justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-red-400 mb-3">Challenge overview</p>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl bg-black/50 p-4 border border-red-900/30">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Showing</p>
                <p className="text-2xl font-bold text-white">{visibleCount} / {totalCount}</p>
                <p className="text-sm text-gray-400">challenges match the current filters</p>
              </div>
              <div className="rounded-2xl bg-black/50 p-4 border border-red-900/30">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Solved in view</p>
                <p className="text-2xl font-bold text-white">{filteredChallenges.filter((challenge) => solvedChallengeIds.has(String(challenge.id || challenge._id || challenge.uuid || ''))).length}</p>
                <p className="text-sm text-gray-400">ready to revisit or review</p>
              </div>
            </div>
          </div>
        </div>
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
              {filteredChallenges.map((challenge: Challenge) => {
                const challengeKey = String(challenge.id || challenge._id || challenge.uuid || '');
                const isSolved = solvedChallengeIds.has(challengeKey);

                return (
                  <tr key={challengeKey} className={`transition-colors ${isSolved ? 'bg-emerald-900/5 hover:bg-emerald-900/10' : 'hover:bg-red-900/10'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-900/30 rounded-lg text-red-400 mt-1">
                          <Trophy size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-white truncate">{challenge.title}</div>
                            <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isSolved ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                              <CheckCircle2 size={14} />
                              {isSolved ? 'Solved' : 'Unsolved'}
                            </div>
                          </div>
                          {challenge.initialCode && (
                            <div className="text-xs text-red-500 mt-1">Has vulnerable code</div>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {visibleCount === 0 && (
        <div className="text-center py-12 bg-black border border-red-900/40 rounded-xl">
          <Trophy size={48} className="text-red-600 mx-auto mb-4" />
          <p className="text-gray-400">
            {totalCount === 0 ? 'No challenges created yet.' : 'No challenges match the current filters.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChallengeView;
