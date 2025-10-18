
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from '../pages/HomePage';
import GamePage from '../pages/GamePage';
import ChallengePage from '../pages/ChallengePage';
import LeaderboardPage from '../pages/LeaderboardPage';
import ProfilePage from '../pages/ProfilePage';
import PuzzlePage from '../pages/PuzzlePage';
import AboutPage from '../pages/AboutPage';
import SolvePuzzlePage from '../pages/SolvePuzzlePage';
import PlayChallengePage from '../pages/PlayChallengePage';
import PlayLevelPage from '../pages/PlayLevelPage';
import MainLayout from '../layouts/MainLayout';

export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/game/level/:levelId" element={<PlayLevelPage />} />
          <Route path="/puzzles" element={<PuzzlePage />} />
          <Route path="/puzzles/:puzzleId" element={<SolvePuzzlePage />} />
          <Route path="/challenges" element={<ChallengePage />} />
          <Route path="/challenges/:challengeId" element={<PlayChallengePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
