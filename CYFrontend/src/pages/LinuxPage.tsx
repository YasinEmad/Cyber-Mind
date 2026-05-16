import { useState, useEffect, useReducer, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import './LinuxPage.css';

// ─── Imports from separated modules ──────────────────────────────────────────
import type {
  WindowState,
} from './LinuxOS';
import {
  initialFS,
  challenges,
  appMeta,
  osReducer,
  getCTFFS,
  OSContext,
  loadChallengesFromBackend,
  getChallenges,
} from './LinuxOS';
import {
  BootScreen,
  TopBar,
  Dock,
  WindowFrame,
  TerminalApp,
  FilesApp,
  SettingsApp,
  AboutApp,
  BrowserApp,
} from '../components/LinuxComponents';

// ─── Context Provider ───────────────────────────────────────────────────────
// OSContext is now exported from LinuxOS.ts

// ─── Main Desktop Component ──────────────────────────────────────────────────
function LinuxDesktop() {
  // URL parameters for CTF mode
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Support both normal query and hash-based routing (e.g. #/linux?level=1)
  let levelParam = searchParams.get('level');
  if (!levelParam) {
    try {
      const m = window.location.hash.match(/[?&]level=(\d+)/);
      if (m) levelParam = m[1];
    } catch (e) {}
  }
  const levelNumber = Number(levelParam);
  const isCTFMode = Number.isInteger(levelNumber) && levelNumber > 0;
  const [currentLevel, setCurrentLevel] = useState<number>(isCTFMode ? levelNumber : 0);

  // CTF state
  const [challengeDescription, setChallengeDescription] = useState('');
  const [hint, setHint] = useState('');
  const [ctfNotification, setCtfNotification] = useState<string | null>(null);
  const [ctfExpanded, setCtfExpanded] = useState(true);
  const [loadedChallenges, setLoadedChallenges] = useState<Record<number, any> | null>(null);

  // OS state
  const [booted, setBooted] = useState(false);
  const [fs, setFs] = useState(isCTFMode ? getCTFFS(levelNumber, loadedChallenges || undefined) : initialFS);
  const [state, dispatch] = useReducer(osReducer, {
    windows: [],
    zCounter: 1,
    activeWindow: null,
    notification: undefined,
  });

  // Load CTF challenges from backend on mount
  useEffect(() => {
    const initializeChallenges = async () => {
      try {
        await loadChallengesFromBackend();
        const loaded = getChallenges();
        setLoadedChallenges(loaded);
        // If CTF mode is active, reload the challenge data from backend
        if (isCTFMode && levelNumber) {
          if (loaded[levelNumber]) {
            setChallengeDescription(loaded[levelNumber].description);
            setHint(loaded[levelNumber].hint);
          }
        }
      } catch (error) {
        console.error('Failed to load challenges from backend:', error);
        // Will fall back to local challenges
      }
    };
    initializeChallenges();
  }, []);

  // Listen for CTF updates (created/updated/deleted) and reload challenges
  useEffect(() => {
    const onCTFUpdated = async () => {
      try {
        await loadChallengesFromBackend();
        const loaded = getChallenges();
        setLoadedChallenges(loaded);
        if (isCTFMode && levelNumber) {
          if (loaded[levelNumber]) {
            setChallengeDescription(loaded[levelNumber].description);
            setHint(loaded[levelNumber].hint);
            setFs(getCTFFS(levelNumber, loaded || undefined));
          }
        }
      } catch (error) {
        console.error('Failed to refresh challenges after CTF update:', error);
      }
    };

    window.addEventListener('ctf:updated', onCTFUpdated as EventListener);
    return () => window.removeEventListener('ctf:updated', onCTFUpdated as EventListener);
  }, [isCTFMode, levelNumber]);

  // Load CTF challenge data when CTF mode is enabled
  useEffect(() => {
    if (isCTFMode) {
      setCurrentLevel(levelNumber);
      setFs(getCTFFS(levelNumber, loadedChallenges || undefined));
      const availableChallenges = loadedChallenges || challenges;
      if (availableChallenges[levelNumber]) {
        setChallengeDescription(availableChallenges[levelNumber].description);
        setHint(availableChallenges[levelNumber].hint);
      }
    } else {
      setCurrentLevel(0);
      setFs(initialFS);
    }
  }, [isCTFMode, levelNumber, loadedChallenges]);

  // Handle app open requests
  const onAppOpen = useCallback((appId: string, forceNew = false) => {
    const title = appMeta[appId]?.title || appId;
    dispatch({ type: 'OPEN_WINDOW', appId, title, forceNew });
  }, []);

  // Render appropriate app content based on window appId
  const renderApp = (win: WindowState) => {
    switch (win.appId) {
      case 'terminal': return <TerminalApp />;
      case 'files': return <FilesApp />;
      case 'settings': return <SettingsApp />;
      case 'about': return <AboutApp />;
      case 'browser': return <BrowserApp />;
      default: return <div className="p-4 text-white">App not found</div>;
    }
  };

  // Show boot screen until OS is ready
  if (!booted) return <BootScreen onDone={() => setBooted(true)} />;

  // Main desktop UI
  return (
    <OSContext.Provider value={{ fs, setFs, isCTFMode, currentLevel, setCtfNotification, challenges: loadedChallenges || undefined }}>
      <div className="linux-page h-screen overflow-hidden relative wallpaper" style={{fontFamily:'Ubuntu, sans-serif'}}>
        {/* System UI Components */}
        <TopBar onAppOpen={onAppOpen} />
        <Dock onAppOpen={onAppOpen} openApps={state.windows.map(w => w.appId)} />

        {/* CTF Challenge Info Panel */}
        {isCTFMode && (
          <div className="fixed top-12 right-4 z-50 w-96">
            <div className="bg-[#2a1f2d] border border-[#ff8c42]/40 rounded-lg shadow-xl backdrop-blur-sm overflow-hidden">
              {/* Header */}
              <button 
                onClick={() => setCtfExpanded(!ctfExpanded)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#3a2d3a] transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#ff8c42] rounded-full" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[#ff8c42]/70 uppercase tracking-wide">Challenge</p>
                    <h3 className="text-lg font-semibold text-white">Level {currentLevel}</h3>
                  </div>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-[#ff8c42]/60 transition-transform duration-300 ${ctfExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Divider */}
              <div className="h-px bg-[#ff8c42]/20" />

              {/* Content */}
              {ctfExpanded && (
                <div className="px-6 py-4 space-y-4">
                  {/* Objective */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#ff8c42] uppercase tracking-wide">Objective</p>
                    <p className="text-sm text-white/80 leading-relaxed text-right bg-[#3a1f2d] rounded px-3 py-2 border border-[#ff8c42]/20" dir="rtl">
                      {challengeDescription}
                    </p>
                  </div>

                  {/* Hint */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#ff8c42] uppercase tracking-wide">Hint</p>
                    <p className="text-sm text-white/70 text-right px-3" dir="rtl">
                      {hint}
                    </p>
                  </div>

                  {/* Success Notification */}
                  {ctfNotification && (
                    <div className="bg-emerald-500/10 border border-emerald-500/40 rounded px-3 py-2 space-y-1">
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Flag Captured</p>
                      <p className="text-sm text-emerald-100/80">
                        {ctfNotification}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={() => navigate(`/game/level/${currentLevel}`)}
                    className="w-full mt-2 bg-[#ff8c42] hover:bg-[#ff9500] text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                  >
                    lab finished - submit flag
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Windows */}
        {state.windows.map(win => (
          <WindowFrame key={win.id} win={win} dispatch={dispatch} isActive={state.activeWindow === win.id}>
            {renderApp(win)}
          </WindowFrame>
        ))}
      </div>
    </OSContext.Provider>
  );
}

export default LinuxDesktop;