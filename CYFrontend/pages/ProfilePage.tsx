
import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';
import { Edit, LogOut, BarChart, CheckSquare, Trophy } from 'lucide-react';

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
  const pastChallenges = [
    { title: 'Speed Runner', completed: true },
    { title: 'Puzzle Master', completed: true },
    { title: 'Quick Reflexes', completed: false },
  ];

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
            <img src="https://picsum.photos/id/239/200/200" alt="User Avatar" className="w-32 h-32 rounded-full mx-auto border-4 border-cyan-400 shadow-lg"/>
            <div className="absolute bottom-1 right-1 bg-slate-900 rounded-full p-1">
                <Edit className="w-5 h-5 text-slate-300 hover:text-cyan-400 cursor-pointer"/>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Tom Cook</h1>
          <p className="text-slate-400">tom@example.com</p>
          <div className="mt-6 flex space-x-2">
            <button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
              <Edit className="w-4 h-4 mr-2"/> Edit
            </button>
            <button className="flex-1 bg-slate-700 hover:bg-red-500/80 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
              <LogOut className="w-4 h-4 mr-2"/> Logout
            </button>
          </div>
        </motion.div>

        {/* Stats and Challenges */}
        <motion.div 
          className="lg:col-span-2 space-y-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={<Trophy className="w-6 h-6 text-white"/>} label="Total Score" value="12,450" color="bg-cyan-500/80" />
            <StatCard icon={<CheckSquare className="w-6 h-6 text-white"/>} label="Challenges Done" value="42" color="bg-green-500/80" />
            <StatCard icon={<BarChart className="w-6 h-6 text-white"/>} label="Global Rank" value="#1,234" color="bg-purple-500/80" />
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
