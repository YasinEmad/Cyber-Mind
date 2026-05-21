import React, { useState, useRef, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import SolvePuzzleLeft from '@/components/SolvePuzzleLeft';
import SolvePuzzleRight from '@/components/SolvePuzzleRight';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { selectUser } from '@/redux/slices/userSlice';
import { fetchPuzzleById } from '@/redux/slices/puzzleSlice';
import { setUser } from '@/redux/slices/userSlice';
import axios from '@/api/axios';
import { getPointsForLevel } from '@/lib/points';

const SolvePuzzlePage: React.FC = () => {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { puzzle, status, error } = useSelector((state: RootState) => state.puzzles);
  const currentUser = useSelector(selectUser);

  const [revealedHintsCount, setRevealedHintsCount] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [awardedPointsAmount, setAwardedPointsAmount] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isHoveringTitle, setIsHoveringTitle] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const [displayedTitle, setDisplayedTitle] = useState('');
  const titleIntervalRef = useRef<number | null>(null);
  const letters = '!<>-_\\/[]{}—=+*^?#_';

  const scrambleTitle = () => {
    if (!puzzle) return;
    let iteration = 0;
    if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);
    setIsHoveringTitle(true);
    titleIntervalRef.current = window.setInterval(() => {
      setDisplayedTitle(
        puzzle.title
          .split('')
          .map((_, index) => {
            if (index < iteration) return puzzle.title[index];
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join('')
      );
      if (iteration >= puzzle.title.length) {
        clearInterval(titleIntervalRef.current!);
        setTimeout(() => setIsHoveringTitle(false), 500);
      }
      iteration += 1 / 3;
    }, 30);
  };

  const [displayedScenario, setDisplayedScenario] = useState('');

  useEffect(() => {
    if (puzzleId) dispatch(fetchPuzzleById(puzzleId));
  }, [dispatch, puzzleId]);

  useEffect(() => {
    if (puzzle) {
      setDisplayedTitle(puzzle.title);
      setDisplayedScenario('');
      setRevealedHintsCount(0);
      setAnswer('');
      setFeedback('idle');
      setStartTime(Date.now());
      setElapsedTime(0);
      scrambleTitle();

      let index = 0;
      const scenarioInterval = setInterval(() => {
        if (index < puzzle.scenario.length) {
          setDisplayedScenario(puzzle.scenario.substring(0, index + 1));
          index++;
        } else {
          clearInterval(scenarioInterval);
        }
      }, 15);

      return () => {
        if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);
        clearInterval(scenarioInterval);
      };
    }
  }, [puzzle]);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (startTime && feedback === 'idle') {
      timer = setInterval(() => setElapsedTime(Date.now() - startTime), 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, feedback]);

  const handleRevealHint = () => {
    if (!puzzle || revealedHintsCount >= puzzle.hints.length) return;
    setRevealedHintsCount((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puzzle || feedback !== 'idle' || answer.trim() === '') return;

    try {
      const response = await axios.post(`/puzzles/${puzzleId}/submit`, {
        answer: answer.trim(),
      });

      if (response.data.correct) {
        setFeedback('correct');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        if (response?.data?.awardedPoints) {
          const serverAmount = typeof response.data.awardedPointsAmount === 'number'
            ? response.data.awardedPointsAmount
            : null;

          let points = serverAmount;
          if (points === null && response.data.user && currentUser && typeof currentUser.profile?.totalScore === 'number') {
            const delta = (response.data.user.profile?.totalScore || 0) - (currentUser.profile.totalScore || 0);
            points = delta > 0 ? delta : getPointsForLevel(Number(puzzle?.level));
          }
          if (points === null) points = getPointsForLevel(puzzle?.level);

          setAwardedPointsAmount(points);
          setTimeout(() => setAwardedPointsAmount(null), 5000);

          if (response?.data?.user) {
            dispatch(setUser(response.data.user));
          } else {
            try {
              const me = await axios.get('/users/me');
              if (me?.data?.data) dispatch(setUser(me.data.data));
            } catch {
              // ignore — profile refresh failed but UI still shows awarded points
            }
          }
        }
        setSubmissionMessage(response?.data?.message || null);
      } else {
        setFeedback('incorrect');
        setSubmissionMessage(response?.data?.message ?? 'Incorrect answer — try again.');
        setTimeout(() => setFeedback('idle'), 2000);
      }
    } catch (err: any) {
      setFeedback('incorrect');
      setSubmissionMessage(err?.response?.data?.message ?? 'Something went wrong. Please try again.');
      setTimeout(() => setFeedback('idle'), 2000);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        handleRevealHint();
      }
      if (e.key === 'Enter' && !e.shiftKey && answer.trim() !== '' && feedback === 'idle') {
        handleSubmit(e as any);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answer, feedback, handleRevealHint, handleSubmit]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${h.toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const visibleHints = puzzle ? puzzle.hints.slice(0, revealedHintsCount) : [];

  // ── Loading ────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full bg-[#0d0d0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={28} className="text-zinc-500 animate-spin" />
          <p className="text-[13px] text-zinc-600 font-mono tracking-widest uppercase">
            Loading puzzle…
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (status === 'failed' || !puzzle) {
    return (
      <div className="min-h-screen w-full bg-[#0d0d0f] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertCircle size={16} className="text-rose-400" />
            </div>
            <span className="text-[14px] font-semibold text-zinc-200">Puzzle not found</span>
          </div>
          <p className="text-[13px] text-zinc-500 leading-relaxed">
            {error || 'This puzzle could not be loaded. It may have been removed or the link is invalid.'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 rounded-xl border border-white/[0.09] text-[13px] font-medium text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 transition-all duration-200"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Main layout ────────────────────────────────────────────────
  return (
    <PageWrapper>
      {/* Base background — no animated blurs or grid patterns */}
      <div className="fixed inset-0 bg-[#0d0d0f] -z-10" />

      {/* Solve flash — very subtle green wash on correct */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none bg-emerald-500/[0.04]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      <div className="relative min-h-screen grid lg:grid-cols-2">
        <SolvePuzzleLeft
          puzzle={puzzle}
          puzzleId={puzzleId}
          displayedTitle={displayedTitle}
          scrambleTitle={scrambleTitle}
          isHoveringTitle={isHoveringTitle}
          setIsHoveringTitle={setIsHoveringTitle}
          displayedScenario={displayedScenario}
          revealedHintsCount={revealedHintsCount}
          feedback={feedback}
          elapsedTime={elapsedTime}
          formatTime={formatTime}
        />

        <SolvePuzzleRight
          puzzle={puzzle}
          answer={answer}
          setAnswer={(v: string) => {
            setAnswer(v);
            if (feedback !== 'idle') setFeedback('idle');
          }}
          feedback={feedback}
          handleSubmit={handleSubmit}
          submissionMessage={submissionMessage}
          awardedPointsAmount={awardedPointsAmount}
          visibleHints={visibleHints}
          revealedHintsCount={revealedHintsCount}
          handleRevealHint={handleRevealHint}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
        />
      </div>
    </PageWrapper>
  );
};

export default SolvePuzzlePage;