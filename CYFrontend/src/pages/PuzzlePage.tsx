import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { fetchPuzzles } from '@/redux/slices/puzzleSlice'
import PageWrapper from '@/components/PageWrapper'
import PuzzleCard from '@/components/PuzzleCard'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Terminal, Cpu, Zap, Activity } from 'lucide-react'

const PuzzlePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { puzzles, status, error } = useSelector((state: RootState) => state.puzzles)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPuzzles())
    }
  }, [status, dispatch])

  return (
    <div className="min-h-screen bg-black text-neutral-200 selection:bg-red-500/30 overflow-x-hidden">
      {/* 1. Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-900/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <PageWrapper>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          
          {/* 2. Tactical Header */}
          <header className="mb-16 border-l-4 border-red-600 pl-6 space-y-2">
            <div className="flex items-center gap-2 text-red-500 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
              <Activity size={14} />
              <span>Puzzles Available: {puzzles.length}</span>
            </div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
              Neural <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Puzzles</span>
            </h1>
            <p className="text-neutral-500 font-medium max-w-xl">
              Engage the central processor. Solve high-latency logic gates and decrypt neural pathways to earn credits.
            </p>
          </header>

          {/* 3. Status Handling */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-neutral-800 border-t-red-600 rounded-full animate-spin" />
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Synchronizing Database...</p>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-2xl text-center">
              <Terminal className="mx-auto text-red-500 mb-2" size={32} />
              <p className="text-red-400 font-mono text-sm uppercase">Uplink Error: {error}</p>
            </div>
          )}

          {/* 4. The Grid */}
          {status === 'succeeded' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {puzzles.map((puzzle, index) => (
                <Link 
                  to={`/puzzles/${puzzle._id}`} 
                  key={puzzle._id}
                  className="group relative"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-[2rem] opacity-0 group-hover:opacity-30 blur-md transition duration-500" />
                  
                  <div className="relative h-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-[2rem] overflow-hidden transition-all duration-300">
                    <PuzzleCard puzzle={puzzle} index={index} />
                    
                    {/* Corner Tag Decor */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/5 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap size={16} className="text-orange-500" />
                    </div>
                  </div>
                </Link>
              ))}

              {/* Empty Node Placeholder */}
              <div className="border-2 border-dashed border-neutral-800 rounded-[2rem] flex flex-col items-center justify-center p-12 opacity-30 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                 <Cpu size={40} className="text-neutral-500 mb-4" />
                 <p className="text-[10px] font-mono uppercase tracking-[0.2em]">New Node Incoming...</p>
              </div>
            </motion.div>
          )}

          {/* 5. Bottom System Metrics */}
          <footer className="mt-20 pt-8 border-t border-neutral-900 flex flex-wrap gap-8 items-center justify-center lg:justify-start">
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Security Protocol</span>
               <span className="text-[10px] font-mono text-red-600">AES-256 BIT</span>
             </div>
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Sub-Sector</span>
               <span className="text-[10px] font-mono text-orange-500">7A-NORTH</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
               <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Live Connection</span>
             </div>
          </footer>
        </div>
      </PageWrapper>
    </div>
  )
}

export default PuzzlePage