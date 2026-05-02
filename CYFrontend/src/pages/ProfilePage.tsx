import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '@/api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit, LogOut, CheckSquare, Trophy, 
  Puzzle, Flag, Shield, Zap, Activity,
  Target
} from 'lucide-react';
import { clearUser, selectUser, setUser } from '../redux/slices/userSlice';

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
    } catch (error) { console.error('Logout failed', error); }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const { data } = await axios.patch('/users/me', { name: formName, photoURL: formPhoto });
      dispatch(setUser(data.data));
      setIsEditing(false);
    } catch (err: any) { console.error("Update failed"); } 
    finally { setEditLoading(false); }
  };

  return (
    <div className="h-screen w-full bg-black text-neutral-200 flex overflow-hidden font-sans selection:bg-red-500/30">
      
      {/* --- 1. FIXED SIDEBAR --- */}
      <aside className="w-80 h-full bg-neutral-900/50 border-r border-neutral-800 flex flex-col items-center py-10 px-6 relative z-20">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-600 via-orange-500 to-transparent opacity-50" />
        
        {/* Brand/Logo Area */}
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <Zap className="text-white" size={20} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase">Cyber-Mind</span>
        </div>

        {/* Profile Identity */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
             <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-500" />
             <img 
               src={user?.photoURL || "https://picsum.photos/id/239/200/200"} 
               alt="User" 
               className="relative w-28 h-28 rounded-full border-2 border-neutral-800 object-cover"
             />
             <div className="absolute bottom-0 right-0 bg-red-600 p-2 rounded-full border-4 border-neutral-900 group-hover:scale-110 transition-transform">
               <Edit size={12} className="text-white" />
             </div>
          </div>
          <h2 className="mt-4 text-xl font-bold text-white tracking-tight">{user?.name || 'Agent'}</h2>
          <span className="text-neutral-500 text-xs font-mono uppercase tracking-[0.2em] mt-1">Lvl 4 Operator</span>
        </div>

        {/* Navigation Mockup */}
        <nav className="w-full space-y-2 flex-1">
          <NavItem icon={<Activity size={18} />} label="Overview" active />
        </nav>

        {/* Logout at bottom */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all group"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">Terminate</span>
        </button>
      </aside>

      {/* --- 2. MAIN CONTENT AREA --- */}
      <main className="flex-1 h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.05),transparent)] relative">

        {/* Bento Grid Content */}
        <div className="p-10 max-w-7xl mx-auto space-y-8">
          
          {/* Hero Row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 p-8 rounded-[2.5rem] flex flex-col justify-between min-h-[250px] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <Shield size={120} className="text-red-600" />
               </div>
               <div>
                 <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Welcome back, <br/><span className="text-red-600">{user?.name}</span></h1>
                 <p className="text-neutral-500 max-w-sm">Are you ready for more challenges ? </p>
               </div>
               <div className="flex gap-4">
                 <button className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-bold shadow-lg shadow-red-900/40 transition-all">Start Challenge</button>
               </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 rounded-full border-4 border-red-900/30 border-t-red-600 flex items-center justify-center mb-4">
                 <span className="text-2xl font-black text-white">42</span>
               </div>
               <p className="text-sm font-bold text-white uppercase tracking-widest">Global Rank</p>
               <p className="text-xs text-neutral-500 mt-1">Top 2% of Operators</p>
            </div>
          </section>

          {/* Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatBox icon={<Trophy />} label="Puzzles Points" value={user?.profile?.totalScore?.toLocaleString() || '0'} color="text-red-500" />
            <StatBox icon={<CheckSquare />} label="Completed" value={user?.profile?.challengesDone?.toString() || '0'} color="text-orange-500" />
            <StatBox icon={<Puzzle />} label="Puzzles" value={user?.profile?.puzzlesDone?.toString() || '0'} color="text-neutral-200" />
            <StatBox icon={<Flag />} label="Captures" value={user?.profile?.flags?.toString() || '0'} color="text-red-600" />
          </section>

          {/* Activity Table */}
          <section className="bg-neutral-900/30 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
             <div className="p-8 border-b border-neutral-800 flex justify-between items-center">
               <h3 className="font-black uppercase tracking-widest text-sm">Deployment Logs</h3>
               <button className="text-xs text-red-500 font-bold hover:underline">Download Report</button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="text-[10px] font-black uppercase text-neutral-500 border-b border-neutral-800">
                     <th className="px-8 py-4">Puzzle</th>
                     <th className="px-8 py-4">Level</th>
                     <th className="px-8 py-4">Category</th>
                     <th className="px-8 py-4">Tags</th>
                     <th className="px-8 py-4">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-neutral-800/50">
                   {loadingPuzzles ? (
                     <tr>
                       <td colSpan={5} className="px-8 py-8 text-center text-neutral-500">
                         <div className="flex items-center justify-center gap-2">
                           <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                           Loading deployment data...
                         </div>
                       </td>
                     </tr>
                   ) : solvedPuzzles.length > 0 ? (
                     solvedPuzzles.map((puzzle, index) => (
                       <PuzzleActivityRow 
                         key={puzzle.id} 
                         puzzle={puzzle} 
                         isRecent={index === 0}
                       />
                     ))
                   ) : (
                     <tr>
                       <td colSpan={5} className="px-8 py-8 text-center text-neutral-600">
                         <div className="flex flex-col items-center gap-2">
                           <Target size={24} className="text-neutral-700" />
                           <span className="text-sm">No puzzles solved yet</span>
                           <span className="text-xs">Start your first challenge!</span>
                         </div>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </section>
        </div>
      </main>

      {/* --- 3. EDIT MODAL (REMAINING LOGIC) --- */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-[2rem] p-10 shadow-2xl relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-red-600 rounded-b-full shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Override Identity</h2>
              <form onSubmit={submitEdit} className="space-y-6">
                <InputGroup label="Alias" value={formName} onChange={setFormName} />
                <InputGroup label="Avatar URL" value={formPhoto} onChange={setFormPhoto} />
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 text-neutral-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors">Abort</button>
                  <button type="submit" className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 uppercase text-xs tracking-widest">
                    {editLoading ? 'Syncing...' : 'Update'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const NavItem = ({ icon, label, active = false }: any) => (
  <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200'}`}>
    {icon}
    <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
  </div>
);

const StatBox = ({ icon, label, value, color }: any) => (
  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-[2rem] hover:border-neutral-700 transition-all">
    <div className={`mb-4 ${color}`}>{React.cloneElement(icon, { size: 24 })}</div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{label}</p>
    <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
  </div>
);

const PuzzleActivityRow = ({ puzzle, isRecent }: { puzzle: any; isRecent: boolean }) => (
  <tr className={`hover:bg-white/[0.02] transition-colors ${isRecent ? 'bg-red-500/5 border-l-4 border-l-red-500' : ''}`}>
    <td className="px-8 py-5">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRecent ? 'bg-red-500/20' : 'bg-neutral-800'}`}>
          <Puzzle size={16} className={isRecent ? 'text-red-400' : 'text-neutral-400'} />
        </div>
        <div>
          <p className="font-bold text-sm text-neutral-200">{puzzle.title}</p>
          {isRecent && <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Latest</span>}
        </div>
      </div>
    </td>
    <td className="px-8 py-5">
      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded ${
        puzzle.level === 1 ? 'bg-green-500/20 text-green-400' :
        puzzle.level === 2 ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        Level {puzzle.level}
      </span>
    </td>
    <td className="px-8 py-5">
      <span className="text-xs font-mono text-neutral-400 bg-neutral-800/50 px-2 py-1 rounded">
        {puzzle.category}
      </span>
    </td>
    <td className="px-8 py-5">
      <div className="flex flex-wrap gap-1">
        {puzzle.tags?.slice(0, 3).map((tag: string, idx: number) => (
          <span key={idx} className="text-[9px] text-red-400 bg-red-950/30 border border-red-900/30 px-1.5 py-0.5 rounded font-mono uppercase">
            {tag}
          </span>
        ))}
        {puzzle.tags?.length > 3 && (
          <span className="text-[9px] text-neutral-500">+{puzzle.tags.length - 3}</span>
        )}
      </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Solved</span>
      </div>
    </td>
  </tr>
);

const InputGroup = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">{label}</label>
    <input 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white focus:border-red-600 outline-none transition-all"
    />
  </div>
);

export default ProfilePage;