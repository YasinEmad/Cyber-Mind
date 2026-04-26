import React, { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Target, Code, Shield, Brain, Zap, CheckCircle, ArrowRight, Lock, Trophy, Users, Clock, Star, ChevronDown } from 'lucide-react';

const CTFPlanPage: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const learningPaths = [
    {
      phase: "Phase 1: Foundations",
      title: "Basic Security Concepts",
      description: "Master the fundamentals of cybersecurity and CTF methodology",
      skills: ["Cryptography Basics", "Network Fundamentals", "Linux Commands", "Web Security 101"],
      icon: <Brain className="w-8 h-8" />,
      color: "from-blue-600 to-blue-400",
      bgColor: "from-blue-900/20 to-blue-800/10",
      borderColor: "border-blue-500/30",
      hoverBorder: "hover:border-blue-400/60",
      stats: { duration: "2-3 weeks", difficulty: "Beginner", challenges: 12 }
    },
    {
      phase: "Phase 2: Core Techniques",
      title: "Exploitation & Analysis",
      description: "Learn practical hacking techniques and security analysis",
      skills: ["Penetration Testing", "Reverse Engineering", "Binary Analysis", "SQL Injection"],
      icon: <Code className="w-8 h-8" />,
      color: "from-purple-600 to-purple-400",
      bgColor: "from-purple-900/20 to-purple-800/10",
      borderColor: "border-purple-500/30",
      hoverBorder: "hover:border-purple-400/60",
      stats: { duration: "3-4 weeks", difficulty: "Intermediate", challenges: 15 }
    },
    {
      phase: "Phase 3: Advanced Tactics",
      title: "Real-World Scenarios",
      description: "Tackle complex challenges from real CTF competitions",
      skills: ["Web Application Hacking", "System Exploitation", "Crypto Challenges", "Forensics"],
      icon: <Shield className="w-8 h-8" />,
      color: "from-red-600 to-red-400",
      bgColor: "from-red-900/20 to-red-800/10",
      borderColor: "border-red-500/30",
      hoverBorder: "hover:border-red-400/60",
      stats: { duration: "4-6 weeks", difficulty: "Advanced", challenges: 8 }
    }
  ];

  const methodologies = [
    { title: "Reconnaissance", description: "Gather information about the target system", icon: <Target className="w-6 h-6" />, color: "text-blue-400" },
    { title: "Scanning", description: "Identify services, ports, and vulnerabilities", icon: <Zap className="w-6 h-6" />, color: "text-green-400" },
    { title: "Enumeration", description: "Dig deeper to find potential entry points", icon: <Users className="w-6 h-6" />, color: "text-yellow-400" },
    { title: "Exploitation", description: "Exploit discovered vulnerabilities ethically", icon: <Lock className="w-6 h-6" />, color: "text-red-400" },
    { title: "Privilege Escalation", description: "Gain higher-level access permissions", icon: <ArrowRight className="w-6 h-6" />, color: "text-purple-400" },
    { title: "Flag Capture", description: "Secure the flag and prove exploitation success", icon: <Trophy className="w-6 h-6" />, color: "text-orange-400" }
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden relative">
        {/* Enhanced Background */}
        <motion.div 
          className="fixed inset-0 pointer-events-none"
          style={{ y: backgroundY }}
        >
          <div className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
              backgroundSize: '40px 40px',
            }} 
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/3 rounded-full blur-[150px]" />
          
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          {/* Scroll Indicator */}
          <motion.div 
            className="fixed top-20 right-8 z-50 hidden lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-1 h-20 bg-gradient-to-b from-red-600/50 to-transparent rounded-full relative">
                <motion.div 
                  className="w-1 bg-gradient-to-b from-red-400 to-red-600 rounded-full absolute top-0"
                  style={{ height: scrollYProgress.get() * 100 + '%' }}
                />
              </div>
              <ChevronDown className="w-4 h-4 text-red-400 animate-bounce" />
            </div>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24 relative"
          >
            {/* Animated background glow */}
            <motion.div
              className="absolute inset-0 -z-10"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)',
                ]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-8 px-6 py-3 rounded-full bg-gradient-to-r from-red-900/30 to-red-900/10 border border-red-800/30 backdrop-blur-sm"
            >
              <Target className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-red-300">Your Security Journey Starts Here</span>
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-7xl font-bold mb-8 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              CTF <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">Learning Plan</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              A structured roadmap to transform you from beginner to expert ethical hacker through progressive CTF challenges
            </motion.p>

            {/* Progress indicator */}
            <motion.div 
              className="flex justify-center items-center gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex gap-2">
                {[1, 2, 3].map((phase) => (
                  <motion.button
                    key={phase}
                    onClick={() => setActivePhase(phase)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activePhase === phase ? 'bg-red-500 scale-125' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-r from-red-900/20 via-orange-900/20 to-purple-900/20 border border-red-800/30 rounded-3xl p-10 mb-24 backdrop-blur-sm relative overflow-hidden"
          >
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-5"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                backgroundSize: '50% 50%',
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-start gap-6">
              <motion.div
                className="flex-shrink-0"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-600/50">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              
              <div className="flex-1">
                <motion.h3 
                  className="text-3xl font-bold mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Our <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Mission</span>
                </motion.h3>
                
                <motion.p 
                  className="text-gray-300 leading-relaxed text-lg mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  CTF Mind trains your mind to think like a hacker and defend like a professional. Through hands-on challenges, 
                  you'll master penetration testing, cryptography, reverse engineering, and security analysis—all the skills 
                  needed to excel in Capture The Flag competitions and real-world cybersecurity careers.
                </motion.p>

                <motion.div 
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-900/20 rounded-full border border-red-800/30">
                    <Target className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-300">Ethical Hacking</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 rounded-full border border-blue-800/30">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-300">Security Defense</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/20 rounded-full border border-purple-800/30">
                    <Code className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-300">Technical Skills</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Learning Paths */}
          <div className="mb-24">
            <motion.h2 
              className="text-5xl font-bold mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Three Phases to <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Mastery</span>
            </motion.h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {learningPaths.map((path, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className={`relative group cursor-pointer ${hoveredCard === idx ? 'z-20' : 'z-10'}`}
                  onHoverStart={() => setHoveredCard(idx)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  {/* Glow effect */}
                  <motion.div
                    className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 bg-gradient-to-r ${path.color}`}
                    animate={hoveredCard === idx ? { scale: 1.05 } : { scale: 1 }}
                  />

                  <div className={`relative bg-gradient-to-br ${path.bgColor} border ${path.borderColor} ${path.hoverBorder} rounded-3xl p-8 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl backdrop-blur-sm`}>
                    {/* Phase indicator */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`inline-block p-4 rounded-2xl bg-gradient-to-r ${path.color} text-white shadow-lg`}>
                        {path.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-400">{path.phase.split(':')[0]}</div>
                        <div className="text-xs text-gray-500">{path.stats.duration}</div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">{path.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{path.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-black/20 rounded-xl">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{path.stats.challenges}</div>
                        <div className="text-xs text-gray-400">Challenges</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{path.stats.difficulty}</div>
                        <div className="text-xs text-gray-400">Level</div>
                      </div>
                      <div className="text-center">
                        <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="text-xs text-gray-400">Rated</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-3">
                      {path.skills.map((skill, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * i }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-sm">{skill}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <motion.div 
                      className="mt-6 pt-4 border-t border-gray-700/50"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>0%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <motion.div 
                          className={`h-2 rounded-full bg-gradient-to-r ${path.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: "0%" }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.7, duration: 1 }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTF Methodology */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-24"
          >
            <motion.h2 
              className="text-5xl font-bold mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              The <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">CTF Methodology</span>
            </motion.h2>
            
            <div className="relative">
              {/* Connection lines */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 transform -translate-y-1/2 opacity-20" />
              
              <div className="grid md:grid-cols-3 gap-8">
                {methodologies.map((method, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="group relative"
                  >
                    {/* Arrow for connection */}
                    {idx < methodologies.length - 1 && (
                      <motion.div 
                        className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                      >
                        <ArrowRight className="w-8 h-8 text-purple-400" />
                      </motion.div>
                    )}

                    <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/10">
                      {/* Step number */}
                      <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {idx + 1}
                      </div>

                      {/* Icon */}
                      <div className={`inline-block p-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 text-white mb-4 ${method.color} group-hover:scale-110 transition-transform duration-300`}>
                        {method.icon}
                      </div>

                      <h4 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">{method.title}</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{method.description}</p>

                      {/* Progress indicator */}
                      <motion.div 
                        className="mt-4 flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                      >
                        <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">Step {idx + 1}</span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-red-900/20 via-purple-900/20 to-blue-900/20 border border-red-800/30 rounded-3xl p-12 mb-24 backdrop-blur-sm relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{
                background: [
                  'linear-gradient(45deg, rgba(239, 68, 68, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)',
                  'linear-gradient(45deg, rgba(168, 85, 247, 0.1) 0%, rgba(239, 68, 68, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)',
                  'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(239, 68, 68, 0.1) 100%)',
                ]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />

            <div className="relative z-10 grid md:grid-cols-4 gap-8 text-center">
              <motion.div 
                className="group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-5xl font-bold text-red-400 mb-3 group-hover:text-red-300 transition-colors">35+</div>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Challenges</p>
                <div className="w-12 h-1 bg-red-500/50 mx-auto mt-2 rounded-full group-hover:bg-red-400 transition-colors" />
              </motion.div>
              
              <motion.div 
                className="group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-5xl font-bold text-blue-400 mb-3 group-hover:text-blue-300 transition-colors">3</div>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Learning Phases</p>
                <div className="w-12 h-1 bg-blue-500/50 mx-auto mt-2 rounded-full group-hover:bg-blue-400 transition-colors" />
              </motion.div>
              
              <motion.div 
                className="group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-5xl font-bold text-purple-400 mb-3 group-hover:text-purple-300 transition-colors">6</div>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Core Methodologies</p>
                <div className="w-12 h-1 bg-purple-500/50 mx-auto mt-2 rounded-full group-hover:bg-purple-400 transition-colors" />
              </motion.div>
              
              <motion.div 
                className="group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-5xl font-bold text-green-400 mb-3 group-hover:text-green-300 transition-colors">100%</div>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Hands-On Learning</p>
                <div className="w-12 h-1 bg-green-500/50 mx-auto mt-2 rounded-full group-hover:bg-green-400 transition-colors" />
              </motion.div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-3xl font-bold mb-4">Ready to Start Your <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">CTF Journey</span>?</h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Join thousands of ethical hackers who have transformed their careers through our comprehensive CTF learning platform
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.a 
                href="/game" 
                className="group relative inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300" />
                <button className="relative px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-full transition-all duration-300 transform shadow-lg shadow-red-600/50 flex items-center gap-3">
                  <Trophy className="w-5 h-5" />
                  Begin CTF Challenges
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.a>

              <motion.button
                className="px-8 py-4 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-full transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-5 h-5" />
                Join Community
              </motion.button>
            </motion.div>

            {/* Additional info */}
            <motion.div 
              className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Self-paced learning</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>Expert mentorship</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>Certificate upon completion</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CTFPlanPage;
