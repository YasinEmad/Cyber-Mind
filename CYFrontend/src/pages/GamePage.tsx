import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ctfInfo from "@/utils/ctfinfo";

interface LevelData {
  level: number;
  name: string;
  description: string;
}

const keyframes = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');

@keyframes floatImage {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-8px) scale(1.02); }
}

@keyframes scanline {
  0% { top: -8%; }
  100% { top: 108%; }
}

@keyframes glitch {
  0%, 94%, 100% { clip-path: none; transform: translate(0); opacity: 1; }
  95% { clip-path: polygon(0 30%, 100% 30%, 100% 45%, 0 45%); transform: translate(-3px, 1px); opacity: 0.9; }
  97% { clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%); transform: translate(3px, -1px); opacity: 0.9; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
}

@keyframes levelPop {
  0% { transform: scale(0.6) translateY(15px); opacity: 0; }
  70% { transform: scale(1.1) translateY(-3px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes redGlow {
  0%, 100% { text-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.4); }
  50% { text-shadow: 0 0 30px rgba(239, 68, 68, 1), 0 0 60px rgba(239, 68, 68, 0.6); }
}

@keyframes matrixRain {
  0% { transform: translateY(-100vh); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes borderGlow {
  0%, 100% { border-color: rgba(239, 68, 68, 0.3); box-shadow: 0 0 20px rgba(239, 68, 68, 0.1); }
  50% { border-color: rgba(239, 68, 68, 0.8); box-shadow: 0 0 40px rgba(239, 68, 68, 0.3); }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
  33% { transform: translateY(-20px) rotate(120deg); opacity: 0.7; }
  66% { transform: translateY(-10px) rotate(240deg); opacity: 0.5; }
}
`;

function TypewriterLine({ text, delay, color, fontSize, mono }: {
  text: string;
  delay: number;
  color?: string;
  fontSize?: "small" | "large" | "normal";
  mono?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return <div style={{ height: fontSize === "small" ? 28 : fontSize === "large" ? 52 : 38 }} />;
  return (
    <div style={{
      animation: "fadeInUp 0.6s ease forwards",
      fontFamily: mono ? "'Share Tech Mono', monospace" : "'Orbitron', sans-serif",
      color: color || "#ffffff",
      fontSize: fontSize === "large" ? "2.3rem" : fontSize === "small" ? "0.9rem" : "1.1rem",
      fontWeight: fontSize === "large" ? 900 : 700,
      textAlign: "center",
      lineHeight: 1.4,
      textShadow: color === "#ef4444" ? "0 0 20px rgba(239, 68, 68, 0.8)" : color === "#dc2626" ? "0 0 15px rgba(220, 38, 38, 0.6)" : "0 0 10px rgba(255, 255, 255, 0.3)",
      marginBottom: fontSize === "large" ? 8 : 6,
      letterSpacing: mono ? "0.5px" : "1px",
    }}>
      {text}
    </div>
  );
}

function LevelGrid({ show }: { show: boolean }) {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!show) return;
    let i = 0;
    const interval = setInterval(() => {
      setRevealed(prev => [...prev, i]);
      i++;
      if (i >= 35) clearInterval(interval);
    }, 55);
    return () => clearInterval(interval);
  }, [show]);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: 7,
      marginTop: 16,
      maxWidth: 380,
      marginLeft: "auto",
      marginRight: "auto",
      position: "relative",
    }}>
      {Array.from({ length: 35 }, (_, i) => {
        const isRevealed = revealed.includes(i);
        const isFirst = i === 0;
        const levelData = ctfInfo.levels.find((level: LevelData) => level.level === i + 1);
        const levelLink = `/game/level/${i + 1}`;

        const levelSquare = (
          <div style={{
            width: "100%",
            aspectRatio: "1",
            borderRadius: 10,
            background: isRevealed ? (isFirst ? "linear-gradient(135deg,#ef4444,#dc2626)" : "#1a1a1a") : "transparent",
            border: isRevealed ? (isFirst ? "2px solid #ef4444" : "1px solid #4a4a4a") : "1px dashed #333333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            fontFamily: "'Share Tech Mono', monospace",
            color: isRevealed ? (isFirst ? "#ffffff" : "#cccccc") : "transparent",
            fontWeight: 700,
            animation: isRevealed ? "levelPop 0.4s cubic-bezier(.34,1.56,.64,1) forwards" : "none",
            boxShadow: isFirst && isRevealed ? "0 0 20px rgba(239, 68, 68, 0.6)" : "none",
            transition: "all 0.3s ease",
            cursor: isRevealed ? "pointer" : "default",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            if (isRevealed && levelData) {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
              });
              setHoveredLevel(i + 1);
              // Add hover effect to the level square
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = isFirst
                ? "0 0 25px rgba(239, 68, 68, 0.8)"
                : "0 0 15px rgba(239, 68, 68, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            setHoveredLevel(null);
            // Remove hover effect from the level square
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = isFirst && isRevealed
              ? "0 0 20px rgba(239, 68, 68, 0.6)"
              : "none";
          }}
        >
          {isRevealed ? (i + 1) : ""}
        </div>
        );

        return (
          <div key={i} style={{ width: "100%", position: "relative" }}>
            {isRevealed ? (
              <Link to={levelLink} style={{ display: "block", textDecoration: "none" }}>
                {levelSquare}
              </Link>
            ) : levelSquare}
          </div>
        );
      })}

      {/* Tooltip */}
      {hoveredLevel && (() => {
        const levelData = ctfInfo.levels.find((level: LevelData) => level.level === hoveredLevel);
        if (!levelData) return null;

        return (
          <div style={{
            position: "fixed",
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translate(-50%, -100%)",
            background: "linear-gradient(135deg, #1a1a1a, #000000)",
            border: "2px solid #ef4444",
            borderRadius: "12px",
            padding: "16px",
            minWidth: "280px",
            maxWidth: "320px",
            boxShadow: "0 0 30px rgba(239, 68, 68, 0.3), 0 10px 30px rgba(0, 0, 0, 0.8)",
            zIndex: 1000,
            animation: "fadeInUp 0.2s ease-out",
            pointerEvents: "none",
          }}>
            {/* Arrow */}
            <div style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #ef4444",
            }} />

            {/* Content */}
            <div style={{
              color: "#ef4444",
              fontSize: "0.9rem",
              fontWeight: 700,
              fontFamily: "'Orbitron', sans-serif",
              marginBottom: "8px",
              textAlign: "center",
              textShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
            }}>
              Level {levelData.level}: {levelData.name}
            </div>
            <div style={{
              color: "#ffffff",
              fontSize: "0.8rem",
              fontFamily: "'Share Tech Mono', monospace",
              lineHeight: "1.4",
              textAlign: "center",
            }}>
              {levelData.description}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function CTFMindWelcome() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => setPhase(5), 3800),
      setTimeout(() => setPhase(6), 4800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      <style>{keyframes}</style>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Matrix-style background particles */}
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: "2px",
            height: "2px",
            background: Math.random() > 0.7 ? "#ef4444" : "#666666",
            borderRadius: "50%",
            animation: `particleFloat ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            opacity: 0.3,
          }} />
        ))}

        {/* Scanline effect */}
        <div style={{
          position: "absolute",
          left: 0, right: 0,
          height: "8%",
          background: "linear-gradient(to bottom, transparent, rgba(239, 68, 68, 0.05), transparent)",
          animation: "scanline 8s linear infinite",
          pointerEvents: "none",
          zIndex: 10,
        }} />

        {/* Grid bg */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(239, 68, 68, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          pointerEvents: "none",
        }} />

        {/* Corner decorations */}
        {[
          { top: 20, left: 20 },
          { top: 20, right: 20 },
          { bottom: 20, left: 20 },
          { bottom: 20, right: 20 },
        ].map((pos, i) => (
          <div key={i} style={{
            position: "absolute",
            ...pos,
            width: 40, height: 40,
            borderTop: i < 2 ? "3px solid rgba(239, 68, 68, 0.6)" : "none",
            borderBottom: i >= 2 ? "3px solid rgba(239, 68, 68, 0.6)" : "none",
            borderLeft: (i === 0 || i === 2) ? "3px solid rgba(239, 68, 68, 0.6)" : "none",
            borderRight: (i === 1 || i === 3) ? "3px solid rgba(239, 68, 68, 0.6)" : "none",
            opacity: 0.7,
            animation: "borderGlow 3s ease-in-out infinite",
            animationDelay: `${i * 0.5}s`,
          }} />
        ))}

        <div style={{ maxWidth: 480, width: "100%", zIndex: 2 }}>
          {/* CTF Image */}
          {phase >= 1 && (
            <div style={{ animation: "fadeInUp 0.8s ease forwards", display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <img
                src="/assets/ctf-image.png"
                alt="CTF Mind"
                style={{
                  width: "280px",
                  height: "380px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 30px rgba(239, 68, 68, 0.4)) brightness(1.1) contrast(1.2)",
                  borderRadius: "8px",
                  animation: "floatImage 4s ease-in-out infinite",
                }}
              />
            </div>
          )}

          {/* Title */}
          {phase >= 2 && (
            <div style={{
              animation: "glitch 8s ease-in-out infinite",
              textAlign: "center",
              marginBottom: 6,
            }}>
              <TypewriterLine text="Welcome to" delay={0} color="#cccccc" fontSize="small" mono={false} />
              <TypewriterLine text="CTF MIND" delay={100} color="#ef4444" fontSize="large" mono={false} />
            </div>
          )}

          {phase >= 3 && (
            <div style={{
              width: 140,
              height: 3,
              background: "linear-gradient(to right, transparent, #ef4444, #dc2626, transparent)",
              margin: "12px auto 20px",
              borderRadius: 2,
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
            }} />
          )}

          {/* Messages */}
          {phase >= 3 && <TypewriterLine text="I will make this simple for you." delay={0} color="#ffffff" fontSize="normal" mono={true} />}
          {phase >= 4 && <TypewriterLine text="You have 35 challenge levels." delay={0} color="#ef4444" fontSize="normal" mono={true} />}
          {phase >= 5 && <TypewriterLine text="No level will open unless the previous one is completed." delay={0} color="#cccccc" fontSize="small" mono={true} />}
          {phase >= 6 && (
            <>
              <TypewriterLine text="You are capable of finishing this on your own." delay={0} color="#ffffff" fontSize="small" mono={true} />
              <TypewriterLine text="I believe in you." delay={200} color="#ef4444" fontSize="normal" mono={false} />
            </>
          )}

          {/* Level grid */}
          {phase >= 6 && (
            <div style={{ animation: "fadeInUp 0.6s ease 0.5s forwards", opacity: 0 }}>
              <div style={{
                textAlign: "center",
                marginTop: 32,
                fontFamily: "'Share Tech Mono', monospace",
                color: "#888888",
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 8,
                textShadow: "0 0 10px rgba(239, 68, 68, 0.2)",
              }}>
                — 35 levels —
              </div>
              <LevelGrid show={phase >= 6} />
            </div>
          )}

          {/* Start button */}
          {phase >= 6 && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 28,
              animation: "fadeInUp 0.6s ease 1.8s forwards",
              opacity: 0,
            }}>
              <button
                onClick={() => alert("Level 1 — Good luck, soldier!")}
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  border: "2px solid #ef4444",
                  color: "#ffffff",
                  padding: "14px 52px",
                  borderRadius: 12,
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "1rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 0 30px rgba(239, 68, 68, 0.4)",
                  animation: "pulse 3s ease-in-out infinite",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                }}
                onMouseEnter={e => {
                  const target = e.target as HTMLElement;
                  target.style.background = "linear-gradient(135deg, #dc2626, #b91c1c)";
                  target.style.boxShadow = "0 0 40px rgba(239, 68, 68, 0.6)";
                  target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={e => {
                  const target = e.target as HTMLElement;
                  target.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
                  target.style.boxShadow = "0 0 30px rgba(239, 68, 68, 0.4)";
                  target.style.transform = "scale(1)";
                }}
              >
                START LEVEL 1
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}