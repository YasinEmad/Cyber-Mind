import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Zap, Lightbulb, Clock, Shield, ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  activeLeftTab: 'challenge' | 'recommendations' | 'hints';
  setActiveLeftTab: (tab: 'challenge' | 'recommendations' | 'hints') => void;
  chFromStore: any;
  hintsList: any[];
  revealedHints: Set<number>; // Fixed: matching the number type from your hook
  toggleHint: (id: number) => void; // Fixed: matching the number type from your hook
}

const ChallengeSidebar: React.FC<SidebarProps> = ({
  activeLeftTab,
  setActiveLeftTab,
  chFromStore,
  hintsList,
  revealedHints,
  toggleHint
}) => {
  return (
    <div className="flex flex-col h-full border-r border-gray-700 bg-black flex-shrink-0 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 bg-black">
        {[
          { id: 'challenge', icon: AlertTriangle, label: 'Challenge', color: 'text-red-400' },
          { id: 'recommendations', icon: Zap, label: 'Fix', color: 'text-yellow-400' },
          { id: 'hints', icon: Lightbulb, label: 'Hints', color: 'text-orange-400' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLeftTab(tab.id as any)}
            className={`flex-1 py-3.5 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-all relative ${
              activeLeftTab === tab.id 
                ? 'border-red-500 text-white bg-black' 
                : 'border-transparent text-white hover:text-white hover:bg-black'
            }`}
          >
            <tab.icon size={16} className={activeLeftTab === tab.id ? tab.color : ''} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-black">
        <AnimatePresence mode="wait">
          {activeLeftTab === 'challenge' && (
            <motion.div 
              key="challenge" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <h3 className="text-base font-bold text-white">Vulnerability Details</h3>
              </div>
              
              <div className="bg-black/50 border border-gray-700 rounded-lg p-5 shadow-xl shadow-black/50">
                <p className="text-sm text-white leading-relaxed">
                  {chFromStore?.challengeDetails || 'No challenge details provided.'}
                </p>
              </div>

              <div className="bg-black/30 border border-gray-700/30 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-white" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wide">Your Mission</span>
                </div>
                <p className="text-xs text-white leading-relaxed">
                  Identify and fix the security vulnerability in the code editor. Run tests to validate your solution.
                </p>
              </div>
            </motion.div>
          )}

          {activeLeftTab === 'recommendations' && (
            <motion.div 
              key="recommendations" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <Zap size={18} className="text-yellow-400" />
                </div>
                <h3 className="text-base font-bold text-white">Security Best Practices</h3>
              </div>
              
              <div className="bg-black border border-gray-700 rounded-lg p-5 shadow-xl shadow-black/50">
                <p className="text-sm text-white leading-relaxed whitespace-pre-line">
                  {chFromStore?.recommendation || 'No recommendations provided.'}
                </p>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} className="text-white" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wide">Pro Tip</span>
                </div>
                <p className="text-xs text-white leading-relaxed">
                  Apply these security principles to prevent similar vulnerabilities in production code.
                </p>
              </div>
            </motion.div>
          )}

          {activeLeftTab === 'hints' && (
            <motion.div 
              key="hints" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <Lightbulb size={18} className="text-orange-400" />
                </div>
                <h3 className="text-base font-bold text-white">Available Hints</h3>
              </div>

              {hintsList.length === 0 ? (
                <div className="text-center py-12 text-white">
                  <Lightbulb size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hints available for this challenge</p>
                </div>
              ) : (
                hintsList.map((hint) => (
                  <motion.div 
                    key={hint.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black border border-gray-700 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-orange-500/20"
                  >
                    <button 
                      onClick={() => toggleHint(hint.id)} 
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-700/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-700 rounded-lg border border-gray-600">
                          <Lightbulb size={16} className="text-orange-400" />
                        </div>
                        <div>
                          <span className="font-semibold text-white text-sm block">{hint.title}</span>
                          <span className="text-[11px] text-white">Click to {revealedHints.has(hint.id) ? 'hide' : 'reveal'}</span>
                        </div>
                      </div>
                      <ChevronRight 
                        size={16} 
                        className={`text-white transition-all duration-300 ${
                          revealedHints.has(hint.id) ? 'rotate-90 text-orange-400' : ''
                        }`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {revealedHints.has(hint.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-700 overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-3 bg-black text-sm text-white leading-relaxed">
                            {hint.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChallengeSidebar;