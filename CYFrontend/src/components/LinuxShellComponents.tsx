import React, { useState, useEffect, useRef } from 'react';
import type { WindowState, OSAction } from '../pages/LinuxOS';
import { USERNAME, HOSTNAME, VERSION } from '../pages/LinuxOS';

// ─── BOOT SCREEN ─────────────────────────────────────────────────────────────
export function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const msgs = ['Loading kernel modules...', 'Starting system services...', 'Mounting filesystems...', 'Starting network...', 'Starting desktop environment...', 'Welcome!'];

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        const np = Math.min(p + (Math.random() * 8 + 3), 100);
        if (np >= 100) { clearInterval(t); setTimeout(onDone, 700); }
        return np;
      });
    }, 120);
    const pt = setInterval(() => setPhase(p => Math.min(p + 1, msgs.length - 1)), 700);
    return () => { clearInterval(t); clearInterval(pt); };
  }, [onDone]);

  return (
    <div className="boot-screen fixed inset-0 flex flex-col items-center justify-center" style={{background: 'linear-gradient(135deg, #4b2a39 0%, #2a1627 100%)'}}>
      <div className="flex flex-col items-center gap-8">
        <div className="boot-logo">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="#d4af37" strokeWidth="3"/>
            <circle cx="40" cy="14" r="8" fill="#d4af37"/>
            <circle cx="65" cy="57" r="8" fill="#d4af37"/>
            <circle cx="15" cy="57" r="8" fill="#d4af37"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white text-xl font-light mb-1" style={{fontFamily:'Ubuntu, sans-serif'}}>Ubuntu</p>
          <p className="text-white/50 text-sm">{VERSION}</p>
        </div>
        <div className="w-64">
          <div className="progress-bar">
            <div className="progress-fill" style={{width: progress + '%'}} />
          </div>
        </div>
        <p className="text-white/40 text-xs terminal-font min-h-4">{msgs[phase]}</p>
      </div>
    </div>
  );
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────
export function TopBar({ onAppOpen }: { onAppOpen: (appId: string) => void }) {
  const [time, setTime] = useState(new Date());
  const [showSysMenu, setShowSysMenu] = useState(false);
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (d: Date) => d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <div className="topbar fixed top-0 left-0 right-0 h-10 flex items-center justify-between px-5 z-50 select-none bg-gradient-to-b from-[#4b2a39]/95 to-[#3a1f2d]/80 backdrop-blur-md border-b border-white/5 shadow-lg">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors" onClick={() => onAppOpen('about')}>
          <svg width="16" height="16" viewBox="0 0 80 80" className="opacity-80">
            <circle cx="40" cy="40" r="33" fill="none" stroke="#d4af37" strokeWidth="4"/>
            <circle cx="40" cy="15" r="7" fill="#d4af37"/>
            <circle cx="63" cy="55" r="7" fill="#d4af37"/>
            <circle cx="17" cy="55" r="7" fill="#d4af37"/>
          </svg>
          <span className="text-white/80 text-xs font-medium">Activities</span>
        </div>
        <div className="flex gap-1 text-white/60 text-xs">
          {['Files','Terminal','Browser'].map(a => (
            <button key={a} onClick={() => onAppOpen(a.toLowerCase())}
              className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white/90 transition-colors">
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-white/70 text-xs clock-text">{fmtDate(time)} {fmt(time)}</span>
        <div className="flex items-center gap-2 text-white/60">
          <span title="Network" className="text-sm">📶</span>
          <span title="Sound" className="text-sm">🔊</span>
          <span title="Battery" className="text-sm">🔋</span>
        </div>
        <div className="relative">
          <button onClick={() => setShowSysMenu(s => !s)}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors">
            <span className="text-white/80 text-xs">{USERNAME}</span>
            <span className="text-white/40 text-xs">▾</span>
          </button>
          {showSysMenu && (
            <div className="context-menu absolute right-0 top-full mt-1 py-1 z-50">
              <div className="px-4 py-2 border-b border-white/10 mb-1">
                <p className="text-white text-sm font-medium">{USERNAME}</p>
                <p className="text-white/40 text-xs">{USERNAME}@{HOSTNAME}</p>
              </div>
              {[['⚙️ Settings', 'settings'], ['ℹ️ About', 'about']].map(([l, a]) => (
                <div key={a} className="context-menu-item" onClick={() => { onAppOpen(a); setShowSysMenu(false); }}>{l}</div>
              ))}
              <div className="context-menu-sep"/>
              <div className="context-menu-item text-red-400" onClick={() => window.location.reload()}>⏻ Power Off</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DOCK ─────────────────────────────────────────────────────────────────────
const dockApps = [
  { id: 'files',    label: 'Files',    emoji: '📁' },
  { id: 'terminal', label: 'Terminal', emoji: '💻' },
  { id: 'browser',  label: 'Browser',  emoji: '🌐' },
  { id: 'settings', label: 'Settings', emoji: '⚙️' },
  { id: 'about',    label: 'About',    emoji: 'ℹ️' },
];

export function Dock({ onAppOpen, openApps }: { onAppOpen: (appId: string) => void; openApps: string[] }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex items-end gap-3 px-5 py-3 rounded-full dock-bar bg-gradient-to-br from-[#4b2a39]/40 to-[#3a1f2d]/50 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl transition-shadow duration-300"
      style={{transform:'translateX(-50%)'}}>
      {dockApps.map(app => {
        const isOpen = openApps.includes(app.id);
        return (
          <div key={app.id} className="relative dock-item flex flex-col items-center cursor-pointer group" onClick={() => onAppOpen(app.id)}>
            <div className="absolute -top-10 left-1/2 dock-tooltip opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-[#4b2a39]/95 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold border border-white/10 backdrop-blur-md"
              style={{transform:'translateX(-50%)'}}>
              {app.label}
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-200 ${
              isOpen 
                ? 'bg-gradient-to-br from-[#d4af37]/30 to-[#b8860b]/20 border border-[#d4af37]/40 shadow-lg shadow-[#d4af37]/20' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 group-hover:scale-110'
            }`}>
              {app.emoji}
            </div>
            {isOpen && <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-2 shadow-lg shadow-[#d4af37]/50 animate-pulse" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── WINDOW FRAME ────────────────────────────────────────────────────────────
export function WindowFrame({ win, dispatch, children, isActive }: {
  win: WindowState;
  dispatch: React.Dispatch<OSAction>;
  children: React.ReactNode;
  isActive: boolean;
}) {
  const startRef = useRef<{ mx: number; my: number; wx: number; wy: number } | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (win.entering) {
      const t = setTimeout(() => dispatch({ type: 'CLEAR_ENTERING', id: win.id }), 300);
      return () => clearTimeout(t);
    }
  }, [win.entering, dispatch, win.id]);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    dispatch({ type: 'FOCUS_WINDOW', id: win.id });
    startRef.current = { mx: e.clientX, my: e.clientY, wx: win.x, wy: win.y };
    const onMove = (ev: MouseEvent) => {
      if (!startRef.current) return;
      dispatch({ type: 'MOVE_WINDOW', id: win.id, x: startRef.current.wx + ev.clientX - startRef.current.mx, y: Math.max(36, startRef.current.wy + ev.clientY - startRef.current.my) });
    };
    const onUp = () => { startRef.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => dispatch({ type: 'CLOSE_WINDOW', id: win.id }), 150);
  };

  if (win.minimized) return null;

  return (
    <div className={`fixed rounded-2xl overflow-hidden window-shadow transition-shadow duration-200 ${win.entering ? 'window-entering' : ''} ${leaving ? 'window-leaving' : ''} ${
      isActive ? 'shadow-2xl shadow-[#4b2a39]/50 ring-1 ring-white/20' : 'shadow-xl shadow-[#4b2a39]/30'
    }`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.zIndex }}
      onMouseDown={() => dispatch({ type: 'FOCUS_WINDOW', id: win.id })}>
      {/* Title bar */}
      <div className="window-titlebar h-10 flex items-center px-4 gap-3 cursor-default select-none bg-gradient-to-r from-[#4b2a39] to-[#3a1f2d] border-b border-white/10" onMouseDown={onMouseDown}>
        <div className="no-drag flex items-center gap-2.5">
          <button onClick={handleClose} className="w-4 h-4 rounded-full bg-gradient-to-b from-[#ff6b6b] to-[#ee5a52] hover:from-[#ff8787] hover:to-[#ff6b6b] flex items-center justify-center group transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110">
            <span className="opacity-0 group-hover:opacity-100 text-white text-xs leading-none font-bold">✕</span>
          </button>
          <button onClick={() => dispatch({ type: 'MINIMIZE_WINDOW', id: win.id })} className="w-4 h-4 rounded-full bg-gradient-to-b from-[#ffd93d] to-[#f9ca24] hover:from-[#ffe66d] hover:to-[#ffd93d] flex items-center justify-center group transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110">
            <span className="opacity-0 group-hover:opacity-100 text-gray-800 text-xs leading-none font-bold">−</span>
          </button>
          <button className="w-4 h-4 rounded-full bg-gradient-to-b from-[#52c234] to-[#38ad47] hover:from-[#6fd746] hover:to-[#52c234] flex items-center justify-center group transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110">
            <span className="opacity-0 group-hover:opacity-100 text-white text-xs leading-none font-bold">▢</span>
          </button>
        </div>
        <div className="flex-1 text-center text-white/80 text-sm font-semibold pointer-events-none">{win.title}</div>
        <div className="w-14" />
      </div>
      {/* Content */}
      <div className="overflow-hidden" style={{height: win.h - 36}}>
        {children}
      </div>
    </div>
  );
}
