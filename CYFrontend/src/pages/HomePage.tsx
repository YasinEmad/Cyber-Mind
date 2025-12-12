import { motion, Variants } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { PlayCircle, ShieldCheck, Puzzle,  } from 'lucide-react';
import Lottie from 'lottie-react';
import heroAnimationJson from '/home/yasin/Cyber-Mind/CYFrontend/public/assets/Untitled file.json'; // Lottie JSON

// =================================================================
// --- ANIMATION VARIANTS ---
// =================================================================
const heroText: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.05 } },
};

const word: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 12, stiffness: 100, mass: 0.5 } },
};

// =================================================================
// --- COMPONENTS ---
// =================================================================
const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span className="text-red-400 font-semibold drop-shadow-[0_0_4px_#ff4d4d]">
    {children}
  </span>
);

const AnimatedUnderline: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={`relative inline-block ${className || ''}`}>
    {children}
    <motion.span
      className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-red-400 to-red-600"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    />
  </span>
);

// =================================================================
// --- MAIN HOME PAGE COMPONENT ---
// =================================================================
const HomePage: React.FC = () => {
  const welcomeText = "Welcome to Cyber Mind";

  return (
    <PageWrapper>
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] overflow-hidden">
        {/* Ambient Grid */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #f87171 1px, transparent 1px),
                                linear-gradient(to bottom, #f87171 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Hero Text */}
        <div className="text-center z-10 max-w-6xl mx-auto">
          <motion.h1
  className="text-3xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight"
  variants={heroText}
  initial="hidden"
  animate="visible"
>
  {welcomeText.split(" ").map((wordStr, index) => (
    <motion.span
      key={wordStr + "-" + index}
      variants={word}
      className={`inline-block mr-2 last:mr-0 ${
        index === 2
          ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-600'
          : 'text-white'
      }`}
    >
      {wordStr}
    </motion.span>
  ))}
</motion.h1>


          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            A <Highlight>curated experience</Highlight> for
            <AnimatedUnderline className="ml-1 mr-1">engagement puzzles</AnimatedUnderline>,
            <AnimatedUnderline className="ml-1 mr-1">security challenges</AnimatedUnderline>,
            <AnimatedUnderline className="ml-1 mr-1">learning through play</AnimatedUnderline>, and more.

            <br /><br />

            <AnimatedUnderline
              className="text-3xl font-bold text-red-500 drop-shadow-[0_0_8px_#ff4d4d]"
            >
              For free
            </AnimatedUnderline>
          </motion.p>
        </div>

        {/* Feature Cards & Lottie */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 z-10 mt-4">
          {/* Left Card */}
          <motion.div className="bg-[#0A0A0A] p-8 rounded-2xl shadow-2xl w-72 min-h-[300px] text-white flex flex-col items-center border border-gray-700/50 transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.03] hover:border-red-500/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.7)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, type: "spring", stiffness: 100 }}
          >
            <PlayCircle className="w-10 h-10 mb-4 text-red-500" />
            <h3 className="text-2xl font-extrabold mb-1 tracking-wider">Puzzles</h3>
            <p className="text-gray-300 text-sm text-center mt-2">
              Jump into exciting challenges and improve your skills.
            </p>
            <div className="mt-4 px-4 py-1 bg-red-600/20 text-red-300 text-xs font-semibold rounded-full">
              Ready to Play
            </div>
          </motion.div>

          {/* Lottie Animation */}
          <motion.div className="w-[300px] md:w-[400px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Lottie animationData={heroAnimationJson} loop autoplay className="w-full h-full" />
          </motion.div>

          {/* Right Card */}
          <motion.div className="bg-[#0A0A0A] p-8 rounded-2xl shadow-2xl w-72 min-h-[300px] text-white flex flex-col items-center border border-gray-700/50 transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.03] hover:border-red-500/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.7)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, type: "spring", stiffness: 100 }}
          >
            <ShieldCheck className="w-10 h-10 mb-4 text-red-500" />
            <h3 className="text-2xl font-extrabold mb-1 tracking-wider">CHALLENGES</h3>
            <p className="text-gray-300 text-sm text-center mt-2">
              Test your strategies and solve complex puzzles to level up.
            </p>
            <div className="mt-4 px-4 py-1 bg-red-600/20 text-red-300 text-xs font-semibold rounded-full">
              Start Exploring
            </div>
          </motion.div>
        </div>

        {/* Center Card */}
        <motion.div className="bg-[#0A0A0A] p-8 rounded-2xl shadow-2xl w-72 min-h-[250px] text-white flex flex-col items-center border border-gray-700/50 transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.03] hover:border-red-500/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.7)] mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, type: "spring", stiffness: 100 }}
        >
          <Puzzle className="w-10 h-10 mb-4 text-red-500" />
          <h3 className="text-2xl font-extrabold mb-1 tracking-wider">Mini Games</h3>
          <p className="text-gray-300 text-sm text-center mt-2">
            Explore quick mini games to sharpen your skills.
          </p>
          <div className="mt-4 px-4 py-1 bg-red-600/20 text-red-300 text-xs font-semibold rounded-full">
            Play Now
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default HomePage;
