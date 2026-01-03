import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Shield, Play, RotateCcw, Terminal,
  Beaker, CheckCircle, AlertTriangle,
  Zap, ChevronRight, XCircle, Lightbulb,
  Maximize2, Minimize2, Info, Award,
  Clock, Code2, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { usePlayChallenge } from '../lib/usePlayChallenge';

const PlayChallengePage: React.FC = () => {
  const {
    challengeId, code, output, activeLeftTab, setActiveLeftTab,
    activeBottomTab, setActiveBottomTab, testResults, isRunning,
    revealedHints, hintsList, chFromStore,
    handleEditorChange, handleReset, toggleHint, handleRun, handleTest
  } = usePlayChallenge();

  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = React.useState(false);
  const [isFullScreenEditor, setIsFullScreenEditor] = React.useState(false);

  const passedTests = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length;
  const allTestsPassed = totalTests > 0 && passedTests === totalTests;

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-black to-black text-white font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-gray-700 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-gradient-to-r from-red-700 to-orange-700 text-white px-4 py-2 rounded-full border border-red-500/50 shadow-lg shadow-red-600/30">
            <Shield size={20} />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide">
                {chFromStore?.title || 'Security Challenge'}
              </span>
              <span className="text-[10px] text-red-200 font-mono">ID: {challengeId}</span>
            </div>
          </div>
          
          {totalTests > 0 && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
              allTestsPassed 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-black/50 border-gray-700/50 text-white'
            }`}>
              <Award size={14} />
              <span>{passedTests}/{totalTests} Tests</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset} 
            className="flex items-center gap-2 px-3 py-2 text-white hover:text-white hover:bg-black rounded-lg transition-all border border-transparent hover:border-gray-600 group"
            title="Reset to original code"
          >
            <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-sm">Reset</span>
          </button>
          
          <div className="h-8 w-px bg-gray-700"></div>
          
          <button 
            onClick={handleRun} 
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-black/50"
            title="Execute the code"
          >
            <Play size={16} className={isRunning ? "animate-pulse text-white" : "text-white"} />
            <span>Run Code</span>
          </button>
          
          <button 
            onClick={handleTest} 
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-sm font-bold rounded-lg shadow-xl shadow-red-700/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            title="Run security tests"
          >
            <Beaker size={16} className={isRunning ? "animate-spin text-yellow-300" : "text-yellow-300"} />
            <span>Run Tests</span>
          </button>
        </div>
      </header>

      {/* Description Banner */}
      {chFromStore?.description && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-3 bg-black/50 border-b border-gray-700 text-sm text-white shadow-inner flex items-start gap-3"
        >
          <Info size={16} className="text-white mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">{chFromStore.description}</p>
        </motion.div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel */}
        <AnimatePresence>
          {!isLeftPanelCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col border-r border-gray-700 bg-black flex-shrink-0 overflow-hidden"
            >
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
                <AnimatePresence mode='wait'>
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
                        hintsList.map((hint, index) => (
                          <motion.div 
                            key={hint.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Left Panel Button */}
        <button
          onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black hover:bg-gray-700 p-2 rounded-r-lg border border-l-0 border-gray-700 hover:border-gray-600 transition-all shadow-lg group"
          title={isLeftPanelCollapsed ? "Show panel" : "Hide panel"}
        >
          {isLeftPanelCollapsed ? (
            <PanelLeft size={16} className="text-white group-hover:text-white" />
          ) : (
            <PanelLeftClose size={16} className="text-white group-hover:text-white" />
          )}
        </button>

        {/* Right Panel - Editor and Output */}
        <div className="flex-1 flex flex-col min-w-0 bg-black relative">
          {/* Editor Header */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-lg border border-gray-700 shadow-lg">
              <Code2 size={14} className="text-white" />
              <span className="text-xs font-mono text-white">JavaScript / Node.js</span>
            </div>
            <button 
              onClick={() => setIsFullScreenEditor(!isFullScreenEditor)} 
              className="p-2 text-white hover:text-white hover:bg-black rounded-lg transition-all border border-transparent hover:border-gray-700"
              title={isFullScreenEditor ? "Exit fullscreen" : "Fullscreen editor"}
            >
              {isFullScreenEditor ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {/* Code Editor */}
          <motion.div
            animate={{ height: isFullScreenEditor ? '100%' : '60%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative overflow-hidden border-b border-gray-700"
          >
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16, bottom: 16 },
                automaticLayout: true,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
              }}
            />
          </motion.div>

          {/* Bottom Panel */}
          {!isFullScreenEditor && (
            <motion.div
              animate={{ height: '40%' }}
              className="flex flex-col bg-black"
            >
              {/* Bottom Tabs */}
              <div className="flex items-center bg-black border-b border-gray-700 h-11">
                <button 
                  onClick={() => setActiveBottomTab('output')} 
                  className={`h-full px-5 text-xs font-medium flex items-center gap-2 border-r border-gray-700 transition-all ${
                    activeBottomTab === 'output' 
                      ? 'bg-black text-white' 
                      : 'text-white hover:text-white hover:bg-black'
                  }`}
                >
                  <Terminal size={14} className="text-white" />
                  <span>Console Output</span>
                </button>
                
                <button 
                  onClick={() => setActiveBottomTab('tests')} 
                  className={`h-full px-5 text-xs font-medium flex items-center gap-2 border-r border-gray-700 transition-all ${
                    activeBottomTab === 'tests' 
                      ? 'bg-black text-white' 
                      : 'text-white hover:text-white hover:bg-black'
                  }`}
                >
                  <CheckCircle size={14} className={allTestsPassed ? "text-green-400" : "text-white"} />
                  <span>Test Results</span>
                  {testResults.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ml-1 ${
                      allTestsPassed 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-gray-700 text-white'
                    }`}>
                      {passedTests}/{totalTests}
                    </span>
                  )}
                </button>
              </div>

              {/* Bottom Content */}
              <div className="flex-1 overflow-auto p-5 font-mono text-sm bg-black scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-black">
                <AnimatePresence mode="wait">
                  {activeBottomTab === 'output' ? (
                    <motion.div
                      key="output"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-white whitespace-pre-wrap leading-relaxed"
                    >
                      {output || (
                        <div className="flex flex-col items-center justify-center h-full text-white py-12">
                          <Terminal size={32} className="opacity-30 mb-3" />
                          <p className="text-sm">Console output will appear here</p>
                          <p className="text-xs text-gray-600 mt-1">Press "Run Code" to execute</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="tests"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      {testResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white py-12">
                          <Beaker size={32} className="opacity-30 mb-3 text-white" />
                          <p className="text-sm">No tests run yet</p>
                          <p className="text-xs text-gray-600 mt-1">Click "Run Tests" to validate your solution</p>
                        </div>
                      ) : (
                        <>
                          {allTestsPassed && (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                  <Award size={20} className="text-green-400" />
                                </div>
                                <div>
                                  <p className="font-semibold text-green-400">Challenge Complete!</p>
                                  <p className="text-xs text-white mt-0.5">All security tests passed successfully</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          
                          {testResults.map((result, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                                result.passed 
                                  ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10' 
                                  : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                              }`}
                            >
                              {result.passed ? (
                                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                              ) : (
                                <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                              )}
                              <span className={`flex-1 text-sm leading-relaxed ${
                                result.passed ? 'text-white' : 'text-red-200'
                              }`}>
                                {result.message}
                              </span>
                              {result.severity && !result.passed && (
                                <span className="text-[10px] uppercase font-bold bg-red-800/30 text-red-300 px-2 py-1 rounded border border-red-700/50 flex-shrink-0">
                                  {result.severity}
                                </span>
                              )}
                            </motion.div>
                          ))}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayChallengePage;