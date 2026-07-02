import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../../components/PageWrapper';
import FlagSubmissionPanel from '../../components/FlagSubmissionPanel';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronRight, Lightbulb, Play, Loader, AlertCircle, Terminal, Crosshair } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchCTFChallenge } from '../../redux/slices/ctfSlice';
interface LevelData {
  title: string;
  description: string;
  hints?: string[];
}

const Level: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { levelId } = useParams<{ levelId: string }>();
  const challengeId = parseInt(levelId || '1', 10);

  const challenge = useSelector((state: RootState) => state.ctf.selectedChallenge);
  const status = useSelector((state: RootState) => state.ctf.challengeStatus);
  const ctfError = useSelector((state: RootState) => state.ctf.error);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(null);
    dispatch(fetchCTFChallenge(challengeId))
      .unwrap()
      .catch((err: string) => setLocalError(err));
  }, [dispatch, challengeId]);

  const startCtf = () => {
    navigate(`/linux?level=${challengeId}`);
  };

  const handleFlagSuccess = useCallback(() => {
    // Refresh challenge data to show updated completion status
    dispatch(fetchCTFChallenge(challengeId));
  }, [dispatch, challengeId]);

  // Loading State UI
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-[#050505]">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 text-red-500 animate-spin" />
            <p className="font-mono text-neutral-600 animate-pulse uppercase tracking-[0.25em] text-[10px]">
              Initializing Secure Terminal...
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#050505] text-neutral-200 flex flex-col items-center justify-center p-4 lg:p-8 gap-8 relative">
        
        {/* Main Interface Block */}
        <motion.div 
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 bg-black/40 backdrop-blur-xl border border-neutral-900 rounded-xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)] relative group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Tech Corner Brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-950/40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neutral-900 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neutral-900 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-950/40 pointer-events-none" />

          {/* Left Panel: Mission Intelligence Details */}
          <div className="md:col-span-5 bg-neutral-950/90 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-900/60 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-red-500 mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[9px] font-mono font-bold tracking-[0.25em] uppercase">
                  {status === 'failed' ? 'SYSTEM.OFFLINE' : 'AUTH.SESSION.ACTIVE'}
                </span>
              </div>
              
              <span className="text-[10px] font-mono text-neutral-600 block uppercase tracking-wider mb-1">Mission Objective</span>
              <h1 className="text-2xl font-bold font-mono tracking-wide text-white mb-4">
                &gt; {challenge?.title}
              </h1>

              <p className="text-neutral-400 text-xs leading-relaxed mb-6 font-sans">
                {challenge?.description}
              </p>

              {(ctfError || localError) && (
                <div className="flex items-center gap-2 bg-red-950/10 border border-red-900/30 p-2.5 rounded font-mono text-[9px] text-red-400 tracking-wide">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                  <span>ERROR: {localError || ctfError}</span>
                </div>
              )}
            </div>

            <button
              onClick={startCtf}
              className="mt-8 flex items-center justify-between w-full px-5 py-3.5 bg-neutral-950 border border-red-900/40 hover:border-red-500/60 text-neutral-200 font-mono text-xs font-bold tracking-widest rounded-lg transition-all duration-300 group shadow-lg shadow-black"
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-3.5 h-3.5 text-red-500 fill-red-500/20 group-hover:fill-red-500/40 transition-all" />
                LAUNCH ENVIRONMENT
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Right Panel: Hints Matrix */}
          <div className="md:col-span-7 bg-neutral-950/20 flex flex-col relative z-10">
            
            {/* Header Area */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900 bg-neutral-950/50">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[9px] font-mono text-neutral-500 tracking-[0.25em] uppercase">Intelligence Sub-vectors</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[9px] text-neutral-600">
                <Crosshair className="w-3 h-3" />
                <span>SEC_DATA_STREAM</span>
              </div>
            </div>
            
            {/* Intel Grid Section */}
            <div className="flex-grow p-6 relative overflow-y-auto max-h-[360px] md:max-h-none">
               {/* Faint Grid Mesh Texture Overlay */}
               <div 
                 className="absolute inset-0 opacity-[0.02] pointer-events-none bg-repeat"
                 style={{
                   backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
                   backgroundSize: '14px 14px'
                 }}
               />

               <div className="grid grid-cols-1 gap-3 relative z-10">
                 {challenge?.hints && challenge.hints.length > 0 ? (
                   challenge.hints.map((hint: string, index: number) => (
                     <div key={index} className="p-4 border border-neutral-900/70 bg-black/40 rounded-lg backdrop-blur-sm transition-all duration-300 hover:border-neutral-800">
                       <p className="text-[9px] font-mono text-red-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                         <Terminal className="w-3 h-3 text-red-900" />
                         DECRYPTION_VECTOR_0{index + 1}
                       </p>
                       <p className="text-neutral-400 text-xs font-mono leading-relaxed pl-4 border-l border-neutral-900">
                         "{hint}"
                       </p>
                     </div>
                   ))
                 ) : (
                   <div className="text-neutral-600 font-mono text-xs italic p-4 text-center border border-dashed border-neutral-900 rounded-lg">
                     No immediate operational intelligence available for this sector.
                   </div>
                 )}
               </div>
            </div>
          </div>
        </motion.div>

        {/* Flag Submission Section Component Integration */}
        <FlagSubmissionPanel 
          level={challengeId}
          onSuccess={handleFlagSuccess}
        />
      </div>
    </PageWrapper>
  );
};

export default Level;