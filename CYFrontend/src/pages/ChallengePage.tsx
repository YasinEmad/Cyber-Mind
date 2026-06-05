import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { Challenge, ChallengeDifficulty } from '@/types';
import ChallengeCard from '@/components/ChallengeCard';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Search, SlidersHorizontal, CheckCircle2, Circle, Layers } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchChallenges } from '@/redux/slices/challengeSlice';
import vulnerabilityAnimation from '@/assets/vulnarability.json';

const motivationalQuotes = [
  "EXCELLENCE IS NOT AN ACT, BUT A HABIT.",
  "PRECISION OVER SPEED. RESULTS OVER EXCUSES.",
  "BELIEVE YOU CAN AND YOU'RE HALFWAY THERE.",
  "STAY FOCUSED. STAY LETHAL.",
  "THE HARDER THE BATTLE, THE SWEETER THE VICTORY."
];

const MotivationalQuote: React.FC = React.memo(() => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % motivationalQuotes.length), 8000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="h-10 flex items-center justify-center border-b border-red-950/40 overflow-hidden">
      <div className="flex items-center gap-6">
        <span className="w-1 h-1 rounded-full bg-red-700 animate-pulse" />
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            className="text-[9px] tracking-[0.28em] font-black text-zinc-600 uppercase"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.7 }}
          >
            {motivationalQuotes[index]}
          </motion.p>
        </AnimatePresence>
        <span className="w-1 h-1 rounded-full bg-red-700 animate-pulse" />
      </div>
    </div>
  );
});

const BackgroundParticle: React.FC<{ delay: number; left: number; top: number; duration: number }> = React.memo(
  ({ delay, left, top, duration }) => (
    <motion.div
      className="absolute w-px h-px bg-red-500/40 rounded-full"
      style={{ left: `${left}%`, top: `${top}%` }}
      animate={{ y: [0, -120], opacity: [0, 0.4, 0] }}
      transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
    />
  )
);

const AnimatedBackground: React.FC = React.memo(() => {
  const particles = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: (i * 1.3) % 10,
      left: (i * 13 + 7) % 100,
      top: (i * 17 + 11) % 100,
      duration: 14 + (i % 5) * 2,
    })),
    []
  );
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.018] bg-[linear-gradient(to_right,#666_1px,transparent_1px),linear-gradient(to_bottom,#666_1px,transparent_1px)] bg-[size:60px_60px]" />
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_0%,black_80%)]" />
      {/* Red glow top-left accent */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-950/20 rounded-full blur-3xl" />
      {particles.map((p) => <BackgroundParticle key={p.id} {...p} />)}
    </div>
  );
});

