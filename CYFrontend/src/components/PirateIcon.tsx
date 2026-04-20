interface PirateIconProps {
  size?: number;
}

export function PirateIcon({ size = 32 }: PirateIconProps) {
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
