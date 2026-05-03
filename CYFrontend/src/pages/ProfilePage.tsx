import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '@/api/axios';
import { clearUser, selectUser, setUser } from '../redux/slices/userSlice';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileHeroSection from '../components/ProfileHeroSection';
import ProfileStatsGrid from '../components/ProfileStatsGrid';
import ProfileActivityTable from '../components/ProfileActivityTable';
import ProfileEditModal from '../components/ProfileEditModal';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(user?.name || '');
  const [formPhoto, setFormPhoto] = useState(user?.photoURL || '');
  const [editLoading, setEditLoading] = useState(false);
  const [solvedPuzzles, setSolvedPuzzles] = useState<any[]>([]);
  const [loadingPuzzles, setLoadingPuzzles] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get('/users/me');
        dispatch(setUser(data.data));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (!user || !Array.isArray(user.solvedPuzzles)) {
      fetchUserData();
    }
  }, [dispatch, user]);

  useEffect(() => {
    const fetchSolvedPuzzles = async () => {
      const solvedIds = Array.isArray(user?.solvedPuzzles) && user.solvedPuzzles.length > 0
        ? user.solvedPuzzles
        : Array.isArray(user?.profile?.solvedPuzzles)
          ? user.profile.solvedPuzzles
          : [];

      if (solvedIds.length === 0) {
        setSolvedPuzzles([]);
        return;
      }

      setLoadingPuzzles(true);
      try {
        const lastSolvedIds = solvedIds.slice(-5).reverse();
        const responses = await Promise.allSettled(
          lastSolvedIds.map((id: number) => axios.get(`/puzzles/${id}`))
        );

        const puzzles = responses
          .filter((result: PromiseSettledResult<any>): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map((result: PromiseFulfilledResult<any>) => result.value.data);

        if (responses.some((result) => result.status === 'rejected')) {
          console.warn('One or more solved puzzle fetches failed, showing available puzzles only.');
        }

        setSolvedPuzzles(puzzles);
      } catch (error) {
        console.error('Failed to fetch solved puzzles:', error);
      } finally {
        setLoadingPuzzles(false);
      }
    };

    fetchSolvedPuzzles();
  }, [user?.solvedPuzzles, user?.profile?.solvedPuzzles]);

  const handleLogout = async () => {
    try {
      await axios.get('/users/logout');
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const { data } = await axios.patch('/users/me', { name: formName, photoURL: formPhoto });
      dispatch(setUser(data.data));
      setIsEditing(false);
    } catch (err: any) {
      console.error('Update failed', err);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black text-neutral-200 flex overflow-hidden font-sans selection:bg-red-500/30">
      <ProfileSidebar user={user} onEdit={() => setIsEditing(true)} onLogout={handleLogout} />

      <main className="flex-1 h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.05),transparent)] relative">
        <div className="p-10 max-w-7xl mx-auto space-y-8">
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProfileHeroSection user={user} />
          </section>

          <ProfileStatsGrid user={user} />

          <ProfileActivityTable solvedPuzzles={solvedPuzzles} loadingPuzzles={loadingPuzzles} />
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
      />
    </div>
  );
};

export default ProfilePage;
