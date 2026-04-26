
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from '../pages/HomePage';
import GamePage from '../pages/CtfPage';
import CTFPlanPage from '../pages/CTFPlanPage';
import ChallengePage from '../pages/ChallengePage';
import ProfilePage from '../pages/ProfilePage';
import PuzzlePage from '../pages/PuzzlePage';
import AboutPage from '../pages/AboutPage';
import SolvePuzzlePage from '../pages/SolvePuzzlePage';
import PlayChallengePage from '../pages/PlayChallengePage';
import LinuxPage from '../pages/LinuxPage';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AuthCheckRoute from './AuthCheckRoute';
import AdmainDashboard from '../pages/AdmainDashboard';
import Level from '../pages/levels/Level';

export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/linux" element={<LinuxPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/ctf-plan" element={<CTFPlanPage />} />
          <Route path="/game/level/:levelId" element={<Level />} />
          <Route path="/puzzles" element={<PuzzlePage />} />
          <Route path="/puzzles/:puzzleId" element={
            <AuthCheckRoute>
              <SolvePuzzlePage />
            </AuthCheckRoute>
          } />
          <Route path="/challenges" element={<ChallengePage />} />
          <Route path="/challenges/:challengeId" element={
            <AuthCheckRoute>
              <PlayChallengePage />
            </AuthCheckRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdmainDashboard />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
