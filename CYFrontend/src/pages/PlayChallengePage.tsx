import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
// Cleaned up unused imports: Award and Beaker
import { 
  Terminal, CheckCircle, Maximize2, Minimize2, Info, 
  Code2, PanelLeftClose, PanelLeft, Loader2, XCircle 
} from 'lucide-react';
import { usePlayChallenge } from '../lib/usePlayChallenge';
import { ChallengeHeader } from '../components/ChallengeHeader';
import ChallengeSidebar  from '../components/ChallengeSidebar'

// ... (Rest of the component stays exactly the same)

const PlayChallengePage: React.FC = () => {
  const {
    challengeId, code, output, activeLeftTab, setActiveLeftTab,
    activeBottomTab, setActiveBottomTab, testResults, isRunning,
    revealedHints, hintsList, chFromStore,
    handleEditorChange, handleReset, toggleHint, handleRun, handleTest,
    isAllTestsPassed, handleSubmit, submitStatus
  } = usePlayChallenge();

  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isFullScreenEditor, setIsFullScreenEditor] = useState(false);
  const [lastAction, setLastAction] = useState<'run' | 'test' | null>(null);

  const passedTests = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length;

  const wrappedHandleRun = () => { setLastAction('run'); handleRun(); };
  const wrappedHandleTest = () => { setLastAction('test'); handleTest(); };

  const LoadingIndicator = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-white py-12">
      <Loader2 size={32} className="opacity-50 mb-3 animate-spin" />
      <p className="text-sm">{text}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white font-sans overflow-hidden">
      <ChallengeHeader 
        chFromStore={chFromStore} challengeId={challengeId}
        totalTests={totalTests} isAllTestsPassed={isAllTestsPassed}
        passedTests={passedTests} submitStatus={submitStatus}
        isRunning={isRunning} handleSubmit={handleSubmit}
        handleReset={handleReset} handleRun={wrappedHandleRun} handleTest={wrappedHandleTest}
      />

      {chFromStore?.description && (
        <div className="px-6 py-3 bg-black/50 border-b border-gray-700 text-sm flex items-start gap-3">
          <Info size={16} className="text-white mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">{chFromStore.description}</p>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence>
          {!isLeftPanelCollapsed && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 420, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
              <ChallengeSidebar 
                activeLeftTab={activeLeftTab} setActiveLeftTab={setActiveLeftTab}
                chFromStore={chFromStore} hintsList={hintsList}
                revealedHints={revealedHints} toggleHint={toggleHint}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black hover:bg-gray-700 p-2 rounded-r-lg border border-l-0 border-gray-700 transition-all">
          {isLeftPanelCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>

        <div className="flex-1 flex flex-col min-w-0 bg-black relative">
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-lg border border-gray-700">
              <Code2 size={14} />
              <span className="text-xs font-mono">JavaScript / Node.js</span>
            </div>
            <button onClick={() => setIsFullScreenEditor(!isFullScreenEditor)} className="p-2 text-white hover:bg-black rounded-lg border border-transparent hover:border-gray-700">
              {isFullScreenEditor ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          <motion.div animate={{ height: isFullScreenEditor ? '100%' : '60%' }} className="relative overflow-hidden border-b border-gray-700">
            <Editor
              height="100%" defaultLanguage="javascript" value={code}
              onChange={handleEditorChange} theme="vs-dark"
              options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, wordWrap: 'on' }}
            />
          </motion.div>

          {!isFullScreenEditor && (
            <div className="flex-1 flex flex-col bg-black">
              <div className="flex items-center bg-black border-b border-gray-700 h-11">
                <button onClick={() => setActiveBottomTab('output')} className={`h-full px-5 text-xs flex items-center gap-2 border-r border-gray-700 ${activeBottomTab === 'output' ? 'bg-black text-white' : 'text-white/60'}`}>
                  <Terminal size={14} /> Console Output
                </button>
                <button onClick={() => setActiveBottomTab('tests')} className={`h-full px-5 text-xs flex items-center gap-2 border-r border-gray-700 ${activeBottomTab === 'tests' ? 'bg-black text-white' : 'text-white/60'}`}>
                  <CheckCircle size={14} className={isAllTestsPassed ? "text-green-400" : ""} /> Test Results
                </button>
              </div>

              <div className="flex-1 overflow-auto p-5 font-mono text-sm bg-black">
                {activeBottomTab === 'output' ? (
                  isRunning && lastAction === 'run' ? <LoadingIndicator text="Executing..." /> : (output || <p className="opacity-30">Console output will appear here</p>)
                ) : (
                  isRunning && lastAction === 'test' ? <LoadingIndicator text="Testing..." /> : (
                    <div className="space-y-2">
                      {isAllTestsPassed && <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg text-green-400">Challenge Complete!</div>}
                      {testResults.map((result, i) => (
                        <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border ${result.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                          {result.passed ? <CheckCircle size={16} className="text-green-400 mt-0.5" /> : <XCircle size={16} className="text-red-400 mt-0.5" />}
                          <span className="text-sm">{result.message}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayChallengePage;