import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '@/api/axios';
import { clearUser, selectUser, setUser } from '../redux/slices/userSlice';
import { syncUserProgressFromProfile } from '../redux/slices/ctfSlice';

// UI Components
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileHeroSection from '../components/ProfileHeroSection';
import ProfileStatsGrid from '../components/ProfileStatsGrid';
import ProfileActivityTable from '../components/ProfileActivityTable';
import ProfileEditModal from '../components/ProfileEditModal';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  // --- State ---
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(user?.name || '');
  const [formPhoto, setFormPhoto] = useState(user?.photoURL || '');
  const [editLoading, setEditLoading] = useState(false);
  const [solvedPuzzles, setSolvedPuzzles] = useState<any[]>([]);
  const [loadingPuzzles, setLoadingPuzzles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  // --- Data Mapping ---
  // Per your UserSlice: solvedCTFLevels exists inside user.profile
  const solvedCTFLevels = user?.profile?.solvedCTFLevels || user?.solvedCTFLevels || [];
  const ctfSolvedCount = solvedCTFLevels.length;

  // --- Effects ---

  // 1. Sync User Data from Backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get('/users/me');
        // This expects the API to return the full User object (including profile)
        dispatch(setUser(data.data));
        dispatch(syncUserProgressFromProfile({
          solvedCTFLevels: data.data.profile?.solvedCTFLevels,
          solvedChallenges: data.data.solvedChallenges,
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Fetch once on mount to populate profile data.
    fetchUserData();
  }, [dispatch]);

  // 2. Fetch Detailed Data for the Puzzles Table
  useEffect(() => {
    const fetchSolvedPuzzles = async () => {
      // Check both the root and the profile for puzzle IDs
      const solvedIds = user?.solvedPuzzles || user?.profile?.solvedPuzzles || [];

      if (solvedIds.length === 0) {
        setSolvedPuzzles([]);
        return;
      }

      setLoadingPuzzles(true);
      try {
        // Fetch last 5 solved puzzles for the activity log
        const lastSolvedIds = [...solvedIds].slice(-5).reverse();
        const responses = await Promise.allSettled(
          lastSolvedIds.map((id) => axios.get(`/puzzles/${id}`))
        );

        const puzzles = responses
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map((result) => result.value.data);

        setSolvedPuzzles(puzzles);
      } catch (error) {
        console.error('Failed to fetch solved puzzles details:', error);
      } finally {
        setLoadingPuzzles(false);
      }
    };

    fetchSolvedPuzzles();
  }, [user?.solvedPuzzles, user?.profile?.solvedPuzzles]);

  // --- Handlers ---

  const handleLogout = async () => {
    try {
      await axios.get('/users/logout');
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleAvatarUpload = (file: File) => {
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, and WebP files are allowed!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('File size must be less than 5MB!');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewAvatar(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      // First update name and photoURL if changed
      if (formName !== user?.name || formPhoto !== user?.photoURL) {
        const { data } = await axios.patch('/users/me', { 
          name: formName, 
          photoURL: formPhoto 
        });
        dispatch(setUser(data.data));
      }

      // Then upload avatar if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        await axios.post('/users/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        // Refresh user data to get new avatar
        const { data } = await axios.get('/users/me');
        dispatch(setUser(data.data));
      }

      dispatch(syncUserProgressFromProfile({
        solvedCTFLevels: user?.profile?.solvedCTFLevels || [],
        solvedChallenges: user?.solvedChallenges || [],
      }));
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewAvatar(null);
    } catch (err) {
      console.error('Update profile failed', err);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black text-neutral-200 flex overflow-hidden font-sans selection:bg-red-500/30">
      <ProfileSidebar 
        user={user} 
        onEdit={() => setIsEditing(true)} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 h-full overflow-y-auto bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative p-8 max-w-7xl mx-auto space-y-8">
          
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProfileHeroSection user={user} />
          </section>

          <ProfileStatsGrid user={user} />

          {/* Activity Table handles both CTF and Puzzles */}
          <ProfileActivityTable 
            solvedPuzzles={solvedPuzzles} 
            loadingPuzzles={loadingPuzzles} 
            solvedCTFLevels={solvedCTFLevels} 
            ctfCount={ctfSolvedCount}
          />
        </div>
      </main>

      <ProfileEditModal
        isEditing={isEditing}
        formName={formName}
        formPhoto={formPhoto}
        editLoading={editLoading}
        onClose={() => setIsEditing(false)}
        onFormNameChange={setFormName}
        onFormPhotoChange={setFormPhoto}
        onSubmit={submitEdit}
        onAvatarUpload={handleAvatarUpload}
        previewAvatar={previewAvatar}
      />
    </div>
  );
};

export default ProfilePage;