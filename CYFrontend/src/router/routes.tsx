
import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AuthCheckRoute from './AuthCheckRoute';
import LoadingScreen from '../components/LoadingScreen';

const AboutPage        = lazy(() => import('../pages/AboutPage'));
const LinuxPage        = lazy(() => import('../pages/LinuxPage'));
const GamePage         = lazy(() => import('../pages/CtfPage'));
const CTFPlanPage      = lazy(() => import('../pages/CTFPlanPage'));
const Level            = lazy(() => import('../pages/levels/Level'));
const PuzzlePage       = lazy(() => import('../pages/PuzzlePage'));
const SolvePuzzlePage  = lazy(() => import('../pages/SolvePuzzlePage'));
const ChallengePage    = lazy(() => import('../pages/ChallengePage'));
const PlayChallengePage = lazy(() => import('../pages/PlayChallengePage'));
const ProfilePage      = lazy(() => import('../pages/ProfilePage'));
const AdmainDashboard  = lazy(() => import('../pages/AdmainDashboard'));

export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen />}>
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
      </Suspense>
    </AnimatePresence>
  );
}
