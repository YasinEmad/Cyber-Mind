import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PortData {
  id: number;
  x: number;
  y: number;
}

interface PiratePos {
  x: number;
  y: number;
}

interface TrailDot {
  x: number;
  y: number;
  id: number;
}

interface GameState {
  current: number;
  completed: number[];
}

// ── Port layout ───────────────────────────────────────────────────────────────
const PORTS: PortData[] = [
  { id: 1,  x: 9,   y: 80 },
  { id: 2,  x: 15,  y: 70 },
  { id: 3,  x: 11,  y: 59 },
  { id: 4,  x: 19,  y: 49 },
  { id: 5,  x: 13,  y: 38 },
  { id: 6,  x: 23,  y: 28 },
  { id: 7,  x: 33,  y: 22 },
  { id: 8,  x: 43,  y: 17 },
  { id: 9,  x: 53,  y: 13 },
  { id: 10, x: 63,  y: 19 },
  { id: 11, x: 71,  y: 27 },
  { id: 12, x: 79,  y: 21 },
  { id: 13, x: 87,  y: 13 },
  { id: 14, x: 91,  y: 23 },
  { id: 15, x: 85,  y: 33 },
  { id: 16, x: 89,  y: 43 },
  { id: 17, x: 83,  y: 53 },
  { id: 18, x: 89,  y: 63 },
  { id: 19, x: 83,  y: 73 },
  { id: 20, x: 75,  y: 80 },
  { id: 21, x: 65,  y: 76 },
  { id: 22, x: 57,  y: 83 },
  { id: 23, x: 47,  y: 79 },
  { id: 24, x: 39,  y: 85 },
  { id: 25, x: 31,  y: 78 },
  { id: 26, x: 37,  y: 67 },
  { id: 27, x: 29,  y: 59 },
  { id: 28, x: 37,  y: 51 },
  { id: 29, x: 47,  y: 55 },
  { id: 30, x: 57,  y: 51 },
  { id: 31, x: 65,  y: 57 },
  { id: 32, x: 73,  y: 49 },
  { id: 33, x: 67,  y: 39 },
  { id: 34, x: 55,  y: 35 },
  { id: 35, x: 45,  y: 41 },
];

function useSounds() {
  const play = useCallback((_sound: string) => {}, []);
  return { play };
}

const STORAGE_KEY = "pirate_island_v2";
function loadProgress(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { current: 1, completed: [] };
  } catch { return { current: 1, completed: [] }; }
}
function saveProgress(state: GameState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ── Pirate character ──────────────────────────────────────────────────────────
function PirateIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none">
      <ellipse cx="20" cy="42" rx="8" ry="2" fill="rgba(0,0,0,0.4)" />
      <path d="M11 38 Q11 28 20 28 Q29 28 29 38 Z" fill="#1a0000" />
      <path d="M11 38 Q11 30 15 28 L14 38 Z" fill="#cc0000" />
      <path d="M29 38 Q29 30 25 28 L26 38 Z" fill="#cc0000" />
      <rect x="13" y="31" width="14" height="2.5" rx="1" fill="#8B0000" />
      <rect x="18.5" y="30.5" width="3" height="3.5" rx="0.5" fill="#cc9900" />
      <rect x="18" y="24" width="4" height="5" fill="#e8c49a" />
      <circle cx="20" cy="20" r="9.5" fill="#e8c49a" />
      <rect x="9" y="12.5" width="22" height="3.5" rx="1.5" fill="#0d0d0d" />
      <path d="M13 13 L13 5 Q13 3 15 3 L25 3 Q27 3 27 5 L27 13 Z" fill="#0d0d0d" />
      <rect x="13" y="10.5" width="14" height="2.5" fill="#cc0000" />
      <circle cx="20" cy="7" r="2.2" fill="white" opacity="0.85" />
      <line x1="17" y1="9.5" x2="23" y2="9.5" stroke="white" strokeWidth="1" opacity="0.85" />
      <line x1="17.5" y1="8.5" x2="22.5" y2="10.5" stroke="white" strokeWidth="0.8" opacity="0.85" />
      <line x1="22.5" y1="8.5" x2="17.5" y2="10.5" stroke="white" strokeWidth="0.8" opacity="0.85" />
      <ellipse cx="23.5" cy="19" rx="3" ry="2.2" fill="#0d0d0d" />
      <line x1="20.5" y1="18" x2="27" y2="16.5" stroke="#0d0d0d" strokeWidth="1.2" />
      <circle cx="16.5" cy="19.5" r="2" fill="#0d0d0d" />
      <circle cx="17" cy="19" r="0.7" fill="white" />
      <path d="M22 22 Q23 23 22 24" stroke="#c0392b" strokeWidth="0.8" fill="none" />
      <path d="M17 23.5 Q19 25 21 23.5" stroke="#8B4513" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <rect x="17.5" y="23.5" width="2" height="1.5" rx="0.3" fill="white" opacity="0.8" />
      <rect x="25.5" y="28" width="1.5" height="6" rx="0.5" fill="#8B6914" />
      <rect x="24" y="30" width="4.5" height="1" rx="0.3" fill="#cc9900" />
    </svg>
  );
}

