import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { Target, Code, Shield, Brain, Zap, CheckCircle } from 'lucide-react';

const CTFPlanPage: React.FC = () => {
  const learningPaths = [
    {
      phase: "Phase 1: Foundations",
      title: "Basic Security Concepts",
      description: "Master the fundamentals of cybersecurity and CTF methodology",
      skills: ["Cryptography Basics", "Network Fundamentals", "Linux Commands", "Web Security 101"],
      icon: <Brain className="w-6 h-6" />,
      color: "from-blue-600 to-blue-400"
    },
    {
      phase: "Phase 2: Core Techniques",
      title: "Exploitation & Analysis",
      description: "Learn practical hacking techniques and security analysis",
      skills: ["Penetration Testing", "Reverse Engineering", "Binary Analysis", "SQL Injection"],
      icon: <Code className="w-6 h-6" />,
      color: "from-purple-600 to-purple-400"
    },
    {
      phase: "Phase 3: Advanced Tactics",
      title: "Real-World Scenarios",
      description: "Tackle complex challenges from real CTF competitions",
      skills: ["Web Application Hacking", "System Exploitation", "Crypto Challenges", "Forensics"],
      icon: <Shield className="w-6 h-6" />,
      color: "from-red-600 to-red-400"
    }
  ];

  const methodologies = [
    { title: "Reconnaissance", description: "Gather information about the target system" },
    { title: "Scanning", description: "Identify services, ports, and vulnerabilities" },
    { title: "Enumeration", description: "Dig deeper to find potential entry points" },
    { title: "Exploitation", description: "Exploit discovered vulnerabilities ethically" },
    { title: "Privilege Escalation", description: "Gain higher-level access permissions" },
    { title: "Flag Capture", description: "Secure the flag and prove exploitation success" }
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
              backgroundSize: '40px 40px',
            }} 
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-red-900/30 to-red-900/10 border border-red-800/30">
              <Target className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Your Security Journey Starts Here</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              CTF <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Learning Plan</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
              A structured roadmap to transform you from beginner to expert ethical hacker through progressive CTF challenges
            </p>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-800/30 rounded-2xl p-8 mb-20"
          >
            <div className="flex items-start gap-4">
              <Zap className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
                <p className="text-gray-300 leading-relaxed">
                  CTF Mind trains your mind to think like a hacker and defend like a professional. Through hands-on challenges, 
                  you'll master penetration testing, cryptography, reverse engineering, and security analysis—all the skills 
                  needed to excel in Capture The Flag competitions and real-world cybersecurity careers.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Learning Paths */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-12 text-center">Three Phases to Mastery</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {learningPaths.map((path, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                  className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-red-500/50 transition-all duration-300 group"
                >
                  <div className={`inline-block p-3 rounded-lg bg-gradient-to-r ${path.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {path.icon}
                  </div>
                  <p className="text-sm font-semibold text-red-400 mb-2">{path.phase}</p>
                  <h3 className="text-2xl font-bold mb-3">{path.title}</h3>
                  <p className="text-gray-400 mb-6">{path.description}</p>
                  <div className="space-y-2">
                    {path.skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTF Methodology */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold mb-12 text-center">The CTF Methodology</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {methodologies.map((method, idx) => (
                <div
                  key={idx}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-all duration-300" />
                  <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-all duration-300">
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <h4 className="text-xl font-bold mb-2">{method.title}</h4>
                    <p className="text-gray-400">{method.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-800/30 rounded-2xl p-12"
          >
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-red-400 mb-2">35+</div>
                <p className="text-gray-400">Challenges</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-400 mb-2">3</div>
                <p className="text-gray-400">Learning Phases</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-400 mb-2">6</div>
                <p className="text-gray-400">Core Methodologies</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-400 mb-2">100%</div>
                <p className="text-gray-400">Hands-On Learning</p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center mt-20"
          >
            <p className="text-gray-400 mb-6">Ready to start your CTF journey?</p>
            <a href="/game" className="inline-block">
              <button className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-600/50">
                Begin CTF Challenges
              </button>
            </a>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CTFPlanPage;
