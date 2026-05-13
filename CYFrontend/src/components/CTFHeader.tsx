import { motion } from "framer-motion";

interface CTFHeaderProps {
  title: string;
  subtitle: string;
}

export default function CTFHeader({ title, subtitle }: CTFHeaderProps) {
  return (
    <motion.div
      className="text-center mb-12 flex flex-col items-center"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1
        className="text-5xl md:text-6xl font-bold mb-4 tracking-tight mx-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          {title}
        </span>
      </motion.h1>

      <motion.p
        className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}
