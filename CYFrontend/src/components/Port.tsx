import { PortData } from "@/utils/gameTypes";

interface PortProps {
  port: PortData;
  status: string;
  onClick: () => void;
  isAnimating: boolean;
}

export function Port({ port, status, onClick, isAnimating }: PortProps) {
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
