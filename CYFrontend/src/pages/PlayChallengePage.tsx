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
  const [activeLeftTab, setActiveLeftTab] = useState<'challenge' | 'recommendations' | 'hints'>('challenge');
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
      fix: "Use parameterized queries (e.g., ? or )."
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
    <div className="flex flex-col h-screen w-screen bg-black text-gray-300 font-sans overflow-hidden">
      
      {/* --- Top Navigation Bar --- */}
      <header className="h-14 border-b border-gray-800 bg-black backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1.5 rounded-lg border border-gray-700 shadow-lg shadow-red-900/20">
            <Shield size={16} />
            <span className="font-bold text-sm tracking-wide">SEC-CHALLENGE-{challengeId}</span>
          </div>
          <span className="text-gray-600 text-sm">|</span>
          <span className="text-gray-400 text-sm font-medium">Authentication Bypass Fix</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all hover:border hover:border-gray-700"
            title="Reset Code"
          >
            <RotateCcw size={18} />
          </button>
          
          <div className="h-6 w-px bg-gray-800 mx-1"></div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg border border-gray-700 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-gray-900"
          >
            <Play size={16} className={isRunning ? "animate-pulse" : ""} />
            Run
          </button>

          <button
            onClick={handleTest}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 text-white text-sm font-bold rounded-lg shadow-xl shadow-red-900/40 transition-all disabled:opacity-50 hover:scale-[1.02]"
          >
            <Beaker size={16} className={isRunning ? "animate-spin" : ""} />
            Run Tests
          </button>
        </div>
      </header>

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Context & Instructions */}
        <div className="w-[400px] flex flex-col border-r border-gray-800 bg-black flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-800 bg-black">
            <button
              onClick={() => setActiveLeftTab('challenge')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === 'challenge' 
                  ? 'border-red-600 text-white bg-black' 
                  : 'border-transparent text-gray-600 hover:text-gray-300 hover:bg-black'
              }`}
            >
              <AlertTriangle size={14} /> Challenge
            </button>
            <button
              onClick={() => setActiveLeftTab('recommendations')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === 'recommendations' 
                  ? 'border-red-600 text-white bg-black' 
                  : 'border-transparent text-gray-600 hover:text-gray-300 hover:bg-black'
              }`}
            >
              <Zap size={14} /> Recommendations
            </button>
            <button
              onClick={() => setActiveLeftTab('hints')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeLeftTab === 'hints' 
                  ? 'border-red-600 text-white bg-black' 
                  : 'border-transparent text-gray-600 hover:text-gray-300 hover:bg-black'
              }`}
            >
              <Lightbulb size={14} /> Hints
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-900">
            <AnimatePresence mode='wait'>
              {activeLeftTab === 'challenge' ? (
                <motion.div 
                  key="vulns"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Detected Challenges</h3>
                  {vulnerabilities.map((vuln, idx) => (
                    <div key={idx} className="bg-black border border-gray-800 rounded-lg p-4 hover:border-red-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/10 group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-red-500 font-bold text-sm group-hover:text-red-400 transition-colors">{vuln.type}</span>
                        <span className="text-[10px] font-black bg-gradient-to-r from-red-900/20 to-orange-900/20 text-red-400 px-2 py-0.5 rounded border border-red-900/30">HIGH</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{vuln.description}</p>
                      <div className="flex items-center gap-2 text-xs bg-black text-orange-400 p-2 rounded border border-gray-800">
                        <Zap size={12} className="text-orange-500" />
                        <span className="font-medium">Fix: {vuln.fix}</span>
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
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Security Recommendations</h3>
                  <div className="bg-black border border-gray-800 rounded-lg p-4 shadow-xl shadow-black/50">
                    <h4 className="text-red-500 font-bold text-sm flex items-center gap-2 mb-3">
                      <Zap size={14} className="text-orange-500" /> Critical Best Practices
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex gap-3 p-2 hover:bg-black/50 rounded-lg transition-colors">
                        <div className="min-w-[8px] h-[8px] rounded-full bg-gradient-to-r from-red-600 to-orange-600 mt-1.5" />
                        <div>
                          <p className="font-bold text-sm bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Use Parameterized Queries</p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Replace string interpolation with prepared statements. This prevents SQL injection attacks by treating user input as data, not executable code.</p>
                        </div>
                      </li>
                      <li className="flex gap-3 p-2 hover:bg-black/50 rounded-lg transition-colors">
                        <div className="min-w-[8px] h-[8px] rounded-full bg-gradient-to-r from-red-600 to-orange-600 mt-1.5" />
                        <div>
                          <p className="font-bold text-sm bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Hash Passwords with bcrypt</p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Never store plaintext passwords. Use bcrypt.hash() for storage and bcrypt.compare() for verification. Always use salt rounds ≥ 10.</p>
                        </div>
                      </li>
                      <li className="flex gap-3 p-2 hover:bg-black/50 rounded-lg transition-colors">
                        <div className="min-w-[8px] h-[8px] rounded-full bg-gradient-to-r from-red-600 to-orange-600 mt-1.5" />
                        <div>
                          <p className="font-bold text-sm bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Clean JWT Tokens</p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Remove sensitive data (SSN, passwords, etc.) from JWT payloads. Use jwt.sign() with a secret and only include necessary user identifiers.</p>
                        </div>
                      </li>
                      <li className="flex gap-3 p-2 hover:bg-black/50 rounded-lg transition-colors">
                        <div className="min-w-[8px] h-[8px] rounded-full bg-gradient-to-r from-red-600 to-orange-600 mt-1.5" />
                        <div>
                          <p className="font-bold text-sm bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Error Handling</p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Never expose internal errors to users. Log errors securely server-side without revealing system details or database structure.</p>
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
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Available Hints</h3>
                  {hints.map((hint) => (
                    <motion.div
                      key={hint.id}
                      className="bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-red-900/50 transition-all duration-300 group hover:shadow-lg hover:shadow-red-900/10"
                      whileHover={{ scale: 1.02 }}
                    >
                      <button
                        onClick={() => toggleHint(hint.id)}
                        className="w-full text-left p-4 flex items-center justify-between hover:bg-black/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-black rounded border border-gray-800">
                            <Lightbulb size={14} className="text-orange-500 group-hover:text-orange-400 transition-colors" />
                          </div>
                          <span className="font-semibold text-gray-300 text-sm group-hover:text-white transition-colors">{hint.title}</span>
                        </div>
                        <div className="p-1 bg-black rounded border border-gray-800">
                          <ChevronRight 
                            size={14} 
                            className={`text-gray-600 group-hover:text-gray-400 transition-all ${revealedHints.has(hint.id) ? 'rotate-90 text-orange-500' : ''}`}
                          />
                        </div>
                      </button>
                      {revealedHints.has(hint.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-800 px-4 pb-4 pt-2 bg-black"
                        >
                          <p className="text-xs text-gray-500 leading-relaxed">{hint.content}</p>
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
        <div className="flex-1 flex flex-col min-w-0 bg-black">
          
          {/* Editor Area */}
          <div className="flex-1 relative">
            <div className="absolute top-0 right-0 z-10 p-2">
              <span className="text-xs font-mono text-gray-600 opacity-50">JavaScript / Node.js</span>
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
          <div className="h-[35%] flex flex-col border-t border-gray-800 bg-black">
            {/* Console Tabs */}
            <div className="flex items-center border-b border-gray-800 bg-black px-2 h-10">
              <button
                onClick={() => setActiveBottomTab('output')}
                className={`px-4 h-full text-xs font-medium flex items-center gap-2 border-r border-gray-800 transition-colors ${
                  activeBottomTab === 'output' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-300'
                }`}
              >
                <Terminal size={12} /> Console Output
              </button>
              <button
                onClick={() => setActiveBottomTab('tests')}
                className={`px-4 h-full text-xs font-medium flex items-center gap-2 border-r border-gray-800 transition-colors ${
                  activeBottomTab === 'tests' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-300'
                }`}
              >
                <CheckCircle size={12} /> Test Results
                {testResults.length > 0 && (
                  <span className="bg-gray-800 text-gray-500 px-1.5 rounded-full text-[10px]">{testResults.length}</span>
                )}
              </button>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-black">
              {activeBottomTab === 'output' && (
                <div className="text-gray-400 whitespace-pre-wrap">
                  {output ? (
                    output
                  ) : (
                    <span className="text-gray-700 italic">Ready to execute. Click "Run" to test your code locally...</span>
                  )}
                </div>
              )}

              {activeBottomTab === 'tests' && (
                <div className="space-y-2">
                  {testResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-700">
                      <div className="p-3 bg-black rounded-full mb-2 border border-gray-800">
                        <Beaker size={24} className="opacity-30" />
                      </div>
                      <p className="text-sm">No tests run yet.</p>
                    </div>
                  ) : (
                    testResults.map((result, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 hover:bg-black rounded-lg border border-gray-800 group transition-all">
                        <div className="p-1.5 rounded border border-gray-800 bg-black">
                          {result.passed ? (
                            <CheckCircle size={14} className="text-green-500 group-hover:text-green-400 transition-colors" />
                          ) : (
                            <XCircle size={14} className="text-red-500 group-hover:text-red-400 transition-colors" />
                          )}
                        </div>
                        <span className={`flex-1 text-sm ${result.passed ? 'text-gray-300' : 'text-red-300'}`}>
                          {result.message}
                        </span>
                        {result.severity && !result.passed && (
                          <span className="text-[10px] uppercase font-black bg-gradient-to-r from-red-900/20 to-orange-900/20 text-red-400 px-2 py-0.5 rounded border border-red-900/30">
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