function Port({ port, status, onClick, isAnimating }: { port: PortData; status: string; onClick: () => void; isAnimating: boolean }) {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  const isLocked = status === "locked";

  const colors = isCompleted
    ? { ring: "#cc0000", fill: "#2a0000", text: "#ff4444", glow: "rgba(204,0,0,0.45)" }
    : isCurrent
    ? { ring: "#ff2222", fill: "#1a0000", text: "#ff6666", glow: "rgba(255,30,30,0.55)" }
    : { ring: "#3a1a1a", fill: "#0d0000", text: "#5a2a2a", glow: "none" };

  return (
    <g
      style={{ cursor: isLocked || isAnimating ? "default" : "pointer" }}
      onClick={() => !isLocked && !isAnimating && onClick()}
    >
      {!isLocked && (
        <circle cx={`${port.x}%`} cy={`${port.y}%`} r="20"
          fill={colors.glow} className={isCurrent ? "port-pulse" : ""} />
      )}
      <circle cx={`${port.x}%`} cy={`${port.y}%`} r="16"
        fill="none" stroke={isCompleted ? "#8B0000" : isCurrent ? "#cc0000" : "#1a0808"}
        strokeWidth="1" strokeDasharray={isLocked ? "3,2" : "none"} />
      <circle cx={`${port.x}%`} cy={`${port.y}%`} r="13"
        fill={colors.fill} stroke={colors.ring}
        strokeWidth={isCurrent ? "2.5" : "1.8"} />
      {isCompleted ? (
        <text x={`${port.x}%`} y={`${port.y - 0.3}%`}
          textAnchor="middle" dominantBaseline="central"
          fontSize="10" fill="#cc0000">✓</text>
      ) : (
        <text x={`${port.x}%`} y={`${port.y}%`}
          textAnchor="middle" dominantBaseline="central"
          fontSize={port.id >= 10 ? "7.5" : "9"}
          fontWeight="bold" fill={colors.text}
          fontFamily="'Cinzel', serif">{port.id}</text>
      )}
      {isLocked && (
        <text x={`${port.x}%`} y={`${port.y + 2.5}%`}
          textAnchor="middle" dominantBaseline="central"
          fontSize="5" fill="#3a1a1a" opacity="0.6">🔒</text>
      )}
    </g>
  );
}

