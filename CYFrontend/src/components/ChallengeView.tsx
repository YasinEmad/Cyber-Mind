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
  CheckCircle2,
  ShieldAlert,
  Layers,
  Zap,
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
        if (normalizedLevel !== difficultyFilter) return false;
      }
      if (!normalizedSearch) return true;
      const searchableText = [
        challenge.title,
        challenge.description,
        challenge.challengeDetails,
        challenge.recommendation,
        challenge.level,
        (challenge as any).difficulty?.toString(),
        (challenge as any).category,
      ].filter(Boolean).join(' ').toLowerCase();
      return searchableText.includes(normalizedSearch);
    });
  }, [challenges, difficultyFilter, searchTerm, solvedChallengeIds]);

  const visibleCount = filteredChallenges.length;
  const totalCount = challenges.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const challengeData = { ...formData, challengeDetails: formData.challengeDetails || formData.description };
    try {
      await dispatch(createChallenge(challengeData)).unwrap();
      toast.success('Challenge created successfully!');
      setIsAddModalOpen(false);
      setFormData({ title: '', description: '', level: 'easy', initialCode: '', challengeDetails: '', recommendation: '' });
      dispatch(fetchChallenges());
    } catch (error) {
      toast.error('Failed to create challenge');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', level: 'easy', initialCode: '', challengeDetails: '', recommendation: '' });
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
    const challengeData = { ...formData, challengeDetails: formData.challengeDetails || formData.description };
    const challengeId = editingChallenge.uuid || editingChallenge.id?.toString() || editingChallenge._id;
    if (!challengeId) { toast.error('Invalid challenge ID'); return; }
    try {
      await dispatch(updateChallenge({ id: challengeId, challengeData })).unwrap();
      toast.success('Challenge updated successfully!');
      setIsEditModalOpen(false);
      setEditingChallenge(null);
      resetForm();
      dispatch(fetchChallenges());
    } catch (error) {
      toast.error('Failed to update challenge');
    }
  };

  const handleDeleteClick = (challenge: Challenge) => setDeleteConfirm({ isOpen: true, challenge });

  const confirmDelete = async () => {
    if (!deleteConfirm.challenge) return;
    const deleteId = deleteConfirm.challenge.uuid || deleteConfirm.challenge.id?.toString() || deleteConfirm.challenge._id;
    if (!deleteId) { toast.error('Invalid challenge ID'); return; }
    try {
      await dispatch(deleteChallenge(deleteId)).unwrap();
      toast.success('Challenge deleted successfully!');
      setDeleteConfirm({ isOpen: false, challenge: null });
      dispatch(fetchChallenges());
    } catch (error) {
      toast.error('Failed to delete challenge');
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
    }
  };

  const inputClasses = "w-full bg-zinc-950 border border-red-900/40 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all text-sm";

  const levelConfig = {
    easy:   { label: 'Easy',   bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/50', dot: 'bg-emerald-400' },
    medium: { label: 'Medium', bg: 'bg-amber-950/60',   text: 'text-amber-400',   border: 'border-amber-800/50',   dot: 'bg-amber-400'   },
    hard:   { label: 'Hard',   bg: 'bg-red-950/60',     text: 'text-red-400',     border: 'border-red-800/50',     dot: 'bg-red-400'     },
  };

  const FormModal = ({
    isOpen, title, onClose, onSubmit
  }: { isOpen: boolean; title: string; onClose: () => void; onSubmit: (e: React.FormEvent) => void }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div
          className="relative bg-zinc-950 border border-red-900/30 rounded-2xl shadow-2xl shadow-red-950/40 max-w-4xl w-full max-h-[92vh] overflow-y-auto"
          style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0505 100%)' }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent rounded-t-2xl" />

          {/* Header */}
          <div className="sticky top-0 z-10 flex justify-between items-center px-7 py-5 border-b border-red-900/20 bg-zinc-950/95 backdrop-blur-sm rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-950/60 border border-red-800/40 rounded-lg">
                <Trophy size={18} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-white hover:bg-red-950/40 border border-transparent hover:border-red-900/40 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-7 space-y-5">
            {/* Title + Level */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className={inputClasses} required placeholder="e.g. SQL Injection Basics" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Difficulty *</label>
                <select value={formData.level} onChange={(e) => handleInputChange('level', e.target.value as 'easy' | 'medium' | 'hard')} className={inputClasses}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description *</label>
              <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} className={inputClasses} required placeholder="Brief overview of what this challenge covers..." />
            </div>

            {/* Challenge Details */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <FileText size={13} className="text-red-500" />
                Challenge Details
              </label>
              <textarea value={formData.challengeDetails} onChange={(e) => handleInputChange('challengeDetails', e.target.value)} rows={4} className={inputClasses} placeholder="Detailed instructions for the challenge..." />
            </div>

            {/* Initial Code */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <Code size={13} className="text-red-500" />
                Initial Code
                <span className="normal-case font-normal text-zinc-600 ml-1">(Vulnerable snippet)</span>
              </label>
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-900/80 border-b border-red-900/20 rounded-t-lg flex items-center px-3 gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="ml-2 text-[10px] text-zinc-600 font-mono">vulnerable.code</span>
                </div>
                <textarea
                  value={formData.initialCode}
                  onChange={(e) => handleInputChange('initialCode', e.target.value)}
                  rows={8}
                  className={inputClasses + " font-mono text-sm pt-10 rounded-lg"}
                  placeholder="// Paste the vulnerable code here..."
                />
              </div>
            </div>

            {/* Recommendation */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <Target size={13} className="text-red-500" />
                Recommendation
              </label>
              <textarea value={formData.recommendation} onChange={(e) => handleInputChange('recommendation', e.target.value)} rows={3} className={inputClasses} placeholder="Security recommendations and hints..." />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-5 border-t border-red-900/20">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-red-900/40 rounded-lg hover:bg-red-950/20 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-950/50"
              >
                <Save size={14} />
                {status === 'loading' ? (title.includes('Edit') ? 'Updating...' : 'Creating...') : (title.includes('Edit') ? 'Update Challenge' : 'Create Challenge')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={14} className="text-red-600" />
            <span className="text-xs font-semibold uppercase tracking-widest text-red-700">Admin Panel</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Challenge Management</h2>
          <p className="text-zinc-500 mt-1 text-sm">Design, configure, and manage competitive security challenges.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="group bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-950/50 text-sm"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
            New Challenge
          </button>
          <button
            onClick={handleDeleteAllChallenges}
            className="bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800/50 py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all text-sm"
            title="Remove every challenge level"
          >
            <Trash2 size={16} />
            Remove All
          </button>
        </div>
      </div>

      {/* Stats + Search Row */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">

        {/* Search & Filters */}
        <div className="rounded-2xl border border-red-900/25 bg-zinc-950/80 p-5 space-y-4" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0404 100%)' }}>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, category, keywords…"
              className="w-full bg-black/60 border border-red-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:border-red-600/60 focus:ring-1 focus:ring-red-600/20 focus:outline-none transition-all"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2.5">Difficulty Filter</p>
            <div className="flex flex-wrap gap-2">
              {(['all', 'easy', 'medium', 'hard'] as const).map((option) => {
                const active = difficultyFilter === option;
                const cfg = option !== 'all' ? levelConfig[option] : null;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDifficultyFilter(option)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      active
                        ? option === 'all'
                          ? 'bg-red-600 text-white border-red-500'
                          : `${cfg!.bg} ${cfg!.text} ${cfg!.border}`
                        : 'bg-black/40 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {cfg && active && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                    {option === 'all' ? 'All Levels' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="rounded-2xl border border-red-900/25 bg-zinc-950/80 p-5 flex flex-col gap-3" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0404 100%)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Overview</p>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="rounded-xl bg-black/50 border border-red-900/20 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={13} className="text-red-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Showing</span>
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">{visibleCount}<span className="text-base font-normal text-zinc-600">/{totalCount}</span></p>
              <p className="text-[11px] text-zinc-600 mt-0.5">match filters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-red-900/25 overflow-hidden shadow-2xl shadow-red-950/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-red-900/20" style={{ background: 'linear-gradient(90deg, #0d0404 0%, #0a0a0a 100%)' }}>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Challenge</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Level</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Points</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Description</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/10 bg-zinc-950">
              {filteredChallenges.map((challenge: Challenge) => {
                const challengeKey = String(challenge.id || challenge._id || challenge.uuid || '');
                const isSolved = solvedChallengeIds.has(challengeKey);
                const level = (challenge.level?.toLowerCase() as 'easy' | 'medium' | 'hard') || 'easy';
                const cfg = levelConfig[level] || levelConfig.easy;

                return (
                  <tr
                    key={challengeKey}
                    className={`group transition-colors ${isSolved ? 'hover:bg-emerald-950/10' : 'hover:bg-red-950/10'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${isSolved ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-500' : 'bg-red-950/40 border-red-900/30 text-red-500'}`}>
                          <Trophy size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white truncate">{challenge.title}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${isSolved ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' : 'bg-red-950/60 text-red-500 border-red-900/40'}`}>
                              <CheckCircle2 size={10} />
                              {isSolved ? 'Solved' : 'Unsolved'}
                            </span>
                          </div>
                          {challenge.initialCode && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Code size={10} className="text-zinc-600" />
                              <span className="text-[10px] text-zinc-600">Has vulnerable code</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Zap size={12} className="text-red-600" />
                        <span className="text-sm font-semibold text-zinc-300">{challenge.points}</span>
                        <span className="text-xs text-zinc-600">XP</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-500 max-w-xs truncate group-hover:text-zinc-400 transition-colors">{challenge.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(challenge)}
                          className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/30 rounded-lg transition-all"
                          title="Edit Challenge"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(challenge)}
                          className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/30 rounded-lg transition-all"
                          title="Delete Challenge"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {visibleCount === 0 && (
        <div className="text-center py-16 rounded-2xl border border-red-900/20 bg-zinc-950/60">
          <div className="inline-flex p-4 bg-red-950/30 border border-red-900/30 rounded-2xl mb-4">
            <Trophy size={32} className="text-red-800" />
          </div>
          <p className="text-zinc-400 font-medium">
            {totalCount === 0 ? 'No challenges created yet.' : 'No challenges match the current filters.'}
          </p>
          {totalCount === 0 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all"
            >
              <Plus size={14} />
              Create your first challenge
            </button>
          )}
        </div>
      )}

      {/* Add Modal */}
      <FormModal
        isOpen={isAddModalOpen}
        title="Add New Challenge"
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        onSubmit={handleSubmit}
      />

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        title="Edit Challenge"
        onClose={() => { setIsEditModalOpen(false); setEditingChallenge(null); resetForm(); }}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative bg-zinc-950 border border-red-900/40 rounded-2xl shadow-2xl shadow-red-950/40 max-w-md w-full overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-700/70 to-transparent" />
            <div className="p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-red-950/60 border border-red-800/40 rounded-xl">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Challenge</h3>
                  <p className="text-xs text-zinc-600">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                You're about to permanently delete{' '}
                <span className="font-semibold text-white">"{deleteConfirm.challenge?.title}"</span>.
                All associated data will be lost.
              </p>
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, challenge: null })}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl hover:bg-zinc-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={status === 'loading'}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Deleting…' : 'Delete Challenge'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeView;