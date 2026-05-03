import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { executeCTFCommand } from '../redux/slices/ctfSlice';
import { OSContext, OSContextType, TerminalLine, USERNAME, HOSTNAME, VERSION, createTerminalEngine } from '../pages/LinuxOS';

export function TerminalApp() {
  const context = useContext(OSContext) as OSContextType;
  if (!context) throw new Error('OSContext not found');
  const { fs, isCTFMode, currentLevel, challenges } = context;
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', text: `Ubuntu ${VERSION} (simulated)` },
    { type: 'output', text: `Welcome to Ubuntu! Type 'help' for available commands.` },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const dispatch = useDispatch<AppDispatch>();
  const ctfExecute = useCallback(async (level: number, command: string, currentPath: string, sessionState: any) => {
    return dispatch(executeCTFCommand({ level, command, currentPath, sessionState })).unwrap();
  }, [dispatch]);
  const engineRef = useRef(createTerminalEngine('/home/user', challenges, ctfExecute));
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fsRef = useRef(fs);
  fsRef.current = fs;

  useEffect(() => {
    try {
      const prevCwd = engineRef.current?.getCwd ? engineRef.current.getCwd() : '/home/user';
      engineRef.current = createTerminalEngine(prevCwd, challenges, ctfExecute);
    } catch (e) {
      // ignore
    }
  }, [challenges, ctfExecute]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const run = async (cmd: string) => {
    const engine = engineRef.current;
    console.log('Terminal run:', { cmd, isCTFMode, currentLevel });
    const result = await engine.execute(cmd, isCTFMode, currentLevel);
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
    <div className="terminal-bg terminal-app h-full flex flex-col terminal-font text-sm" onClick={() => inputRef.current?.focus()}>
      {isCTFMode && (
        <div className="absolute top-12 right-6 z-50 px-3 py-1 rounded bg-[#d4af37]/10 text-[#d4af37] text-xs font-semibold">CTF mode • Level {currentLevel}</div>
      )}
      <div className="terminal-output flex-1 overflow-y-auto p-4 space-y-1">
        {lines.map((l, i) => (
          <div key={i} className={`leading-6 whitespace-pre-wrap break-all ${l.type==='error' ? 'text-red-400' : l.type==='prompt' ? 'text-green-400' : 'text-gray-200'}`}>
            {l.type==='ls-output'
              ? <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {l.items?.map((it,j) => <span key={j} className={it.isDir ? 'text-blue-300 font-semibold' : 'text-gray-200'}>{it.name}</span>)}
                </div>
              : l.text}
          </div>
        ))}
        <div className="flex items-center terminal-prompt">
          <span className="text-green-400 font-medium">{getPrompt()}</span>
          <span className="text-gray-200 ml-2">{input}</span>
          <span className="cursor-blink" />
        </div>
        <div ref={bottomRef} />
      </div>
      <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
        className="opacity-0 absolute w-0 h-0 pointer-events-none" autoFocus />
    </div>
  );
}
