import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { PlayCircle, ShieldCheck, Puzzle, Sparkles } from 'lucide-react';
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

const buttonsContainer: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.4, staggerChildren: 0.1 } },
};

const buttonItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// Animated Underline
const AnimatedUnderline: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="relative inline-block">
    {children}
    <motion.span
      className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-red-400 to-red-600"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
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
        {/* Ambient Grid Pattern */}
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
       <div className="text-center z-10 p-6 max-w-6xl mx-auto">
          <motion.h1
            className="text-4xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tight"
            variants={heroText}
            initial="hidden"
            animate="visible"
          >
            {welcomeText.split(" ").map((wordStr, index) => (
              <motion.span
                key={wordStr + "-" + index}
                variants={word}
                className={`inline-block mr-2 last:mr-0 ${index === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-600' : 'text-white'}`}              >
                {wordStr}
                {index === 2 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="absolute -right-2 -top-2"
                  >
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-red-300" />                  </motion.span>
                )}
              </motion.span>
            ))}
          </motion.h1>

          {/* Hero Description */}
           <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 font-light leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            A <span className="text-red-300 font-semibold">curated experience</span> for{" "}
            <AnimatedUnderline>competitive engagement</AnimatedUnderline>,{" "}
            <AnimatedUnderline>strategic challenges</AnimatedUnderline>, and{" "}
            <AnimatedUnderline>continuous skill refinement</AnimatedUnderline>.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 md:gap-6 max-w-4xl mx-auto"
            variants={buttonsContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={buttonItem}>
              <Link
                to="/game"
                className="group flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-black font-bold rounded-lg transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 whitespace-nowrap transform hover:-translate-y-0.5 text-base"
              >
                <PlayCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:scale-105 transition-transform">Start Game</span>
              </Link>
            </motion.div>

            <motion.div variants={buttonItem}>
              <Link
                to="/puzzles"
                className="group flex items-center justify-center px-6 py-3 bg-transparent border-2 border-red-500/50 hover:border-red-400 text-red-300 hover:text-red-200 font-bold rounded-lg transition-all duration-300 hover:bg-red-500/10 whitespace-nowrap transform hover:-translate-y-0.5 text-base"
              >
                <Puzzle className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                <span>Solve Puzzles</span>
              </Link>
            </motion.div>

            <motion.div variants={buttonItem}>
              <Link
                to="/challenges"
                className="group flex items-center justify-center px-6 py-3 bg-gray-900/50 hover:bg-gray-900 text-white hover:text-red-300 font-bold rounded-lg transition-all duration-300 border border-gray-800 hover:border-red-500/50 whitespace-nowrap transform hover:-translate-y-0.5 backdrop-blur-sm text-base"
              >
                <ShieldCheck className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Explore Challenges</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Lottie Animation After Hero */}
     {/* Lottie Animation With Feature Cards */}
<div className="mt-12 flex flex-col md:flex-row items-center justify-center w-full gap-8 z-10">

  {/* Left Feature Card */}
<div className="mt-12 flex flex-col items-center w-full gap-8 px-6">
  
  {/* Top Row */}
  <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8">
    {/* Left Card */}
    <motion.div
      className="bg-[#0A0A0A] p-8 rounded-2xl shadow-2xl w-72 min-h-[300px] text-white flex flex-col items-center border border-gray-700/50 transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.03] hover:border-red-500/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.7)]"
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
    <motion.div
      className="w-[300px] md:w-[400px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      <Lottie animationData={heroAnimationJson} loop autoplay className="w-full h-full" />
    </motion.div>

    {/* Right Card */}
    <motion.div
      className="bg-[#0A0A0A] p-8 rounded-2xl shadow-2xl w-72 min-h-[300px] text-white flex flex-col items-center border border-gray-700/50 transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.03] hover:border-red-500/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.7)]"
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

  {/* New Center Card */}
  <motion.div
    className="bg-[#0A0A0A] p-8 rounded-2xl shadow-2xl w-72 min-h-[250] text-white flex flex-col items-center
     border border-gray-700/50 transition-all duration-300 ease-in-out
      cursor-pointer hover:scale-[1.03] hover:border-red-500/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.7)]"
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







</div>
      </div>
    </PageWrapper>
  );
};

export default HomePage;
