import React from 'react';
import { motion } from 'framer-motion';
import { Challenge, ChallengeDifficulty } from '../types';
import { Play, CheckCircle2, Zap, Shield, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

type ChallengeCardProps = {
  challenge: Challenge & { solved?: boolean };
  index: number;
  solved?: boolean;
};

const difficultyConfig: Record<ChallengeDifficulty, {
  label: string;
  icon: React.ReactNode;
  bar: string;
  badge: string;
  badgeText: string;
  glow: string;
  borderHover: string;
}> = {
  [ChallengeDifficulty.Easy]: {
    label: 'Easy',
    icon: <Shield size={11} />,
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-950/60 border-emerald-800/50',
    badgeText: 'text-emerald-400',
    glow: 'hover:shadow-[0_8px_32px_rgba(16,185,129,0.08)]',
    borderHover: 'hover:border-emerald-800/60',
  },
  [ChallengeDifficulty.Medium]: {
    label: 'Medium',
    icon: <Zap size={11} />,
    bar: 'bg-amber-500',
    badge: 'bg-amber-950/60 border-amber-800/50',
    badgeText: 'text-amber-400',
    glow: 'hover:shadow-[0_8px_32px_rgba(245,158,11,0.08)]',
    borderHover: 'hover:border-amber-800/60',
  },
  [ChallengeDifficulty.Hard]: {
    label: 'Hard',
    icon: <Flame size={11} />,
    bar: 'bg-red-500',
    badge: 'bg-red-950/60 border-red-800/50',
    badgeText: 'text-red-400',
    glow: 'hover:shadow-[0_8px_32px_rgba(239,68,68,0.1)]',
    borderHover: 'hover:border-red-800/60',
  },
};

const ChallengeCard: React.FC<ChallengeCardProps> = React.memo(({ challenge, index, solved }) => {
  const cfg = difficultyConfig[challenge.difficulty] ?? difficultyConfig[ChallengeDifficulty.Easy];
  const challengeId = challenge.uuid || challenge.id || challenge._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.5) }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative flex flex-col bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-300 ${cfg.glow} ${cfg.borderHover}`}
      style={{ background: 'linear-gradient(160deg, #0c0c0c 0%, #080808 100%)' }}
    >
      {/* Top color bar */}
      <div className={`h-0.5 w-full ${cfg.bar} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Subtle inner sheen on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex flex-col flex-1 p-5">

        {/* Top row: difficulty + solved badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${cfg.badge} ${cfg.badgeText}`}>
            {cfg.icon}
            {cfg.label}
          </span>

          {solved && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 size={10} />
              Solved
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-white leading-snug tracking-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-orange-400 transition-all duration-300 line-clamp-2">
          {challenge.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 flex-1 group-hover:text-zinc-400 transition-colors duration-300">
          {challenge.description || 'Complete this challenge to prove your mettle and earn points. High-stakes execution required.'}
        </p>

        {/* CTA */}
        <Link
          to={`/challenges/${challengeId}`}
          className="relative mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-black/60 text-white text-[11px] font-black tracking-widest uppercase overflow-hidden transition-all duration-300 group/btn hover:border-red-800/60"
        >
          {/* Fill on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          <Play size={12} className="relative fill-current" />
          <span className="relative">Start Challenge</span>
        </Link>
      </div>
    </motion.div>
  );
});

export default ChallengeCard;