import React from 'react';
import { motion, Variants } from 'framer-motion';
// Use a more modern/solid set of icons for better visual weight
import { Brain, Swords, Crown, Zap } from 'lucide-react'; 

// --- 1. Animation Variants (Refined for more satisfying snap) ---

const containerVariants: Variants = {
    offscreen: {}, // No need for transition here, just let children handle it
    onscreen: {
        transition: { 
            staggerChildren: 0.1, 
            delayChildren: 0.1 // Add a slight delay for better title-to-card flow
        }
    }
};

const itemVariants: Variants = {
    offscreen: { 
        y: 60, // Increased lift distance
        opacity: 0,
        scale: 0.9, // More noticeable scale change
    },
    onscreen: { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        transition: { 
            type: "spring", 
            stiffness: 100, // Make it a bit stiffer (more "snappy")
            damping: 15,
            restDelta: 0.001,
            duration: 0.7, 
        } 
    }
};

// --- 2. Professional & Minimal Feature Card Component (Enhanced Polish) ---

interface FeatureCardProps {
    icon: React.ReactNode;
    text: string;
    description: string;
    index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, text, description, index }) => {
    // Determine a dynamic background gradient color based on index for variety
    const gradientClass = index === 0 
        ? 'from-blue-900/40 to-gray-800/70' 
        : index === 1 
        ? 'from-red-900/40 to-gray-800/70' 
        : 'from-green-900/40 to-gray-800/70';

    const accentColor = index === 0 
        ? 'text-blue-400' 
        : index === 1 
        ? 'text-red-400' 
        : 'text-green-400';
        
    const hoverBorderColor = index === 0 
        ? 'hover:border-blue-500/80' 
        : index === 1 
        ? 'hover:border-red-500/80' 
        : 'hover:border-green-500/80';

    return (
        <motion.div
            className={`
                w-full h-auto p-8 rounded-xl shadow-2xl
                // Core Design: Added subtle gradient for depth
                bg-gradient-to-br ${gradientClass}
                border border-gray-700/70 
                flex flex-col justify-start items-start 
                transition-all duration-300 ease-out
                transform ${hoverBorderColor}
                cursor-pointer
            `}
            whileHover={{
                y: -8, // Increased lift on hover
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)', // Deeper, wider shadow
            }}
            
            variants={itemVariants} 
            custom={index} 
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.3 }}
        >
            {/* Icon with a small background for pop */}
            <div className={`
                p-3 rounded-full mb-5 
                bg-white/5 border border-white/10
                ${accentColor} text-3xl
            `}>
                {icon}
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {text}
            </h3>
            
            <p className="text-md text-gray-400 flex-grow font-light leading-relaxed">
                {description}
            </p>
            
            {/* Call to Action (CTA) styling change for better contrast */}
            <div className={`mt-6 text-sm font-semibold flex items-center ${accentColor} transition-colors`}>
                <span className="border-b-2 border-transparent hover:border-current pb-0.5">
                    Explore Details
                </span>
                <Zap className="w-4 h-4 ml-2" />
            </div>
        </motion.div>
    );
};

// --- 3. Main Component (Added Subtle Background Texture/Pattern) ---

const FeatureSection: React.FC = () => {
    const features = [
        { 
            icon: <Brain />, // Updated icon for "Intelligent"
            text: "Intelligent Algorithms", 
            description: "Engage your mind with complex, multi-layered problems designed to challenge even the sharpest intellects.", 
        },
        { 
            icon: <Swords />, 
            text: "High-Stakes Competitions", // Re-worded for better professional feel
            description: "Test your skills against fierce, time-limited battles and strategic simulations for ultimate glory.", 
        },
        { 
            icon: <Crown />, // Updated icon for "Elite"
            text: "Elite Global Ranking", // Re-worded for better professional feel
            description: "Ascend the ranks and earn your place among the elite on our constantly updated, competitive ranking system.", 
        },
    ];

    return (
        <section 
            id="main-features"
            className="
                py-24 md:py-36 
                flex flex-col justify-center items-center 
                relative 
                // Deep black background with a very subtle overlay/pattern for interest
                bg-[#0A0A0A] 
                // Optional: You could use a subtle repeating pattern here via CSS/Tailwind utilities
                // e.g., bg-pattern-dots (if you have a custom utility) or just keep it clean black
            "
        >
            {/* Title Section */}
            <motion.div
                className="text-center mb-16 px-4"
                initial={{ opacity: 0, y: -30 }} // Increased lift for the title
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8 }} // Slower transition for the main title
            >
                <h2 className="
                    text-4xl md:text-6xl font-black text-white mb-4 
                    tracking-tight uppercase // Make the title bolder
                ">
                    The Platform Advantage
                </h2>
                <p className="
                    text-xl text-gray-300 max-w-4xl mx-auto 
                    font-normal // Slightly thicker font for readability on dark background
                ">
                    Harness the power of cutting-edge technology to accelerate your growth and dominate the competition.
                </p>
            </motion.div>

            {/* Features Container */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl w-full px-6" // Wider container, increased gap
                variants={containerVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.3 }}
            >
                {features.map((feature, index) => (
                    <FeatureCard 
                        key={index}
                        icon={feature.icon}
                        text={feature.text}
                        description={feature.description}
                        index={index}
                    />
                ))}
            </motion.div>
        </section>
    );
};

export default FeatureSection;