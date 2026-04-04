import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { fetchPuzzles } from '@/redux/slices/puzzleSlice'
import PageWrapper from '@/components/PageWrapper'
import PuzzleCard from '@/components/PuzzleCard'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Terminal, Cpu, Activity, Filter, SortAsc, Search } from 'lucide-react'

const PuzzlePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { puzzles, status, error } = useSelector((state: RootState) => state.puzzles)
  
  const [filteredPuzzles, setFilteredPuzzles] = useState(puzzles)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard' | 'extreme'>('all')
  const [sortBy, setSortBy] = useState<'level' | 'points' | 'latest'>('level')

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPuzzles())
    }
  }, [status, dispatch])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...puzzles]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(p => {
        const level = p.level || 1
        if (difficultyFilter === 'easy') return level <= 3
        if (difficultyFilter === 'medium') return level > 3 && level <= 6
        if (difficultyFilter === 'hard') return level > 6 && level <= 9
        if (difficultyFilter === 'extreme') return level > 9
        return true
      })
    }

    // Sorting
    if (sortBy === 'level') {
      filtered.sort((a, b) => (a.level || 0) - (b.level || 0))
    } else if (sortBy === 'points') {
      filtered.sort((a, b) => (b.level || 0) - (a.level || 0))
    }

    setFilteredPuzzles(filtered)
  }, [puzzles, searchTerm, difficultyFilter, sortBy])

  // Calculate stats
  const easyCount = puzzles.filter(p => (p.level || 1) <= 3).length
  const mediumCount = puzzles.filter(p => (p.level || 1) > 3 && (p.level || 1) <= 6).length
  const hardCount = puzzles.filter(p => (p.level || 1) > 6 && (p.level || 1) <= 9).length
  const extremeCount = puzzles.filter(p => (p.level || 1) > 9).length

  return (
    <div className="min-h-screen bg-black text-neutral-200 selection:bg-red-500/30 overflow-x-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-900/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <PageWrapper>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          
          {/* Tactical Header */}
          <header className="mb-12 border-l-4 border-red-600 pl-6 space-y-3">
            <div className="flex items-center gap-2 text-red-500 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
              <Activity size={14} />
              <span>Total Available: {puzzles.length}</span>
            </div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
              Neural <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">Puzzles</span>
            </h1>
            <p className="text-neutral-400 font-medium max-w-2xl text-sm">
              Engage the central processor. Solve high-latency logic gates and decrypt neural pathways to earn credits and climb the ranks.
            </p>
          </header>

          {/* Quick Stats */}
          {status === 'succeeded' && puzzles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
            >
              <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
                <div className="text-xs font-bold text-green-400 uppercase tracking-wide">Easy</div>
                <div className="text-2xl font-black text-white mt-2">{easyCount}</div>
              </div>
              <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-xs font-bold text-yellow-400 uppercase tracking-wide">Medium</div>
                <div className="text-2xl font-black text-white mt-2">{mediumCount}</div>
              </div>
              <div className="bg-orange-500/5 border border-orange-500/30 rounded-lg p-4">
                <div className="text-xs font-bold text-orange-400 uppercase tracking-wide">Hard</div>
                <div className="text-2xl font-black text-white mt-2">{hardCount}</div>
              </div>
              <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
                <div className="text-xs font-bold text-red-400 uppercase tracking-wide">Extreme</div>
                <div className="text-2xl font-black text-white mt-2">{extremeCount}</div>
              </div>
            </motion.div>
          )}

          {/* Filter and Search Bar */}
          {status === 'succeeded' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 space-y-4"
            >
              {/* Search Bar */}
              <div className="relative group">
                <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search puzzles by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg pl-12 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Filter size={14} /> Filter
                  </span>
                  {['all', 'easy', 'medium', 'hard', 'extreme'].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setDifficultyFilter(difficulty as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                        difficultyFilter === difficulty
                          ? difficulty === 'all'
                            ? 'bg-red-600 border-red-500 text-white'
                            : difficulty === 'easy'
                            ? 'bg-green-600 border-green-500 text-white'
                            : difficulty === 'medium'
                            ? 'bg-yellow-600 border-yellow-500 text-white'
                            : difficulty === 'hard'
                            ? 'bg-orange-600 border-orange-500 text-white'
                            : 'bg-red-700 border-red-600 text-white'
                          : difficulty === 'all'
                          ? 'bg-transparent border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-400'
                          : difficulty === 'easy'
                          ? 'bg-transparent border-green-500/30 text-green-400/70 hover:border-green-500 hover:text-green-400'
                          : difficulty === 'medium'
                          ? 'bg-transparent border-yellow-500/30 text-yellow-400/70 hover:border-yellow-500 hover:text-yellow-400'
                          : difficulty === 'hard'
                          ? 'bg-transparent border-orange-500/30 text-orange-400/70 hover:border-orange-500 hover:text-orange-400'
                          : 'bg-transparent border-red-500/30 text-red-400/70 hover:border-red-500 hover:text-red-400'
                      }`}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <SortAsc size={14} /> Sort
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-zinc-900 border border-zinc-700 hover:border-red-500/50 focus:border-red-500/60 focus:outline-none transition-all font-mono"
                  >
                    <option value="level">By Level (Low to High)</option>
                    <option value="points">By Points (High to Low)</option>
                  </select>
                </div>
              </div>

              {/* Result count */}
              {searchTerm || difficultyFilter !== 'all' ? (
                <div className="text-xs text-zinc-500">
                  Showing <span className="font-bold text-white">{filteredPuzzles.length}</span> of <span className="font-bold text-white">{puzzles.length}</span> puzzles
                </div>
              ) : null}
            </motion.div>
          )}

          {/* Status Handling */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-neutral-800 border-t-red-600 rounded-full animate-spin" />
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Synchronizing Database...</p>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-red-900/10 border border-red-500/20 p-8 rounded-2xl text-center">
              <Terminal className="mx-auto text-red-500 mb-3" size={40} />
              <p className="text-red-400 font-mono text-sm uppercase">Uplink Error: {error}</p>
            </div>
          )}

          {/* The Grid */}
          {status === 'succeeded' && (
            <>
              {filteredPuzzles.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
                >
                  {filteredPuzzles.map((puzzle, index) => (
                    <Link 
                      to={`/puzzles/${puzzle.id}`} 
                      key={puzzle.id}
                      className="group relative"
                    >
                      {/* Hover Glow Effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-[2rem] opacity-0 group-hover:opacity-40 blur-lg transition duration-500" />
                      
                      <div className="relative h-full bg-black/30 border border-neutral-800 rounded-[2rem] overflow-hidden transition-all duration-300">
                        <PuzzleCard puzzle={puzzle} index={index} />
                      </div>
                    </Link>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 space-y-4"
                >
                  <Search size={48} className="text-zinc-700" />
                  <div className="text-center">
                    <p className="text-zinc-400 font-mono uppercase tracking-wider">No puzzles found</p>
                    <p className="text-xs text-zinc-600 mt-2">Try adjusting your filters or search term</p>
                  </div>
                </motion.div>
              )}

              {/* New Puzzle placeholder if less than 6 puzzles */}
              {filteredPuzzles.length < 6 && filteredPuzzles.length > 0 && (
                <div className="border-2 border-dashed border-neutral-800 rounded-[2rem] flex flex-col items-center justify-center p-12 opacity-30 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                  <Cpu size={40} className="text-neutral-500 mb-4" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em]">New Node Incoming...</p>
                </div>
              )}
            </>
          )}

          {/* Bottom System Metrics */}
          {status === 'succeeded' && (
            <footer className="mt-16 pt-8 border-t border-neutral-900 flex flex-wrap gap-8 items-center justify-center lg:justify-start">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Security Protocol</span>
                <span className="text-[10px] font-mono text-red-600">AES-256 BIT</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Total Challenges</span>
                <span className="text-[10px] font-mono text-orange-500">{puzzles.length}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Live Connection</span>
              </div>
            </footer>
          )}
        </div>
      </PageWrapper>
    </div>
  )
}

export default PuzzlePage