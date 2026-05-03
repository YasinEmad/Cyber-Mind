import React, { useState, useContext } from 'react';
import { OSContext, VERSION } from '../pages/LinuxOS';

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
    <div className="flex h-full files-app" style={{background:'#1e1e1e', color:'#ccc'}}>
      <div className="w-44 border-r border-white/10 flex flex-col py-2 files-sidebar" style={{background:'#252525'}}>
        <p className="text-white/30 text-xs px-3 mb-1 uppercase tracking-wider">Places</p>
        {places.map(([path, icon, label]) => (
          <div key={path} onClick={() => navigate(path as string)}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm rounded mx-1 ${cwd === path ? 'bg-orange-500/20 text-white' : 'text-white/60 hover:bg-white/5'}`}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col files-main">
        <div className="h-10 flex items-center gap-2 px-3 border-b border-white/10 files-toolbar" style={{background:'#2a2a2a'}}>
          <button onClick={goBack} disabled={histIdx===0} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-1">◀</button>
          <button onClick={goFwd} disabled={histIdx===history.length-1} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-1">▶</button>
          <button onClick={goUp} className="text-white/60 hover:text-white transition-colors px-1">↑</button>
          <div className="flex-1 bg-black/20 rounded px-2 py-0.5 text-white/70 text-xs border border-white/10">{cwd}</div>
          <button onClick={() => setView(v => v==='grid'?'list':'grid')} className="text-white/50 hover:text-white text-sm px-1">{view==='grid'?'≡':'⊞'}</button>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/5 text-xs text-white/40 files-breadcrumb">
          {cwd.split('/').filter(Boolean).map((part, i, arr) => {
            const path = '/' + arr.slice(0, i + 1).join('/');
            return <React.Fragment key={i}>{i>0&&<span>/</span>}<span onClick={() => navigate(path)} className="hover:text-white/70 cursor-pointer">{part}</span></React.Fragment>;
          })}
          {cwd==='/'&&<span>/ (root)</span>}
        </div>
        <div className="flex-1 overflow-y-auto p-3 files-content">
          {view === 'grid' ? (
            <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fill, minmax(100px,1fr))'}}>
              {children.map((name: string) => {
                const childPath = (cwd==='/'?'':cwd)+'/'+name;
                const child = fs[childPath];
                const isDir = child?.type === 'dir';
                return (
                  <div key={name} onClick={() => setSelected(name)} onDoubleClick={() => isDir && navigate(childPath)}
                    className={`file-item file-card rounded-2xl p-3 flex flex-col items-center gap-2 cursor-pointer text-center ${selected===name?'selected':''}`}>
                    <div className="text-4xl">{getIcon(name, isDir)}</div>
                    <span className="text-xs text-white/70 break-all leading-tight">{name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full text-sm files-table">
              <thead><tr className="text-white/30 text-xs border-b border-white/10"><th className="text-left py-2 px-3">Name</th><th className="text-left py-2 px-3">Type</th><th className="text-left py-2 px-3">Size</th></tr></thead>
              <tbody>
                {children.map((name: string) => {
                  const childPath = (cwd==='/'?'':cwd)+'/'+name;
                  const child = fs[childPath];
                  const isDir = child?.type === 'dir';
                  return (
                    <tr key={name} onClick={() => setSelected(name)} onDoubleClick={() => isDir && navigate(childPath)}
                      className={`file-item file-row cursor-pointer ${selected===name?'selected':''}`}>
                      <td className="py-2 px-3 flex items-center gap-3"><span>{getIcon(name,isDir)}</span><span className={isDir?'text-blue-300':'text-white/80'}>{name}</span></td>
                      <td className="py-2 px-3 text-white/40">{isDir?'Folder':name.split('.').pop()?.toUpperCase()}</td>
                      <td className="py-2 px-3 text-white/40">{isDir?'—':(child?.content?.length||0)+' B'}</td>
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
    <div className="flex h-full settings-app" style={{background:'#1e1e1e',color:'#ccc'}}>
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

export function AboutApp() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 about-app" style={{background:'#1e1e1e',color:'#ccc'}}>
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
      <div className="h-12 flex items-center gap-2 px-3 border-b border-white/10" style={{background:'#2a2a2a'}}>
        <button onClick={goBack} disabled={histIdx===0} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-2">◀</button>
        <button onClick={goFwd} disabled={histIdx===history.length-1} className="text-white/60 disabled:opacity-30 hover:text-white transition-colors px-2">▶</button>
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key==='Enter'&&navigate(url)}
          className="flex-1 bg-black/20 rounded px-3 py-1 text-white/70 text-sm border border-white/10 focus:border-orange-500 focus:outline-none" />
        <button onClick={() => navigate(url)} className="text-white/60 hover:text-white transition-colors px-2">Go</button>
      </div>
      <div className="flex-1 bg-white">
        <iframe src={url} className="w-full h-full border-0" title="Browser" />
      </div>
    </div>
  );
}
