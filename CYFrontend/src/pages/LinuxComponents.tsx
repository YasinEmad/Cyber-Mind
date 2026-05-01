import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  WindowState, 
  OSAction, 
  OSContextType, 
  TerminalLine, 
  USERNAME, 
  HOSTNAME, 
  VERSION,
  OSContext,
  createTerminalEngine,
} from './LinuxOS';

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

// ─── TERMINAL APP ─────────────────────────────────────────────────────────────
export function TerminalApp() {
  const context = useContext(OSContext) as OSContextType;
  if (!context) throw new Error('OSContext not found');
  const { fs, setFs, isCTFMode, currentLevel, setCtfNotification, challenges } = context;
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', text: `Ubuntu ${VERSION} (simulated)` },
    { type: 'output', text: `Welcome to Ubuntu! Type 'help' for available commands.` },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const engineRef = useRef(createTerminalEngine('/home/user', challenges));
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fsRef = useRef(fs);
  fsRef.current = fs;

  // Recreate terminal engine when challenges change so commands from templates are available
  useEffect(() => {
    try {
      const prevCwd = engineRef.current?.getCwd ? engineRef.current.getCwd() : '/home/user';
      engineRef.current = createTerminalEngine(prevCwd, challenges);
    } catch (e) {
      // ignore
    }
  }, [challenges]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const run = async (cmd: string) => {
    const engine = engineRef.current;
    console.log('Terminal run:', { cmd, isCTFMode, currentLevel });
    const result = await engine.execute(cmd, fsRef.current, setFs, isCTFMode, currentLevel, setCtfNotification);
    if (result.some((r: TerminalLine) => r.type === 'clear')) { setLines([]); }
    else { setLines(prev => [...prev, ...result]); }
    setInput('');
    setHistIdx(-1);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { run(input); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const h = engineRef.current.getHistory();
      const ni = Math.min(histIdx + 1, h.length - 1);
      setHistIdx(ni);
      setInput(h[h.length - 1 - ni] || '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const ni = Math.max(histIdx - 1, -1);
      setHistIdx(ni);
      setInput(ni === -1 ? '' : engineRef.current.getHistory().slice(-(ni+1))[0] || '');
    }
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setLines([]); }
    if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); setLines(p => [...p, { type: 'prompt', text: getPrompt() + input + '^C' }]); setInput(''); }
  };

  const getPrompt = () => {
    const cwd = engineRef.current.getCwd().replace('/home/user', '~');
    return `${USERNAME}@${HOSTNAME}:${cwd}$ `;
  };

  return (
    <div className="terminal-bg h-full flex flex-col terminal-font text-sm" onClick={() => inputRef.current?.focus()}>
      {isCTFMode && (
        <div className="absolute top-12 right-6 z-50 px-3 py-1 rounded bg-[#d4af37]/10 text-[#d4af37] text-xs font-semibold">CTF mode • Level {currentLevel}</div>
      )}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {lines.map((l, i) => (
          <div key={i} className={`leading-5 whitespace-pre-wrap break-all ${l.type==='error' ? 'text-red-400' : l.type==='prompt' ? 'text-green-400' : 'text-gray-200'}`}>
            {l.type==='ls-output'
              ? <div className="flex flex-wrap gap-x-4">
                  {l.items?.map((it,j) => <span key={j} className={it.isDir ? 'text-blue-400 font-bold' : 'text-gray-200'}>{it.name}</span>)}
                </div>
              : l.text}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-green-400">{getPrompt()}</span>
          <span className="text-gray-200">{input}</span>
          <span className="cursor-blink" />
        </div>
        <div ref={bottomRef} />
      </div>
      <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
        className="opacity-0 absolute w-0 h-0 pointer-events-none" autoFocus />
    </div>
  );
}

// ─── FILES APP ───────────────────────────────────────────────────────────────
export function FilesApp() {
  const context = useContext(OSContext);
  if (!context) throw new Error('OSContext not found');
  const { fs } = context;
  const [cwd, setCwd] = useState('/home/user');
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [history, setHistory] = useState<string[]>(['/home/user']);
  const [histIdx, setHistIdx] = useState(0);

  const node = fs[cwd];
  const children = node?.children || [];

  const navigate = (path: string) => {
    const newHist = [...history.slice(0, histIdx + 1), path];
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
    setCwd(path);
    setSelected(null);
  };

  const goBack = () => { if (histIdx > 0) { const p = histIdx - 1; setHistIdx(p); setCwd(history[p]); } };
  const goFwd = () => { if (histIdx < history.length - 1) { const p = histIdx + 1; setHistIdx(p); setCwd(history[p]); } };
  const goUp = () => { if (cwd !== '/') { const parts = cwd.split('/'); parts.pop(); navigate(parts.join('/') || '/'); } };

  const getIcon = (name: string, isDir: boolean) => {
    if (isDir) {
      const icons: { [key: string]: string } = { Desktop: '🖥️', Documents: '📄', Downloads: '⬇️', Pictures: '🖼️', Music: '🎵', Videos: '🎬' };
      return icons[name] || '📁';
    }
    const ext = name.split('.').pop()?.toLowerCase();
    const extIcons: { [key: string]: string } = { txt: '📝', md: '📝', pdf: '📋', js: '⚡', ts: '⚡', html: '🌐', css: '🎨', sh: '⚙️', py: '🐍', png: '🖼️', jpg: '🖼️', iso: '💿', json: '{}' };
    return extIcons[ext || ''] || '📄';
  };

  const places = [
    ['/home/user', '🏠', 'Home'], ['/home/user/Desktop', '🖥️', 'Desktop'],
    ['/home/user/Documents', '📄', 'Documents'], ['/home/user/Downloads', '⬇️', 'Downloads'],
    ['/home/user/Pictures', '🖼️', 'Pictures'], ['/home/user/Music', '🎵', 'Music'],
    ['/', '💾', 'Computer']
  ];

  return (
    <div className="flex h-full" style={{background:'#1e1e1e', color:'#ccc'}}>
      {/* Sidebar */}
      <div className="w-44 border-r border-white/10 flex flex-col py-2" style={{background:'#252525'}}>
        <p className="text-white/30 text-xs px-3 mb-1 uppercase tracking-wider">Places</p>
        {places.map(([path, icon, label]) => (
          <div key={path} onClick={() => navigate(path as string)}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm rounded mx-1 ${cwd === path ? 'bg-orange-500/20 text-white' : 'text-white/60 hover:bg-white/5'}`}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 flex items-center gap-2 px-3 border-b border-white/10" style={{background:'#2a2a2a'}}>
          <button onClick={goBack} disabled={histIdx===0} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-1">◀</button>
          <button onClick={goFwd} disabled={histIdx===history.length-1} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-1">▶</button>
          <button onClick={goUp} className="text-white/60 hover:text-white transition-colors px-1">↑</button>
          <div className="flex-1 bg-black/20 rounded px-2 py-0.5 text-white/70 text-xs border border-white/10">{cwd}</div>
          <button onClick={() => setView(v => v==='grid'?'list':'grid')} className="text-white/50 hover:text-white text-sm px-1">{view==='grid'?'≡':'⊞'}</button>
        </div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/5 text-xs text-white/40">
          {cwd.split('/').filter(Boolean).map((part, i, arr) => {
            const path = '/' + arr.slice(0, i + 1).join('/');
            return <React.Fragment key={i}>{i>0&&<span>/</span>}<span onClick={() => navigate(path)} className="hover:text-white/70 cursor-pointer">{part}</span></React.Fragment>;
          })}
          {cwd==='/'&&<span>/ (root)</span>}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {view === 'grid' ? (
            <div className="grid gap-2" style={{gridTemplateColumns:'repeat(auto-fill, minmax(90px,1fr))'}}>
              {children.map((name: string) => {
                const childPath = (cwd==='/'?'':cwd)+'/'+name;
                const child = fs[childPath];
                const isDir = child?.type === 'dir';
                return (
                  <div key={name} onClick={() => setSelected(name)} onDoubleClick={() => isDir && navigate(childPath)}
                    className={`file-item rounded-lg p-2 flex flex-col items-center gap-1 cursor-pointer text-center ${selected===name?'selected':''}`}>
                    <span className="text-3xl">{getIcon(name, isDir)}</span>
                    <span className="text-xs text-white/70 break-all leading-tight">{name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-white/30 text-xs border-b border-white/10"><th className="text-left py-1 px-2">Name</th><th className="text-left py-1 px-2">Type</th><th className="text-left py-1 px-2">Size</th></tr></thead>
              <tbody>
                {children.map((name: string) => {
                  const childPath = (cwd==='/'?'':cwd)+'/'+name;
                  const child = fs[childPath];
                  const isDir = child?.type === 'dir';
                  return (
                    <tr key={name} onClick={() => setSelected(name)} onDoubleClick={() => isDir && navigate(childPath)}
                      className={`file-item cursor-pointer ${selected===name?'selected':''}`}>
                      <td className="py-1 px-2 flex items-center gap-2"><span>{getIcon(name,isDir)}</span><span className={isDir?'text-blue-300':'text-white/80'}>{name}</span></td>
                      <td className="py-1 px-2 text-white/40">{isDir?'Folder':name.split('.').pop()?.toUpperCase()}</td>
                      <td className="py-1 px-2 text-white/40">{isDir?'—':(child?.content?.length||0)+' B'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {children.length === 0 && <p className="text-white/30 text-sm text-center mt-8">Empty folder</p>}
        </div>
        {selected && <div className="px-3 py-1.5 border-t border-white/10 text-xs text-white/40">{selected} selected</div>}
      </div>
    </div>
  );
}

// ─── SETTINGS APP ─────────────────────────────────────────────────────────────
export function SettingsApp() {
  const [tab, setTab] = useState('appearance');
  const [wallpaper, setWallpaper] = useState(0);
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(80);
  const [nightLight, setNightLight] = useState(false);
  const [autoUpdates, setAutoUpdates] = useState(true);

  const tabs = [['appearance','🎨','Appearance'],['sound','🔊','Sound'],['display','🖥️','Displays'],['network','🌐','Network'],['privacy','🔒','Privacy'],['updates','🔄','Updates']];
  const wallpapers = ['linear-gradient(135deg,#1a1a2e,#16213e,#0f3460,#533483,#e94560)','linear-gradient(135deg,#0d1117,#161b22,#21262d,#30363d,#6e7681)','linear-gradient(135deg,#0f0c29,#302b63,#24243e)','linear-gradient(135deg,#134e5e,#71b280)','linear-gradient(135deg,#373b44,#4286f4)','linear-gradient(135deg,#1e3c72,#2a5298)'];

  return (
    <div className="flex h-full" style={{background:'#1e1e1e',color:'#ccc'}}>
      <div className="w-48 border-r border-white/10 py-2" style={{background:'#252525'}}>
        <p className="text-white/30 text-xs px-3 mb-2 uppercase tracking-wider">Settings</p>
        {tabs.map(([id,icon,label]) => (
          <div key={id} onClick={() => setTab(id)}
            className={`settings-tab flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors ${tab===id?'active text-white':'text-white/60'}`}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {tab === 'appearance' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Appearance</h2>
            <div className="mb-6">
              <p className="text-white/60 text-sm mb-3">Wallpaper</p>
              <div className="grid grid-cols-3 gap-2">
                {wallpapers.map((w,i) => (
                  <div key={i} onClick={() => setWallpaper(i)}
                    className={`h-16 rounded-lg cursor-pointer transition-all ${wallpaper===i?'ring-2 ring-orange-500 ring-offset-2 ring-offset-black':''}`}
                    style={{background:w}} />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-white/60 text-sm mb-2">Color Scheme</p>
              <div className="flex gap-2">
                {['Dark','Light','Auto'].map(s => (
                  <button key={s} className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${s==='Dark'?'ubuntu-orange-bg text-white':'text-white/60 bg-white/5 hover:bg-white/10'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'sound' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Sound</h2>
            <div className="space-y-4">
              {[
                { icon: '🔊', label: 'Output Volume', val: volume, set: setVolume },
                { icon: '🎤', label: 'Input Volume', val: 50, set: () => {} }
              ].map(({ icon, label, val, set }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-sm">{icon} {label}</span>
                    <span className="text-white/40 text-sm">{val}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={val} onChange={(e) => set(parseInt(e.target.value))} className="w-full" />
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'display' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Displays</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70 text-sm">💡 Brightness</span>
                  <span className="text-white/40 text-sm">{brightness}%</span>
                </div>
                <input type="range" min="0" max="100" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">🌙 Night Light</span>
                <label className="switch">
                  <input type="checkbox" checked={nightLight} onChange={(e) => setNightLight(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}
        {tab === 'network' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Network</h2>
            <p className="text-white/60 text-sm">Connected to Wi-Fi: Ubuntu Network</p>
          </div>
        )}
        {tab === 'privacy' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Privacy</h2>
            <p className="text-white/60 text-sm">Privacy settings coming soon...</p>
          </div>
        )}
        {tab === 'updates' && (
          <div>
            <h2 className="text-white text-xl font-medium mb-4">Updates</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-sm">Automatic Updates</span>
              <label className="switch">
                <input type="checkbox" checked={autoUpdates} onChange={(e) => setAutoUpdates(e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>
            <button className="btn-ubuntu">Check for Updates</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ABOUT APP ───────────────────────────────────────────────────────────────
export function AboutApp() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8" style={{background:'#1e1e1e',color:'#ccc'}}>
      <div className="text-center">
        <svg width="120" height="120" viewBox="0 0 80 80" className="mx-auto mb-6">
          <circle cx="40" cy="40" r="35" fill="none" stroke="#e95420" strokeWidth="3"/>
          <circle cx="40" cy="14" r="8" fill="#e95420"/>
          <circle cx="65" cy="57" r="8" fill="#e95420"/>
          <circle cx="15" cy="57" r="8" fill="#e95420"/>
        </svg>
        <h1 className="text-white text-3xl font-light mb-2">Ubuntu</h1>
        <p className="text-white/60 text-lg mb-4">{VERSION}</p>
        <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
          This is a simulated Ubuntu desktop environment running in your browser.
          Explore the virtual file system, run commands in the terminal, and enjoy the interface!
        </p>
        <div className="mt-6 text-white/30 text-xs">
          <p>© 2024 Ubuntu Simulation</p>
          <p>Built with React</p>
        </div>
      </div>
    </div>
  );
}

// ─── BROWSER APP ─────────────────────────────────────────────────────────────
export function BrowserApp() {
  const [url, setUrl] = useState('https://www.ubuntu.com/');
  const [history, setHistory] = useState<string[]>(['https://www.ubuntu.com/']);
  const [histIdx, setHistIdx] = useState(0);

  const navigate = (newUrl: string) => {
    const newHist = [...history.slice(0, histIdx + 1), newUrl];
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
    setUrl(newUrl);
  };

  const goBack = () => { if (histIdx > 0) { const p = histIdx - 1; setHistIdx(p); setUrl(history[p]); } };
  const goFwd = () => { if (histIdx < history.length - 1) { const p = histIdx + 1; setHistIdx(p); setUrl(history[p]); } };

  return (
    <div className="h-full flex flex-col" style={{background:'#1e1e1e'}}>
      {/* Toolbar */}
      <div className="h-12 flex items-center gap-2 px-3 border-b border-white/10" style={{background:'#2a2a2a'}}>
        <button onClick={goBack} disabled={histIdx===0} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-2">◀</button>
        <button onClick={goFwd} disabled={histIdx===history.length-1} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-2">▶</button>
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key==='Enter'&&navigate(url)}
          className="flex-1 bg-black/20 rounded px-3 py-1 text-white/70 text-sm border border-white/10 focus:border-orange-500 focus:outline-none" />
        <button onClick={() => navigate(url)} className="text-white/60 hover:text-white transition-colors px-2">Go</button>
      </div>
      {/* Content */}
      <div className="flex-1 bg-white">
        <iframe src={url} className="w-full h-full border-0" title="Browser" />
      </div>
    </div>
  );
}