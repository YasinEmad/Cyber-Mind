import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface CTFHeaderProps {
  title: string;
  subtitle: string;
}

export default function CTFHeader({ title, subtitle }: CTFHeaderProps) {
  return (
    <motion.div
      className="text-center mb-16 flex flex-col items-center relative"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background decorative elements */}
      <div className="absolute -inset-8 opacity-0 group-hover:opacity-10 transition-opacity" />
      
      {/* Top accent line */}
      <motion.div
        className="w-16 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mb-6"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      {/* Decorative icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-4"
      >
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-500/10 rounded-lg blur-lg" />
          <Zap className="w-6 h-6 text-red-500 relative z-10" />
        </div>
      </motion.div>

      <motion.h1
        className="text-6xl md:text-7xl font-black mb-4 tracking-tighter mx-auto"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-lg">
          {title}
        </span>
      </motion.h1>

      {/* Bottom accent line */}
      <motion.div
        className="w-20 h-1 bg-gradient-to-r from-transparent via-red-500/60 to-transparent mb-6"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />

      <motion.p
        className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {subtitle}
      </motion.p>

      {/* Bottom decorative glow */}
      <motion.div
        className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-red-900/5 via-red-900/3 to-transparent blur-3xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      />
    </motion.div>
  );
}