/* ── Pill Filter Button ── */
const FilterPill: React.FC<{
  active: boolean;
  onClick: () => void;
  dot?: string;
  children: React.ReactNode;
}> = ({ active, onClick, dot, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
      active
        ? 'bg-red-600 text-white border-red-500 shadow-sm shadow-red-950/60'
        : 'bg-black/50 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
    }`}
  >
    {dot && active && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
    {children}
  </button>
);

/* ── Stat Chip ── */
const StatChip: React.FC<{ label: string; value: number | string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${accent ? 'border-emerald-900/40 bg-emerald-950/30' : 'border-red-900/25 bg-red-950/20'}`}>
    <span className={`text-xl font-black tabular-nums ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{label}</span>
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
const ChallengePage: React.FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const storeChallenges = useSelector((state: RootState) => state.challenges.challenges);
  const status = useSelector((state: RootState) => state.challenges.status);
  const currentUser = useSelector((state: RootState) => state.user.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [progressFilter, setProgressFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const solvedChallengeIds = useMemo(() => {
    const ids = currentUser?.profile?.solvedChallenges ?? currentUser?.solvedChallenges ?? [];
    const s = new Set<string>();
    ids.forEach((id) => {
      const n = String(id); s.add(n);
      const num = Number(id);
      if (!Number.isNaN(num)) s.add(String(num));
    });
    return s;
  }, [currentUser]);

  const getChallengeKey = useCallback((ch: any) => String(ch.id ?? ch._id ?? ch.uuid ?? ''), []);
  const isChallengeSolved = useCallback((ch: any) => {
    return [String(ch.id ?? ''), String(ch._id ?? ''), String(ch.uuid ?? '')].filter(Boolean).some((k) => solvedChallengeIds.has(k));
  }, [solvedChallengeIds]);

  type DisplayChallenge = Challenge & { solved: boolean; category?: string; level?: string; challengeKey: string };

  const mapToCard = useCallback((ch: any): DisplayChallenge => {
    const lvl = ch.level || ch.difficulty || 'easy';
    const difficulty = lvl.toLowerCase() === 'medium' ? ChallengeDifficulty.Medium : lvl.toLowerCase() === 'hard' ? ChallengeDifficulty.Hard : ChallengeDifficulty.Easy;
    return { id: ch.id ?? ch._id ?? ch.uuid, _id: ch._id, uuid: ch.uuid, title: ch.title, description: ch.description, difficulty, level: lvl.toLowerCase(), category: ch.category, challengeDetails: ch.challengeDetails, recommendation: ch.recommendation, solved: isChallengeSolved(ch), challengeKey: getChallengeKey(ch) };
  }, [isChallengeSolved, getChallengeKey]);

  useEffect(() => { if (status === 'idle') dispatch(fetchChallenges()); }, [dispatch, status]);

  const mappedChallenges = useMemo(() => storeChallenges.map(mapToCard), [storeChallenges, mapToCard]);

  const filteredChallenges = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return mappedChallenges.filter((c) => {
      const solved = c.solved ?? isChallengeSolved(c);
      if (difficultyFilter !== 'all' && (c.level || '').toLowerCase() !== difficultyFilter) return false;
      if (progressFilter === 'solved' && !solved) return false;
      if (progressFilter === 'unsolved' && solved) return false;
      if (!q) return true;
      return [c.title, c.description, c.challengeDetails, c.recommendation, c.category, c.level].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [mappedChallenges, difficultyFilter, progressFilter, searchTerm, isChallengeSolved]);

  const visibleCount = filteredChallenges.length;
  const totalCount = mappedChallenges.length;
  const solvedCount = mappedChallenges.filter((c) => c.solved).length;

  const difficultyDots: Record<string, string> = { easy: 'bg-emerald-400', medium: 'bg-amber-400', hard: 'bg-red-400' };

  return (
    <PageWrapper>
      <div className="relative min-h-screen pb-24">
        <AnimatedBackground />

        <div className="relative z-10">
          <MotivationalQuote />

          <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-10">

            {/* ── Hero ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 items-center mb-14">
              <div>
                {/* Eyebrow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <span className="w-4 h-px bg-red-700" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700">Security Training</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none"
                >
                  Daily<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600">
                    Challenges
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-zinc-600 mt-4 font-bold tracking-[0.3em] uppercase text-[10px]"
                >
                  System Online // Test your limits
                </motion.p>

                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-2.5 mt-7"
                >
                  <StatChip label="Total" value={totalCount} />
                  <StatChip label="Solved" value={solvedCount} accent />
                  <StatChip label="Remaining" value={totalCount - solvedCount} />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="hidden xl:block"
              >
                <div className="relative w-[300px] h-[260px] overflow-hidden rounded-3xl border border-red-900/20"
                  style={{ background: 'radial-gradient(circle at 50% 50%, rgba(127,29,29,0.08) 0%, transparent 70%)' }}>
                  <Lottie animationData={vulnerabilityAnimation} loop autoplay className="h-full w-full" />
                </div>
              </motion.div>
            </div>

            {/* ── Filter Bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-red-900/20 bg-zinc-950/70 backdrop-blur-sm mb-10 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0303 100%)' }}
            >
              {/* Top accent */}
              <div className="h-px bg-gradient-to-r from-transparent via-red-800/40 to-transparent" />

              <div className="px-5 py-4">
                {/* Search row */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search challenges..."
                      className="w-full bg-black/60 border border-zinc-900 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:border-red-700/60 focus:ring-1 focus:ring-red-700/20 focus:outline-none transition-all"
                    />
                  </div>
                  {/* Mobile toggle */}
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className={`lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${filtersOpen ? 'bg-red-600 text-white border-red-500' : 'bg-black/50 border-zinc-800 text-zinc-500'}`}
                  >
                    <SlidersHorizontal size={13} />
                    Filters
                  </button>
                  {/* Count */}
                  <div className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black/40 border border-zinc-900">
                    <Layers size={12} className="text-zinc-600" />
                    <span className="text-sm font-bold text-white tabular-nums">{visibleCount}</span>
                    <span className="text-xs text-zinc-600">/ {totalCount}</span>
                  </div>
                </div>

                {/* Filter rows — always visible on lg, toggleable on mobile */}
                <AnimatePresence>
                  {(filtersOpen || true) && (
                    <motion.div
                      className={`mt-4 gap-4 ${filtersOpen ? 'flex' : 'hidden lg:flex'} flex-col lg:flex-row lg:items-center lg:justify-between`}
                    >
                      {/* Difficulty */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 mr-1">Difficulty</span>
                        {(['all', 'easy', 'medium', 'hard'] as const).map((opt) => (
                          <FilterPill key={opt} active={difficultyFilter === opt} onClick={() => setDifficultyFilter(opt)} dot={opt !== 'all' ? difficultyDots[opt] : undefined}>
                            {opt === 'all' ? 'All' : opt}
                          </FilterPill>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="hidden lg:block w-px h-5 bg-zinc-900" />

                      {/* Progress */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 mr-1">Progress</span>
                        {(['all', 'solved', 'unsolved'] as const).map((opt) => (
                          <FilterPill key={opt} active={progressFilter === opt} onClick={() => setProgressFilter(opt)}>
                            {opt === 'all' ? (
                              <>All</>
                            ) : opt === 'solved' ? (
                              <><CheckCircle2 size={11} />Solved</>
                            ) : (
                              <><Circle size={11} />Unsolved</>
                            )}
                          </FilterPill>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ── Cards Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.challengeKey}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                  >
                    <ChallengeCard challenge={challenge} index={index} solved={challenge.solved} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── Empty State ── */}
            {visibleCount === 0 && status !== 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-950/30 border border-red-900/30 flex items-center justify-center mb-5">
                  <Search size={24} className="text-red-900" />
                </div>
                <p className="text-zinc-400 font-semibold text-sm">No challenges match your filters</p>
                <p className="text-zinc-700 text-xs mt-1">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => { setSearchTerm(''); setDifficultyFilter('all'); setProgressFilter('all'); }}
                  className="mt-5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}

            {/* ── Loading State ── */}
            {status === 'loading' && (
              <div className="flex justify-center py-24">
                <div className="flex items-center gap-2 text-zinc-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-700 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-red-700 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-red-700 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </PageWrapper>
  );
});

export default ChallengePage;