// ── Main game ─────────────────────────────────────────────────────────────────
export default function PirateIslandGame() {
  const saved = loadProgress();
  const [currentPort, setCurrentPort] = useState(saved.current);
  const [completedPorts, setCompletedPorts] = useState(saved.completed);
  const [isAnimating, setIsAnimating] = useState(false);
  const [piratePos, setPiratePos] = useState<PiratePos | null>(null);
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const [celebratePort, setCelebratePort] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { play } = useSounds();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animRef = useRef<number | null>(null);

  const getSVGPoint = useCallback((portId: number): PiratePos | null => {
    const port = PORTS.find(p => p.id === portId);
    if (!port || !svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return { x: (port.x / 100) * rect.width, y: (port.y / 100) * rect.height };
  }, []);

  useEffect(() => {
    const set = () => { const p = getSVGPoint(currentPort); if (p) setPiratePos(p); };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [currentPort, getSVGPoint]);

  const portStatus = (id: number): string => {
    if (completedPorts.includes(id)) return "completed";
    if (id === currentPort) return "current";
    return "locked";
  };

  const handleCompleteLevel = () => {
    if (currentPort >= 35 || isAnimating) return;
    setShowModal(false);
    const fromPort = currentPort;
    const toPort = currentPort + 1;
    const newCompleted = [...completedPorts, fromPort];
    setCompletedPorts(newCompleted);
    setCelebratePort(fromPort);
    play("complete");
    setTimeout(() => {
      setCelebratePort(null);
      animateMovement(fromPort, toPort, () => {
        setCurrentPort(toPort);
        saveProgress({ current: toPort, completed: newCompleted });
        play("arrive");
      });
    }, 700);
  };

  const animateMovement = (from: number, to: number, onDone: () => void) => {
    setIsAnimating(true);
    setTrail([]);
    const fromPt = getSVGPoint(from);
    const toPt = getSVGPoint(to);
    if (!fromPt || !toPt) { setIsAnimating(false); onDone(); return; }
    const dx = toPt.x - fromPt.x;
    const dy = toPt.y - fromPt.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const duration = Math.max(700, dist * 4.5);
    const startTime = performance.now();
    const trailPoints: TrailDot[] = [];

    const step = (now: number) => {
      const rawT = Math.min((now - startTime) / duration, 1);
      const t = easeInOut(rawT);
      const x = fromPt.x + dx * t;
      const y = fromPt.y + dy * t;
      setPiratePos({ x, y });
      if (Math.floor(rawT * 18) > trailPoints.length && trailPoints.length < 14) {
        trailPoints.push({ x, y, id: Date.now() + trailPoints.length });
        setTrail([...trailPoints]);
      }
      if (rawT < 1) { animRef.current = requestAnimationFrame(step); }
      else { setPiratePos(toPt); setIsAnimating(false); setTrail([]); onDone(); }
    };
    animRef.current = requestAnimationFrame(step);
  };

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const resetGame = () => {
    setCurrentPort(1); setCompletedPorts([]);
    saveProgress({ current: 1, completed: [] });
    const p = getSVGPoint(1); if (p) setPiratePos(p);
    setTrail([]);
  };

  const svgRect = svgRef.current ? svgRef.current.getBoundingClientRect() : null;
  const progress = Math.round((completedPorts.length / 35) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 30% 20%, #1a0000 0%, #0d0000 40%, #000000 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Cinzel', serif",
      overflow: "hidden", position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

        @keyframes portPulse {
          0%,100% { r:20; opacity:.55; }
          50% { r:28; opacity:.15; }
        }
        .port-pulse { animation: portPulse 2s ease-in-out infinite; }

        @keyframes pirateFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .pirate-float { animation: pirateFloat 2.2s ease-in-out infinite; }

        @keyframes bloodFlow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .btn-blood {
          background: linear-gradient(90deg, #8B0000, #cc0000, #ff2222, #cc0000, #8B0000);
          background-size: 200% auto;
          animation: bloodFlow 3s linear infinite;
          transition: filter .2s, transform .15s;
        }
        .btn-blood:hover { filter: brightness(1.25); transform: scale(1.05); }
        .btn-blood:active { transform: scale(0.97); }

        @keyframes embers {
          0%,100% { opacity:0; transform: translateY(0) scale(0); }
          40% { opacity:1; transform: translateY(-8px) scale(1); }
          80% { opacity:0.3; transform: translateY(-14px) scale(0.5); }
        }
        .ember { animation: embers 1.4s ease-out infinite; }

        @keyframes waterShimmer {
          0%,100% { opacity:.06; }
          50% { opacity:.13; }
        }
        .water-line { animation: waterShimmer 3s ease-in-out infinite; }

        @keyframes fogDrift {
          0% { transform: translateX(0); opacity:.18; }
          50% { transform: translateX(-25px); opacity:.1; }
          100% { transform: translateX(0); opacity:.18; }
        }
        .fog { animation: fogDrift 9s ease-in-out infinite; }

        @keyframes volcanoFlicker {
          0%,100% { opacity:.7; }
          50% { opacity:1; }
        }
        .lava-glow { animation: volcanoFlicker 1.5s ease-in-out infinite; }

        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#0a0000; }
        ::-webkit-scrollbar-thumb { background:#4a0000; border-radius:3px; }
      `}</style>

      {/* Ambient ember particles */}
      {[...Array(18)].map((_, i) => (
        <div key={i} className="ember" style={{
          position: "fixed",
          left: `${(i * 41 + 13) % 100}%`,
          top: `${50 + (i * 17) % 45}%`,
          width: i % 4 === 0 ? "4px" : "2px", height: i % 4 === 0 ? "4px" : "2px",
          borderRadius: "50%",
          background: i % 3 === 0 ? "#cc0000" : "#ff4400",
          boxShadow: "0 0 4px currentColor",
          pointerEvents: "none", zIndex: 0,
          animationDelay: `${(i * 0.31) % 2.5}s`,
          animationDuration: `${1.2 + (i % 4) * 0.4}s`,
        }} />
      ))}

      {/* ── Header ── */}
      <div style={{ textAlign: "center", padding: "18px 20px 6px", position: "relative", zIndex: 10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", justifyContent:"center", marginBottom:"6px" }}>
          <div style={{ height:"1px", width:"60px", background:"linear-gradient(to right, transparent, #8B0000)" }} />
          <span style={{ color:"#8B0000", fontSize:"1rem" }}>☠</span>
          <div style={{ height:"1px", width:"60px", background:"linear-gradient(to left, transparent, #8B0000)" }} />
        </div>
        <h1 style={{
          fontSize: "clamp(1.3rem, 4vw, 2.2rem)",
          color: "#cc0000", margin: 0, letterSpacing: "0.18em", fontWeight: 900,
          textShadow: "0 0 40px rgba(200,0,0,0.7), 0 0 80px rgba(200,0,0,0.3), 0 2px 8px #000",
          textTransform: "uppercase",
        }}>Crimson Tides</h1>
        <p style={{
          color: "#5a1a1a", margin: "4px 0 0", fontSize: "0.72rem", letterSpacing: "0.3em",
          fontFamily: "'Crimson Text', serif", fontStyle: "italic",
        }}>35 Ports of Damnation</p>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", justifyContent:"center", marginTop:"6px" }}>
          <div style={{ height:"1px", width:"60px", background:"linear-gradient(to right, transparent, #8B0000)" }} />
          <span style={{ color:"#8B0000", fontSize:"1rem" }}>☠</span>
          <div style={{ height:"1px", width:"60px", background:"linear-gradient(to left, transparent, #8B0000)" }} />
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{
        display: "flex", gap: "0", zIndex: 10, margin: "8px 0",
        border: "1px solid #2a0000", borderRadius: "4px", overflow: "hidden",
        background: "rgba(0,0,0,0.6)",
      }}>
        {[
          { label: "PORT", value: currentPort, icon: "🏴‍☠️" },
          { label: "SEIZED", value: completedPorts.length, icon: "⚓" },
          { label: "REMAIN", value: 35 - completedPorts.length, icon: "💀" },
        ].map(({ label, value, icon }, idx) => (
          <div key={label} style={{
            textAlign: "center", padding: "8px 18px",
            borderRight: idx < 2 ? "1px solid #2a0000" : "none",
          }}>
            <div style={{ fontSize: "0.9rem" }}>{icon}</div>
            <div style={{ color: "#cc0000", fontWeight: "bold", fontSize: "1.05rem", textShadow: "0 0 10px #cc000088" }}>{value}</div>
            <div style={{ color: "#4a1a1a", fontSize: "0.55rem", letterSpacing: "0.15em" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: "min(90vw,500px)", margin: "0 0 8px", zIndex: 10 }}>
        <div style={{ height: "4px", background: "#1a0000", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: "linear-gradient(90deg, #8B0000, #cc0000, #ff2222)",
            borderRadius: "2px", transition: "width 0.8s ease",
            boxShadow: "0 0 8px #cc0000",
          }} />
        </div>
        <div style={{ textAlign: "right", fontSize: "0.6rem", color: "#4a1a1a", marginTop: "2px", letterSpacing: "0.1em" }}>
          {progress}% CONQUERED
        </div>
      </div>

      {/* ── Island Map ── */}
      <div style={{
        position: "relative", width: "min(96vw, 1200px)", aspectRatio: "1 / 0.82",
        margin: "0 auto", zIndex: 10, overflow: "hidden",
        background: "transparent", boxShadow: "none",
        clipPath: "ellipse(52% 50% at 50% 50%)",
      }}>
        <svg ref={svgRef} viewBox="0 0 720 590"
          style={{ width: "100%", height: "100%", display: "block", background: "transparent" }}
          preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="islandBase" cx="48%" cy="42%" r="55%">
              <stop offset="0%" stopColor="#3d2b14" />
              <stop offset="35%" stopColor="#2e1f0a" />
              <stop offset="70%" stopColor="#1e1308" />
              <stop offset="100%" stopColor="#150e05" />
            </radialGradient>
            <radialGradient id="volcanoGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#cc2200" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#880000" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#440000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
              <stop offset="60%" stopColor="transparent" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="islandShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.85" />
            </filter>
            <filter id="softBlur">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id="emberGlow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="terrainFuzz">
              <feTurbulence type="turbulence" baseFrequency="0.65" numOctaves="3" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
          </defs>

          {/* ── OCEAN ── */}
          <ellipse cx="360" cy="295" rx="380" ry="320" fill="#1a0005" opacity="0.5" />

          {/* Water ripple lines */}
          {[...Array(9)].map((_, i) => (
            <line key={i} x1="0" y1={55 + i * 60} x2="720" y2={65 + i * 60}
              stroke="#3a0010" strokeWidth="1.5" className="water-line"
              style={{ animationDelay: `${i * 0.35}s` }} />
          ))}
          {[...Array(5)].map((_, i) => (
            <line key={`d${i}`}
              x1={i * 160} y1="0" x2={i * 160 + 200} y2="590"
              stroke="#2a0008" strokeWidth="0.6" opacity="0.35" />
          ))}

          {/* Fog patches over ocean */}
          <ellipse cx="90" cy="490" rx="190" ry="48" fill="#1a0008" opacity="0.2" className="fog" />
          <ellipse cx="630" cy="110" rx="155" ry="38" fill="#1a0008" opacity="0.15" className="fog"
            style={{ animationDelay: "4s" }} />
          <ellipse cx="360" cy="560" rx="240" ry="35" fill="#0d0004" opacity="0.3" className="fog"
            style={{ animationDelay: "2s" }} />

          {/* ── ISLAND OUTER SHAPES ── */}
          {/* Surf / wake zone */}
          <ellipse cx="360" cy="295" rx="322" ry="262" fill="#1a0e04" filter="url(#softBlur)" />
          {/* Beach sand layers */}
          <ellipse cx="360" cy="295" rx="308" ry="248" fill="#2a1a08" />
          <ellipse cx="360" cy="293" rx="298" ry="240" fill="#4a3010" opacity="0.65" />
          <ellipse cx="358" cy="290" rx="286" ry="228" fill="#3d2808" opacity="0.8" />

          {/* ── MAIN LANDMASS ── */}
          <ellipse cx="356" cy="286" rx="274" ry="216" fill="url(#islandBase)" filter="url(#islandShadow)" />

          {/* ── ELEVATION / TERRAIN LAYERS ── */}
          {/* Low scrubland ring */}
          <ellipse cx="356" cy="286" rx="262" ry="205" fill="#1e1508" opacity="0.6" />
          {/* Mid-elevation darker zone */}
          <ellipse cx="354" cy="280" rx="220" ry="175" fill="#1a1208" opacity="0.7" />
          {/* Central highland */}
          <ellipse cx="350" cy="270" rx="165" ry="135" fill="#221608" opacity="0.75" />

          {/* ── JUNGLE ZONES ── */}
          <ellipse cx="218" cy="215" rx="92" ry="68" fill="#162b08" opacity="0.92" />
          <ellipse cx="198" cy="198" rx="72" ry="52" fill="#1a3208" opacity="0.8" />
          <ellipse cx="182" cy="182" rx="48" ry="36" fill="#1e3a0a" opacity="0.7" />
          <ellipse cx="492" cy="345" rx="78" ry="58" fill="#142608" opacity="0.9" />
          <ellipse cx="478" cy="332" rx="55" ry="42" fill="#182e08" opacity="0.75" />
          <ellipse cx="382" cy="382" rx="88" ry="47" fill="#152808" opacity="0.75" />
          <ellipse cx="282" cy="325" rx="58" ry="42" fill="#162a07" opacity="0.85" />
          <ellipse cx="452" cy="235" rx="62" ry="47" fill="#142508" opacity="0.8" />
          <ellipse cx="320" cy="230" rx="50" ry="38" fill="#162808" opacity="0.7" />
          <ellipse cx="150" cy="250" rx="65" ry="50" fill="#1a2e08" opacity="0.8" />
          <ellipse cx="550" cy="280" rx="70" ry="45" fill="#142508" opacity="0.85" />
          <ellipse cx="400" cy="150" rx="55" ry="40" fill="#1e3a0a" opacity="0.75" />

          {/* ── ROCKY HIGHLANDS (center) ── */}
          <ellipse cx="432" cy="232" rx="68" ry="52" fill="#2a1a0a" opacity="0.9" />
          <ellipse cx="442" cy="222" rx="48" ry="38" fill="#3a250f" opacity="0.85" />
          <ellipse cx="454" cy="214" rx="30" ry="24" fill="#4a3018" opacity="0.9" />
          {/* Rock faces */}
          <path d="M425 240 L438 210 L452 205 L468 215 L472 240 Z" fill="#2e1c0a" opacity="0.8" />
          <path d="M432 235 L443 212 L454 209 L463 220 L464 235 Z" fill="#3a2410" opacity="0.7" />
          {/* Highland shadow */}
          <ellipse cx="455" cy="240" rx="35" ry="10" fill="#0d0804" opacity="0.5" filter="url(#softBlur)" />

          {/* ── SECONDARY HILLS ── */}
          <ellipse cx="260" cy="260" rx="55" ry="42" fill="#241808" opacity="0.8" />
          <ellipse cx="265" cy="252" rx="38" ry="28" fill="#2e2010" opacity="0.75" />
          <ellipse cx="420" cy="310" rx="45" ry="34" fill="#221608" opacity="0.7" />

          {/* ── VOLCANO ── */}
          {/* Volcano base wide */}
          <ellipse cx="558" cy="196" rx="75" ry="58" fill="#1e1008" />
          <ellipse cx="555" cy="190" rx="55" ry="45" fill="#241408" />
          {/* Slope paths */}
          <path d="M508 232 L538 140 L558 128 L578 140 L608 232 Z" fill="#2a1608" />
          <path d="M522 222 L546 148 L558 138 L570 148 L594 222 Z" fill="#361c0a" />
          <path d="M534 212 L550 158 L558 150 L566 158 L582 212 Z" fill="#3e220c" />
          {/* Lava veins on slope */}
          <path d="M554 142 Q550 168 546 205" stroke="#8B0000" strokeWidth="1.8" fill="none" opacity="0.6" />
          <path d="M562 142 Q566 162 570 198" stroke="#770000" strokeWidth="1.4" fill="none" opacity="0.5" />
          <path d="M558 145 Q555 175 558 210" stroke="#660000" strokeWidth="1" fill="none" opacity="0.4" />
          {/* Crater glow */}
          <ellipse cx="558" cy="134" rx="22" ry="12" fill="url(#volcanoGlow)" className="lava-glow" />
          <ellipse cx="558" cy="132" rx="14" ry="8" fill="#cc2200" opacity="0.75" className="lava-glow" />
          <ellipse cx="558" cy="129" rx="8" ry="5" fill="#ff5500" opacity="0.9" />
          <ellipse cx="558" cy="127" rx="4" ry="2.5" fill="#ffaa00" opacity="0.8" />
          {/* Lava pool glow halo */}
          <ellipse cx="558" cy="150" rx="30" ry="14" fill="#cc2200" opacity="0.12" filter="url(#softBlur)" />
          {/* Smoke columns */}
          <ellipse cx="558" cy="115" rx="10" ry="7" fill="#1a1008" opacity="0.65" />
          <ellipse cx="550" cy="104" rx="8" ry="6" fill="#150e06" opacity="0.55" />
          <ellipse cx="566" cy="100" rx="9" ry="6.5" fill="#1a1008" opacity="0.45" />
          <ellipse cx="555" cy="92" rx="7" ry="5" fill="#110c05" opacity="0.35" />
          <ellipse cx="562" cy="84" rx="6" ry="4" fill="#0d0903" opacity="0.25" />

          {/* ── CLIFFS & ROCKY OUTCROPS ── */}
          <path d="M102 352 Q82 342 87 320 Q93 300 113 312 Q123 318 117 345 Z" fill="#1e1208" />
          <path d="M92 282 Q72 272 77 256 Q84 240 100 252 Q110 260 102 282 Z" fill="#1a1005" />
          <path d="M612 262 Q637 252 642 270 Q647 287 624 292 Q610 290 612 262 Z" fill="#1e1208" />
          <path d="M617 382 Q642 374 646 392 Q650 412 627 410 Q612 404 617 382 Z" fill="#1a1005" />
          {/* Small boulder clusters */}
          <circle cx="160" cy="380" r="8" fill="#1e1408" />
          <circle cx="170" cy="385" r="6" fill="#1a1005" />
          <circle cx="545" cy="380" r="7" fill="#1e1408" />
          <circle cx="540" cy="390" r="5" fill="#1a1005" />
          <circle cx="200" cy="420" r="9" fill="#1e1408" />
          <circle cx="210" cy="425" r="5" fill="#1a1005" />
          <circle cx="500" cy="200" r="6" fill="#1e1408" />
          <circle cx="505" cy="205" r="4" fill="#1a1005" />
          <circle cx="350" cy="480" r="7" fill="#1e1408" />
          <circle cx="355" cy="485" r="5" fill="#1a1005" />

          {/* ── RIVERS / STREAMS ── */}
          <path d="M558 210 Q518 248 478 266 Q452 278 432 298"
            stroke="#1a2e3a" strokeWidth="2.5" fill="none" opacity="0.55" strokeLinecap="round" />
          <path d="M302 182 Q282 222 272 262 Q264 287 267 312"
            stroke="#1a2e3a" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round" />
          {/* River glint */}
          <path d="M520 240 Q498 252 480 260"
            stroke="#2a4a5a" strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round" />

          {/* ── SKULL ROCK landmark ── */}
          <g opacity="0.65">
            <ellipse cx="148" cy="432" rx="32" ry="24" fill="#1a1008" />
            <circle cx="148" cy="420" r="17" fill="#221508" />
            <circle cx="141" cy="418" r="4.5" fill="#0d0804" />
            <circle cx="155" cy="418" r="4.5" fill="#0d0804" />
            <path d="M146 426 L148 430 L150 426 Z" fill="#0d0804" />
            <rect x="142" y="432" width="3.5" height="3.5" rx="0.5" fill="#1a1208" />
            <rect x="146.5" y="432" width="3.5" height="3.5" rx="0.5" fill="#1a1208" />
            <rect x="151" y="432" width="3.5" height="3.5" rx="0.5" fill="#1a1208" />
          </g>

          {/* ── PALM TREES ── */}
          {[
            [183, 247, 1.0], [508, 197, 0.9], [428, 398, 1.0],
            [253, 347, 0.85], [372, 422, 0.9], [468, 168, 0.95],
            [238, 182, 0.9], [158, 312, 0.85], [320, 400, 0.8],
            [120, 380, 0.75], [550, 320, 0.8], [280, 220, 0.9],
            [480, 450, 0.85], [350, 180, 0.95], [600, 250, 0.7],
          ].map(([px, py, sc], i) => {
            const h = 44 * sc;
            const tw = 19 * sc;
            const angles = [-60, -38, -18, 12, 38, 68];
            return (
              <g key={i}>
                <path d={`M${px} ${py} Q${px + 5} ${py - h * 0.55} ${px - 4} ${py - h}`}
                  stroke="#3d2208" strokeWidth={3.2 * sc} fill="none" strokeLinecap="round" />
                <path d={`M${px} ${py} Q${px + 5} ${py - h * 0.55} ${px - 4} ${py - h}`}
                  stroke="#2a1804" strokeWidth={1.2 * sc} fill="none" strokeLinecap="round" strokeDasharray="3,4" opacity="0.5" />
                {angles.map((ang, j) => {
                  const rad = (ang - 90) * Math.PI / 180;
                  const ex = (px - 4) + Math.cos(rad) * tw;
                  const ey = (py - h) + Math.sin(rad) * (tw * 0.5);
                  const mx = (px - 4 + ex) / 2 + Math.sin(rad) * 6;
                  const my = (py - h + ey) / 2;
                  return (
                    <path key={j}
                      d={`M${px - 4} ${py - h} Q${mx} ${my} ${ex} ${ey}`}
                      stroke={j % 2 === 0 ? "#1e3e0a" : "#182e06"}
                      strokeWidth={2.2 * sc} fill="none" strokeLinecap="round" />
                  );
                })}
                <circle cx={px - 3} cy={py - h + 2} r={2.8 * sc} fill="#3a2008" />
                <circle cx={px + 2} cy={py - h + 5} r={2.2 * sc} fill="#2e1a05" />
              </g>
            );
          })}

          {/* ── PATHS between ports ── */}
          {PORTS.slice(0, -1).map((port, i) => {
            const next = PORTS[i + 1];
            const passed = port.id < currentPort && next.id <= currentPort;
            return (
              <line key={port.id}
                x1={`${port.x}%`} y1={`${port.y}%`}
                x2={`${next.x}%`} y2={`${next.y}%`}
                stroke={passed ? "#8B0000" : "#2a0808"}
                strokeWidth={passed ? "2" : "1.2"}
                strokeDasharray={passed ? "none" : "4,3"}
                opacity={passed ? 0.85 : 0.4} />
            );
          })}
          {/* Glowing path for completed segments */}
          {PORTS.slice(0, -1).map((port, i) => {
            const next = PORTS[i + 1];
            if (!(port.id < currentPort && next.id <= currentPort)) return null;
            return (
              <line key={`g${port.id}`}
                x1={`${port.x}%`} y1={`${port.y}%`}
                x2={`${next.x}%`} y2={`${next.y}%`}
                stroke="#cc0000" strokeWidth="6" opacity="0.1"
                filter="url(#softBlur)" />
            );
          })}

          {/* ── TRAIL DOTS ── */}
          {trail.map((dot, i) => {
            const svgW = svgRef.current ? svgRef.current.getBoundingClientRect().width : 720;
            const svgH = svgRef.current ? svgRef.current.getBoundingClientRect().height : 590;
            return (
              <circle key={dot.id}
                cx={(dot.x / svgW) * 720} cy={(dot.y / svgH) * 590}
                r={3.5} fill="#cc0000"
                opacity={(i + 1) / trail.length * 0.7}
                filter="url(#emberGlow)" />
            );
          })}

          {/* ── PORT NODES ── */}
          {PORTS.map(port => (
            <Port key={port.id} port={port}
              status={portStatus(port.id)}
              onClick={() => setShowModal(true)}
              isAnimating={isAnimating} />
          ))}

          {/* ── CELEBRATION BURST ── */}
          {celebratePort && (() => {
            const p = PORTS.find(pt => pt.id === celebratePort);
            if (!p) return null;
            return [0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <circle key={i}
                  cx={`${p.x + Math.cos(rad) * 5}%`}
                  cy={`${p.y + Math.sin(rad) * 5}%`}
                  r="3" fill={i % 2 === 0 ? "#cc0000" : "#ff4400"}
                  className="ember" style={{ animationDelay: `${i * 0.08}s` }} />
              );
            });
          })()}

          {/* ── PIRATE ── */}
          {piratePos && svgRect && (() => {
            const vbX = (piratePos.x / svgRect.width) * 720;
            const vbY = (piratePos.y / svgRect.height) * 590;
            return (
              <g transform={`translate(${vbX - 15}, ${vbY - 36})`}
                filter="url(#glow)"
                className={isAnimating ? "" : "pirate-float"}>
                <PirateIcon size={30} />
              </g>
            );
          })()}

          {/* Vignette */}
          <rect width="720" height="590" fill="url(#vignette)" />
        </svg>
      </div>

      {/* ── Action bar ── */}
      <div style={{ textAlign: "center", padding: "12px 20px 28px", zIndex: 10 }}>
        {currentPort <= 35 ? (
          <div>
            <div style={{
              color: "#4a1a1a", fontSize: "0.72rem", marginBottom: "10px",
              fontFamily: "'Crimson Text', serif", fontStyle: "italic", letterSpacing: "0.1em",
            }}>
              {isAnimating
                ? "⛵  Sailing through crimson waters..."
                : `Port ${currentPort} of 35  —  Seize your next conquest`}
            </div>
            <button disabled={isAnimating || currentPort > 35}
              onClick={() => setShowModal(true)}
              className={isAnimating ? "" : "btn-blood"}
              style={{
                padding: "13px 40px", border: "1px solid #8B0000", borderRadius: "3px",
                color: "white", fontSize: "0.9rem", fontWeight: "bold",
                fontFamily: "'Cinzel', serif", letterSpacing: "0.15em",
                cursor: isAnimating ? "not-allowed" : "pointer",
                opacity: isAnimating ? 0.4 : 1, transition: "all 0.2s",
                boxShadow: isAnimating ? "none" : "0 0 25px rgba(180,0,0,0.4), inset 0 1px 0 rgba(255,100,100,0.1)",
                background: isAnimating ? "#0d0000" : undefined, textTransform: "uppercase",
              }}>
              {isAnimating ? "Sailing..." : "⚔  Complete Level"}
            </button>
          </div>
        ) : (
          <div style={{ color: "#cc0000", fontSize: "1.1rem", fontWeight: "bold", textShadow: "0 0 20px #cc000088" }}>
            ☠  All 35 ports seized. The seas bow to you.  ☠
          </div>
        )}
        <button onClick={resetGame} style={{
          marginTop: "10px", background: "transparent", border: "1px solid #2a0808",
          color: "#3a1a1a", borderRadius: "2px", padding: "6px 18px",
          fontSize: "0.65rem", cursor: "pointer", fontFamily: "'Cinzel', serif",
          letterSpacing: "0.12em", transition: "all 0.2s", textTransform: "uppercase",
          display: "block", margin: "10px auto 0",
        }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color="#cc0000"; (e.target as HTMLElement).style.borderColor="#8B0000"; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color="#3a1a1a"; (e.target as HTMLElement).style.borderColor="#2a0808"; }}>
          ↺  Restart Journey
        </button>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, backdropFilter: "blur(6px)",
        }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "linear-gradient(160deg, #0d0000 0%, #1a0508 100%)",
            border: "1px solid #8B0000", borderRadius: "4px", padding: "36px 44px",
            textAlign: "center", maxWidth: "360px", width: "90%",
            boxShadow: "0 0 80px rgba(180,0,0,0.25), 0 30px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(180,0,0,0.2)",
            position: "relative",
          }}>
            {/* Corner decorations */}
            {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h], i) => (
              <div key={i} style={{
                position:"absolute", [v]:"0", [h]:"0", width:"12px", height:"12px",
                borderTop: v==="top" ? "1px solid #8B0000" : "none",
                borderBottom: v==="bottom" ? "1px solid #8B0000" : "none",
                borderLeft: h==="left" ? "1px solid #8B0000" : "none",
                borderRight: h==="right" ? "1px solid #8B0000" : "none",
              }} />
            ))}
            <div style={{ fontSize: "2.8rem", marginBottom: "10px" }}>🏴‍☠️</div>
            <div style={{ color: "#5a1a1a", fontSize: "0.65rem", letterSpacing: "0.3em", marginBottom: "6px" }}>
              — PORT {currentPort} OF 35 —
            </div>
            <h2 style={{
              color: "#cc0000", margin: "0 0 12px", fontSize: "1.4rem",
              letterSpacing: "0.1em", textShadow: "0 0 20px #cc000066",
            }}>Seize the Port</h2>
            <p style={{
              color: "#5a3a3a", fontFamily: "'Crimson Text', serif",
              fontSize: "0.95rem", margin: "0 0 24px", lineHeight: 1.6, fontStyle: "italic",
            }}>
              Conquer Port {currentPort} and sail the crimson tides onward to Port {currentPort + 1}. The dead leave no survivors.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: "10px 22px", borderRadius: "3px", border: "1px solid #3a1a1a",
                background: "transparent", color: "#5a3a3a", cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontSize: "0.78rem",
                letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor="#8B0000"; (e.target as HTMLElement).style.color="#cc0000"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor="#3a1a1a"; (e.target as HTMLElement).style.color="#5a3a3a"; }}>
                Retreat
              </button>
              <button onClick={handleCompleteLevel} className="btn-blood" style={{
                padding: "10px 26px", borderRadius: "3px", border: "1px solid #8B0000",
                color: "white", cursor: "pointer", fontFamily: "'Cinzel', serif",
                fontSize: "0.82rem", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase",
              }}>⚔ Conquer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}