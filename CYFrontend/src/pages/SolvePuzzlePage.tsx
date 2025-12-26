import React, { useState, useRef, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import SolvePuzzleLeft from '@/components/SolvePuzzleLeft';
import SolvePuzzleRight from '@/components/SolvePuzzleRight';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Cpu } from 'lucide-react';
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
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);
  const [isHoveringTitle, setIsHoveringTitle] = useState(false);

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

  const handleRevealHint = () => {
    if (!puzzle || revealedHintsCount >= puzzle.hints.length) return;
    setRevealedHintsCount((prevCount) => prevCount + 1);
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
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#dc2626', '#ffffff'];
        const newParticles = Array.from({ length: 60 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)]
        }));
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 3000);

          if (response?.data?.awardedPoints) {
            // Debug: log server response + puzzle level to help investigate unexpected defaults
            // (Remove these logs in production)
            console.debug('solve: puzzle.level:', puzzle?.level, 'typeof:', typeof puzzle?.level);
            console.debug('solve: server response awardedPointsAmount:', response.data.awardedPointsAmount);

            // Prefer the server-provided awardedPointsAmount when available
            // If server didn't include the amount but returned an updated user
            // compute the delta from the previous total score so the UI shows
            // exactly what was written to the DB.
            console.debug('solve: server awardedPointsInfo:', response.data.awardedPointsInfo);
            const serverAmount = typeof response.data.awardedPointsAmount === 'number'
              ? response.data.awardedPointsAmount
              : null;

            let points = serverAmount;
            if (points === null && response.data.user && currentUser && typeof currentUser.profile?.totalScore === 'number') {
              const prev = currentUser.profile.totalScore || 0;
              const now = response.data.user.profile?.totalScore || 0;
              const delta = now - prev;
              // coerce the fallback level value explicitly before using it
              const fallbackLevel = typeof puzzle?.level !== 'undefined' && puzzle?.level !== null ? Number(puzzle.level) : undefined;
              console.debug('solve: computed delta:', delta, 'fallbackLevel:', fallbackLevel);
              points = delta > 0 ? delta : getPointsForLevel(fallbackLevel as any);
            }

            // Final fallback
            if (points === null) points = getPointsForLevel(puzzle?.level);

            console.debug('solve: final points to display:', points);
            setAwardedPointsAmount(points);
          // clear the display after a short interval
          setTimeout(() => setAwardedPointsAmount(null), 5000);
          // If the response included the updated user object, use it immediately
          // (avoids potential race where a subsequent GET /users/me may return
          // stale data immediately after the update). If not present, fall back
          // to fetching the current user from the server.
          if (response?.data?.user) {
            dispatch(setUser(response.data.user));
          } else {
            try {
              const me = await axios.get('/users/me');
              if (me?.data?.data) dispatch(setUser(me.data.data));
            } catch (err) {
              // ignore — profile refresh failed but UI still shows awarded points
            }
          }
        }
        setSubmissionMessage(response?.data?.message || null);
      } else {
        setFeedback('incorrect');
        setSubmissionMessage(response?.data?.message ?? 'ACCESS_DENIED: WRONG_KEY');
        setTimeout(() => setFeedback('idle'), 2000);
      }
    } catch (err: any) {
      setFeedback('incorrect');
      setSubmissionMessage(err?.response?.data?.message ?? 'CONNECTION_ERROR');
      setTimeout(() => setFeedback('idle'), 2000);
    }
  };

  const visibleHints = puzzle ? puzzle.hints.slice(0, revealedHintsCount) : [];

  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
            <Cpu className="absolute inset-0 m-auto text-red-600 animate-pulse" size={24} />
          </div>
          <div className="text-center space-y-2">
            <div className="text-red-600 animate-pulse tracking-[0.3em] text-sm uppercase">Initializing Node...</div>
            <div className="text-gray-600 text-xs tracking-widest">Decrypting puzzle data</div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed' || !puzzle) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center font-mono relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/5 via-transparent to-transparent"></div>
        <div className="relative z-10 p-8 border border-red-600/50 bg-gradient-to-b from-red-900/10 to-black backdrop-blur-sm text-red-400 shadow-[0_0_40px_rgba(220,38,38,0.3)] max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="text-red-500" size={24} />
            <span className="text-sm font-bold tracking-[0.2em] uppercase">CRITICAL_FAILURE</span>
          </div>
          <div className="border-t border-red-900/50 pt-6">
            <div className="text-xs text-gray-500 mb-2">ERROR_CODE:</div>
            <div className="text-red-500 font-mono text-sm break-all">{error || 'PUZZLE_NOT_FOUND'}</div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-8 w-full py-3 bg-red-900/30 border border-red-700/50 text-red-400 text-xs font-bold tracking-widest uppercase hover:bg-red-900/50 transition-all duration-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      {/* Enhanced Background Atmosphere */}
      <div className="fixed inset-0 bg-black pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-red-900/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-orange-900/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, #dc2626 1px, transparent 1px),
              linear-gradient(to bottom, #dc2626 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Celebration Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed w-1.5 h-1.5 rounded-full z-50 pointer-events-none"
            style={{ backgroundColor: p.color, color: p.color }}
            initial={{ 
              left: '50%', 
              top: '50%', 
              scale: 0,
              filter: 'blur(0px)'
            }}
            animate={{ 
              left: `${p.x}%`, 
              top: `${p.y}%`, 
              scale: [0, 1.5, 0], 
              opacity: [1, 1, 0],
              filter: ['blur(0px)', 'blur(4px)', 'blur(0px)']
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        ))}
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
        />

        <SolvePuzzleRight
          puzzle={puzzle}
          answer={answer}
          setAnswer={(v: string) => { setAnswer(v); if (feedback !== 'idle') setFeedback('idle'); }}
          feedback={feedback}
          handleSubmit={handleSubmit}
          submissionMessage={submissionMessage}
          awardedPointsAmount={awardedPointsAmount}
          visibleHints={visibleHints}
          revealedHintsCount={revealedHintsCount}
          handleRevealHint={handleRevealHint}
        />
      </div>
    </PageWrapper>
  );
};

export default SolvePuzzlePage;