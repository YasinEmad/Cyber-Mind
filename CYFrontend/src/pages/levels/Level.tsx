import React from 'react';
import PageWrapper from '../../components/PageWrapper';
import { motion } from 'framer-motion';
import { Terminal, ShieldCheck, ChevronRight, Activity, Lightbulb, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ctfInfo from '../../utils/ctfinfo';

const Level: React.FC = () => {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();
  const levelNumber = parseInt(levelId || '1', 10);
  const levelData = ctfInfo.levels.find((level: { level: number }) => level.level === levelNumber);

  const startCtf = () => {
    navigate(`/linux?level=${levelNumber}`);
  };

  return (
    <PageWrapper>
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-4 lg:p-8">
        <motion.div 
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-px bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Left Sidebar: Mission Briefing */}
          <div className="md:col-span-4 bg-zinc-950 p-6 flex flex-col justify-between border-r border-zinc-800">
            <div>
              <div className="flex items-center gap-2 text-red-500 mb-6">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase">Auth.Session.Active</span>
              </div>
              
              <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
                {levelData?.name || 'Vulnerability Research'}
              </h1>
              
              <div className="h-1 w-12 bg-red-600 mb-6" />

              <p className="text-zinc-400 text-sm leading-relaxed mb-4 font-medium">
                {levelData?.description || 'Analyze the provided environment to identify entry points. Locate the hidden flag within the root directory.'}
              </p>

              <div className="mb-6 p-3 bg-zinc-900/50 border border-zinc-800 rounded">
                <p className="text-[10px] font-mono text-red-500 mb-1 uppercase tracking-tighter">Objective</p>
                <p className="text-zinc-400 text-sm">{levelData?.target || 'Find the hidden flag'}</p>
              </div>
            </div>

            <button
              onClick={startCtf}
              className="mt-10 flex items-center justify-between w-full px-5 py-4 bg-red-700 hover:bg-red-600 text-white text-sm font-bold rounded-sm transition-all group shadow-[0_4px_20px_-5px_rgba(220,38,38,0.4)]"
            >
              <div className="flex items-center gap-3">
                <Play className="w-4 h-4 fill-current" />
                START CTF
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Panel: Hints & Guidance */}
          <div className="md:col-span-8 bg-zinc-900 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950/50">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] font-mono text-zinc-400 tracking-[0.3em] uppercase">Hints</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-2 h-2 rounded-full bg-red-900/50" />
              </div>
            </div>
            
            {/* Hint Content Area */}
            <div className="flex-grow p-8 bg-black/20 relative">
               <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
               
               <div className="grid grid-cols-1 gap-4 relative z-10">
                 {levelData?.hints ? levelData.hints.map((hint: string, index: number) => (
                   <div key={index} className={`p-4 border border-zinc-800 bg-zinc-900/50 rounded ${index > 0 ? 'opacity-50' : ''}`}>
                     <p className={`text-[11px] font-mono mb-1 uppercase tracking-tighter ${index === 0 ? 'text-red-500' : 'text-zinc-600'}`}>
                       Hint #{String(index + 1).padStart(2, '0')}
                     </p>
                     <p className={`text-sm italic ${index === 0 ? 'text-zinc-400' : 'text-zinc-700 underline decoration-dotted'}`}>
                       {index === 0 ? `"${hint}"` : 'Locked until mission progress updates...'}
                     </p>
                   </div>
                 )) : (
                   <>
                     <div className="p-4 border border-zinc-800 bg-zinc-900/50 rounded">
                       <p className="text-[11px] font-mono text-red-500 mb-1 uppercase tracking-tighter">Hint #01</p>
                       <p className="text-zinc-400 text-sm italic">"The flag is often hidden in plain sight. Check the basic directory listing."</p>
                     </div>
                     
                     <div className="p-4 border border-zinc-800 bg-zinc-900/50 rounded opacity-50">
                       <p className="text-[11px] font-mono text-zinc-600 mb-1 uppercase tracking-tighter">Hint #02</p>
                       <p className="text-zinc-700 text-sm italic underline decoration-dotted">Locked until mission progress updates...</p>
                     </div>
                   </>
                 )}
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Level;