import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '@/api/axios';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { Edit, LogOut, BarChart, CheckSquare, Trophy, Puzzle, Flag } from 'lucide-react'; // <-- Import new icons
import { clearUser, selectUser, setUser } from '../redux/slices/userSlice';

// StatCard component remains the same
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-slate-800 p-4 rounded-lg flex items-center">
    <div className={`p-3 rounded-md mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const pastChallenges = [
    { title: 'Speed Runner', completed: true },
    { title: 'Puzzle Master', completed: true },
    { title: 'Quick Reflexes', completed: false },
  ];

  const handleLogout = async () => {
    try {
      // In a real app, you might want to call an API to invalidate the session
      await axios.get('/users/logout');
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(user?.name || '');
  const [formPhoto, setFormPhoto] = useState(user?.photoURL || '');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const openEditor = () => {
    setFormName(user?.name || '');
    setFormPhoto(user?.photoURL || '');
    setEditError('');
    setIsEditing(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const { data } = await axios.patch('/users/me', { name: formName, photoURL: formPhoto });
      // Update redux and local state
      dispatch(setUser(data.data));
      setIsEditing(false);
    } catch (err: any) {
      setEditError(err?.response?.data?.message || err.message || 'Failed updating profile');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div 
          className="lg:col-span-1 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 text-center flex flex-col items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative mb-4">
            <img src={user?.photoURL || "https://picsum.photos/id/239/200/200"} alt="User Avatar" className="w-32 h-32 rounded-full mx-auto border-4 border-cyan-400 shadow-lg"/>
            <div className="absolute bottom-1 right-1 bg-slate-900 rounded-full p-1">
              <Edit onClick={openEditor} className="w-5 h-5 text-slate-300 hover:text-cyan-400 cursor-pointer"/>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">{user?.name || 'User'}</h1>
          <p className="text-slate-400">{user?.email}</p>
          <div className="mt-6 flex space-x-2">
            <button onClick={openEditor} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
              <Edit className="w-4 h-4 mr-2"/> Edit
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 bg-slate-700 hover:bg-red-500/80 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 mr-2"/> Logout
            </button>
          </div>
        </motion.div>

        {/* Edit modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-11/12 max-w-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Edit Profile</h3>
              {editError && <div className="mb-3 text-sm text-red-600">{editError}</div>}
              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Display name</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full p-2 rounded-md border dark:bg-slate-700" />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
                  <input value={formPhoto} onChange={(e) => setFormPhoto(e.target.value)} className="w-full p-2 rounded-md border dark:bg-slate-700" />
                  {formPhoto && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Preview</p>
                      <img src={formPhoto} alt="preview" className="w-24 h-24 rounded-full border" />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                  <button type="submit" disabled={editLoading} className="px-4 py-2 bg-cyan-600 text-white rounded-md disabled:opacity-60">{editLoading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats and Challenges */}
        <motion.div 
          className="lg:col-span-2 space-y-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Stats Grid - Now using a 2x3 grid (6 total cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Original Cards */}
            <StatCard icon={<Trophy className="w-6 h-6 text-white"/>} label="Total Score" value={user?.profile?.totalScore?.toLocaleString() || '0'} color="bg-cyan-500/80" />
            <StatCard icon={<CheckSquare className="w-6 h-6 text-white"/>} label="Challenges Done" value={user?.profile?.challengesDone?.toString() || '0'} color="bg-green-500/80" />
            <StatCard icon={<BarChart className="w-6 h-6 text-white"/>} label="Global Rank" value={user?.profile?.globalRank ? `#${user.profile.globalRank}` : 'N/A'} color="bg-purple-500/80" />
            
            {/* --- 2. New Stat Cards --- */}
            <StatCard icon={<Puzzle className="w-6 h-6 text-white"/>} label="Puzzles Done" value={user?.profile?.puzzlesDone?.toString() || '0'} color="bg-indigo-500/80" />
            <StatCard icon={<Flag className="w-6 h-6 text-white"/>} label="Flags Captured" value={user?.profile?.flags?.toString() || '0'} color="bg-red-500/80" />
            {/* The 6th card slot is available, or you can adjust the grid size if you only want 5 */}
            <div className="hidden md:block"></div> {/* Helper to keep the grid even if only 5 items */}
          </div>
          
          {/* Past Challenges */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <ul className="space-y-3">
              {pastChallenges.map((challenge, index) => (
                <li key={index} className={`p-3 rounded-lg flex justify-between items-center transition-colors ${challenge.completed ? 'bg-slate-700/50' : 'bg-slate-700/20'}`}>
                  <span className="font-medium text-slate-200">{challenge.title}</span>
                  {challenge.completed ? (
                    <span className="text-xs font-bold text-green-400 flex items-center"><CheckSquare className="w-4 h-4 mr-1"/> Completed</span>
                  ) : (
                    <span className="text-xs font-bold text-yellow-400">In Progress</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;