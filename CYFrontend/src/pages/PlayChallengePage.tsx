import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Shield, Play, RotateCcw, Terminal, 
  Beaker, CheckCircle, AlertTriangle, 
  Zap, ChevronRight,
  XCircle, Lightbulb
} from 'lucide-react';

// NOTE: In a real app, you might keep PageWrapper if it handles global auth checks,
// but for a full-screen IDE experience, we usually bypass generic wrappers.

const PlayChallengePage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();

  // --- State Management ---
  const vulnerableCode = `// Vulnerable Authentication Function
async function authenticateUser(username, password) {
  // VULNERABILITY: SQL Injection possible here
  const query = \`SELECT * FROM users 
    WHERE username = '\${username}' 
    AND password = '\${password}'\`;
  
  const user = await db.query(query);
  
  if (user) {
    // VULNERABILITY: Weak password storage
    return { token: createToken(user) };
  }
  return null;
}

// VULNERABILITY: Insecure token creation
function createToken(user) {
  return Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      // VULNERABILITY: Sensitive data exposure
      role: user.role,
      ssn: user.ssn
    })
  ).toString('base64');
}`;

  const [code, setCode] = useState(vulnerableCode);
  const [output, setOutput] = useState<string>("");
  const [activeLeftTab, setActiveLeftTab] = useState<'challinge' | 'recommendations' | 'hints'>('challinge');
  const [activeBottomTab, setActiveBottomTab] = useState<'output' | 'tests'>('output');
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; message: string; severity?: 'high' | 'medium' | 'low' }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  const hints = [
    {
      id: 0,
      title: "Parameterized Queries",
      content: "Look at the database query construction. String interpolation allows attackers to inject SQL code. Try using parameterized queries with placeholders (?) instead."
    },
    {
      id: 1,
      title: "Secure Password Storage",
      content: "Passwords should never be compared as plain text. Use bcrypt.compare() to securely compare passwords against hashed values stored in the database."
    },
    {
      id: 2,
      title: "Token Sanitization",
      content: "Sensitive information like SSN should never be stored in tokens. Remove unnecessary fields from the JWT payload and use proper JWT signing instead of base64 encoding."
    }
  ];

  // Static Data
  const vulnerabilities = [
    {
      type: "SQL Injection",
      severity: "high",
      description: "String interpolation allows attackers to manipulate the query structure.",
      fix: "Use parameterized queries (e.g., ? or $1)."
    },
    {
      type: "Password Storage",
      severity: "high",
      description: "Plaintext password comparison is catastrophic.",
      fix: "Use bcrypt.compare() with hashed passwords."
    },
    {
      type: "Sensitive Data",
      severity: "high",
      description: "SSN exposed in base64 encoded token.",
      fix: "Remove sensitive fields and use JWT signing."
    }
  ];

  // --- Handlers ---
  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleReset = () => {
    setCode(vulnerableCode);
    setOutput("");
    setTestResults([]);
  };

  const toggleHint = (hintId: number) => {
    const newHints = new Set(revealedHints);
    if (newHints.has(hintId)) {
      newHints.delete(hintId);
    } else {
      newHints.add(hintId);
    }
    setRevealedHints(newHints);
  };

  const handleRun = () => {
    setIsRunning(true);
    setActiveBottomTab('output');
    setOutput("Initializing security sandbox...\n> Analyzing AST...\n");
    
    setTimeout(() => {
      try {
        const testInput = "<script>alert('xss')</script>";
        // Simulate execution
        setOutput(prev => 
          prev + 
          `\n[LOG] Input received: ${testInput}` +
          `\n[LOG] Query constructed...` +
          `\n[WARN] Potential SQL syntax error detected in simulation.` +
          `\n[SUCCESS] Execution finished in 14ms.`
        );
      } catch (error) {
        // Handle error
      }
      setIsRunning(false);
    }, 1000);
  };

  const handleTest = () => {
    setIsRunning(true);
    setActiveBottomTab('tests');
    setTestResults([]);
    
    setTimeout(() => {
      const updatedCode = code.toLowerCase();
      const tests = [
        { 
          check: !updatedCode.includes('${username}') && !updatedCode.includes('${password}'),
          message: "SQL Injection Prevention",
          severity: "high" as const,
        },
        {
          check: updatedCode.includes('bcrypt.hash') || updatedCode.includes('bcrypt.compare'),
          message: "Secure Password Hashing",
          severity: "high" as const,
        },
        {
          check: updatedCode.includes('jwt.sign') && !updatedCode.includes('ssn'),
          message: "Token Sanitization",
          severity: "high" as const,
        },
        {
          check: updatedCode.includes('try') && !updatedCode.includes('console.log(error)'),
          message: "Safe Error Handling",
          severity: "medium" as const,
        }
      ];

      const results = tests.map(test => ({
        passed: test.check,
        message: test.message,
        severity: test.severity
      }));

      setTestResults(results);
      setIsRunning(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-300 font-sans overflow-hidden">
      
      {/* --- Top Navigation Bar --- */}
      <header className="h-14 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
            <Shield size={16} />
            <span className="font-bold text-sm tracking-wide">SEC-CHALLENGE-{challengeId}</span>
          </div>
          <span className="text-slate-500 text-sm">|</span>
          <span className="text-slate-400 text-sm font-medium">Authentication Bypass Fix</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-all"
            title="Reset Code"
          >
            <RotateCcw size={18} />
          </button>
          
          <div className="h-6 w-px bg-slate-700 mx-1"></div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded border border-slate-600 transition-all disabled:opacity-50"
          >
            <Play size={16} className={isRunning ? "animate-pulse" : ""} />
            Run
          </button>

          <button
            onClick={handleTest}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50"
          >
            <Beaker size={16} className={isRunning ? "animate-spin" : ""} />
            Run Tests
          </button>
        </div>
      </header>

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Context & Instructions */}
        <div className="w-[400px] flex flex-col border-r border-slate-800 bg-slate-800/30 flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-800">
            <button
              onClick={() => setActiveLeftTab('challinge')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === 'challinge' 
                  ? 'border-cyan-500 text-white bg-slate-700/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <AlertTriangle size={14} /> Challenge
            </button>
            <button
              onClick={() => setActiveLeftTab('recommendations')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === 'recommendations' 
                  ? 'border-cyan-500 text-white bg-slate-700/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Zap size={14} /> Recommendations
            </button>
            <button
              onClick={() => setActiveLeftTab('hints')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === 'hints' 
                  ? 'border-cyan-500 text-white bg-slate-700/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Lightbulb size={14} /> Hints
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
            <AnimatePresence mode='wait'>
              {activeLeftTab === 'challinge' ? (
                <motion.div 
                  key="vulns"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Detected Challenges</h3>
                  {vulnerabilities.map((vuln, idx) => (
                    <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-cyan-400 font-medium text-sm">{vuln.type}</span>
                        <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded border border-cyan-500/20">HIGH</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{vuln.description}</p>
                      <div className="flex items-center gap-2 text-xs text-cyan-500 bg-cyan-500/5 p-2 rounded">
                        <Zap size={12} />
                        <span>Fix: {vuln.fix}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : activeLeftTab === 'recommendations' ? (
                <motion.div 
                  key="recommendations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Security Recommendations</h3>
                  <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
                    <h4 className="text-cyan-400 font-semibold text-sm flex items-center gap-2 mb-3">
                      <Zap size={14} /> Best Practices
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex gap-3">
                        <div className="min-w-[6px] h-[6px] rounded-full bg-cyan-500 mt-1.5" />
                        <div>
                          <p className="font-semibold text-sm text-cyan-300">Use Parameterized Queries</p>
                          <p className="text-xs text-slate-400 mt-1">Replace string interpolation with prepared statements. This prevents SQL injection attacks by treating user input as data, not executable code.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="min-w-[6px] h-[6px] rounded-full bg-cyan-500 mt-1.5" />
                        <div>
                          <p className="font-semibold text-sm text-cyan-300">Hash Passwords with bcrypt</p>
                          <p className="text-xs text-slate-400 mt-1">Never store plaintext passwords. Use bcrypt.hash() for storage and bcrypt.compare() for verification. Always use salt rounds ≥ 10.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="min-w-[6px] h-[6px] rounded-full bg-cyan-500 mt-1.5" />
                        <div>
                          <p className="font-semibold text-sm text-cyan-300">Clean JWT Tokens</p>
                          <p className="text-xs text-slate-400 mt-1">Remove sensitive data (SSN, passwords, etc.) from JWT payloads. Use jwt.sign() with a secret and only include necessary user identifiers.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="min-w-[6px] h-[6px] rounded-full bg-cyan-500 mt-1.5" />
                        <div>
                          <p className="font-semibold text-sm text-cyan-300">Error Handling</p>
                          <p className="text-xs text-slate-400 mt-1">Never expose internal errors to users. Log errors securely server-side without revealing system details or database structure.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="hints"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Available Hints</h3>
                  {hints.map((hint) => (
                    <motion.div
                      key={hint.id}
                      className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/30 transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      <button
                        onClick={() => toggleHint(hint.id)}
                        className="w-full text-left p-4 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <Lightbulb size={16} className="text-cyan-500 shrink-0 group-hover:animate-pulse" />
                          <span className="font-semibold text-slate-200 text-sm">{hint.title}</span>
                        </div>
                        <ChevronRight 
                          size={16} 
                          className={`text-slate-500 transition-transform ${revealedHints.has(hint.id) ? 'rotate-90' : ''}`}
                        />
                      </button>
                      {revealedHints.has(hint.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-700 px-4 pb-4 pt-2 bg-slate-900/50"
                        >
                          <p className="text-xs text-slate-400 leading-relaxed">{hint.content}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL: Editor & Console */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          
          {/* Editor Area */}
          <div className="flex-1 relative">
            <div className="absolute top-0 right-0 z-10 p-2">
              <span className="text-xs font-mono text-slate-500 opacity-50">JavaScript / Node.js</span>
            </div>
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
                lineHeight: 24,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20 },
              }}
            />
          </div>

          {/* Bottom Console Area */}
          <div className="h-[35%] flex flex-col border-t border-slate-800 bg-slate-900">
            {/* Console Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-slate-800 px-2 h-10">
              <button
                onClick={() => setActiveBottomTab('output')}
                className={`px-4 h-full text-xs font-medium flex items-center gap-2 border-r border-slate-800 transition-colors ${
                  activeBottomTab === 'output' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Terminal size={12} /> Console Output
              </button>
              <button
                onClick={() => setActiveBottomTab('tests')}
                className={`px-4 h-full text-xs font-medium flex items-center gap-2 border-r border-slate-800 transition-colors ${
                  activeBottomTab === 'tests' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <CheckCircle size={12} /> Test Results
                {testResults.length > 0 && (
                  <span className="bg-slate-700 text-slate-400 px-1.5 rounded-full text-[10px]">{testResults.length}</span>
                )}
              </button>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
              {activeBottomTab === 'output' && (
                <div className="text-slate-300 whitespace-pre-wrap">
                  {output ? (
                    output
                  ) : (
                    <span className="text-slate-600 italic">Ready to execute. Click "Run" to test your code locally...</span>
                  )}
                </div>
              )}

              {activeBottomTab === 'tests' && (
                <div className="space-y-1">
                  {testResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                      <Beaker size={32} className="mb-2 opacity-20" />
                      <p>No tests run yet.</p>
                    </div>
                  ) : (
                    testResults.map((result, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded group">
                        {result.passed ? (
                          <CheckCircle size={16} className="text-cyan-500 shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-red-500 shrink-0" />
                        )}
                        <span className={`flex-1 ${result.passed ? 'text-slate-300' : 'text-red-300'}`}>
                          {result.message}
                        </span>
                        {result.severity && !result.passed && (
                          <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                            {result.severity}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlayChallengePage;