
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
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AuthCheckRoute from './AuthCheckRoute';
import AdmainDashboard from '../pages/AdmainDashboard';
import Level1 from '../pages/levels/Level1';
import Level2 from '../pages/levels/Level2';
import Level3 from '../pages/levels/Level3';
import Level4 from '../pages/levels/Level4';
import Level5 from '../pages/levels/Level5';
import Level6 from '../pages/levels/Level6';
import Level7 from '../pages/levels/Level7';
import Level8 from '../pages/levels/Level8';
import Level9 from '../pages/levels/Level9';
import Level10 from '../pages/levels/Level10';
import Level11 from '../pages/levels/Level11';
import Level12 from '../pages/levels/Level12';
import Level13 from '../pages/levels/Level13';
import Level14 from '../pages/levels/Level14';
import Level15 from '../pages/levels/Level15';
import Level16 from '../pages/levels/Level16';
import Level17 from '../pages/levels/Level17';
import Level18 from '../pages/levels/Level18';
import Level19 from '../pages/levels/Level19';
import Level20 from '../pages/levels/Level20';
import Level21 from '../pages/levels/Level21';
import Level22 from '../pages/levels/Level22';
import Level23 from '../pages/levels/Level23';
import Level24 from '../pages/levels/Level24';
import Level25 from '../pages/levels/Level25';
import Level26 from '../pages/levels/Level26';
import Level27 from '../pages/levels/Level27';
import Level28 from '../pages/levels/Level28';
import Level29 from '../pages/levels/Level29';
import Level30 from '../pages/levels/Level30';
import Level31 from '../pages/levels/Level31';
import Level32 from '../pages/levels/Level32';
import Level33 from '../pages/levels/Level33';
import Level34 from '../pages/levels/Level34';
import Level35 from '../pages/levels/Level35';

export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/ctf-plan" element={<CTFPlanPage />} />
          <Route path="/game/level/1" element={<Level1 />} />
          <Route path="/game/level/2" element={<Level2 />} />
          <Route path="/game/level/3" element={<Level3 />} />
          <Route path="/game/level/4" element={<Level4 />} />
          <Route path="/game/level/5" element={<Level5 />} />
          <Route path="/game/level/6" element={<Level6 />} />
          <Route path="/game/level/7" element={<Level7 />} />
          <Route path="/game/level/8" element={<Level8 />} />
          <Route path="/game/level/9" element={<Level9 />} />
          <Route path="/game/level/10" element={<Level10 />} />
          <Route path="/game/level/11" element={<Level11 />} />
          <Route path="/game/level/12" element={<Level12 />} />
          <Route path="/game/level/13" element={<Level13 />} />
          <Route path="/game/level/14" element={<Level14 />} />
          <Route path="/game/level/15" element={<Level15 />} />
          <Route path="/game/level/16" element={<Level16 />} />
          <Route path="/game/level/17" element={<Level17 />} />
          <Route path="/game/level/18" element={<Level18 />} />
          <Route path="/game/level/19" element={<Level19 />} />
          <Route path="/game/level/20" element={<Level20 />} />
          <Route path="/game/level/21" element={<Level21 />} />
          <Route path="/game/level/22" element={<Level22 />} />
          <Route path="/game/level/23" element={<Level23 />} />
          <Route path="/game/level/24" element={<Level24 />} />
          <Route path="/game/level/25" element={<Level25 />} />
          <Route path="/game/level/26" element={<Level26 />} />
          <Route path="/game/level/27" element={<Level27 />} />
          <Route path="/game/level/28" element={<Level28 />} />
          <Route path="/game/level/29" element={<Level29 />} />
          <Route path="/game/level/30" element={<Level30 />} />
          <Route path="/game/level/31" element={<Level31 />} />
          <Route path="/game/level/32" element={<Level32 />} />
          <Route path="/game/level/33" element={<Level33 />} />
          <Route path="/game/level/34" element={<Level34 />} />
          <Route path="/game/level/35" element={<Level35 />} />
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
