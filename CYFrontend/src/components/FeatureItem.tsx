import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';

interface FeatureItemProps {
  animationData: any;
  title: string;
  desc: string;
  btnText?: string;
  index: number;
  link?: string; // optional prop for URL
}

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const FeatureItem: React.FC<FeatureItemProps> = ({
  animationData,
  title,
  desc,
  btnText,
  index,
  link = "#"
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={scaleIn}
    transition={{ delay: index * 0.2 }}
    className="flex flex-col items-center text-center p-4 group"
  >
    {/* Animation Container - Scaled up for focus */}
    <div className="mb-8 w-48 h-48 md:w-56 md:h-56 relative flex justify-center items-center">
      {/* Subtle background glow that reacts to group hover */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
        className="absolute inset-0 bg-red-600/5 blur-[60px] rounded-full group-hover:bg-red-600/10 transition-colors duration-700"
      />

      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 15,
          delay: index * 0.2 + 0.1
        }}
      >
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className="w-full h-full drop-shadow-[0_0_20px_rgba(239,68,68,0.2)] group-hover:drop-shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-500"
        />
      </motion.div>
    </div>

    {/* Text Content */}
    <motion.h3
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay: index * 0.2 + 0.4 }}
      className="text-2xl font-bold tracking-tight mb-4 text-white group-hover:text-red-500 transition-colors duration-300"
    >
      {title}
    </motion.h3>
    <motion.p
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay: index * 0.2 + 0.5 }}
      className="text-gray-400 text-base leading-relaxed mb-8 max-w-sm"
    >
      {desc}
    </motion.p>

    {/* Minimalist Button with Link */}
    {btnText && (
      <Link to={link || "#"}>
        <motion.button
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ delay: index * 0.2 + 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative overflow-hidden px-6 py-2 border-b-2 border-red-600/50 hover:border-red-500 text-red-500 font-bold uppercase tracking-widest text-xs transition-all duration-300"
        >
          {btnText}
        </motion.button>
      </Link>
    )}
  </motion.div>
);

export default FeatureItem;