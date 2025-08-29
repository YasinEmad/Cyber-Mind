
import { useParams } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Play, 
  RotateCcw, 
  Terminal, 
  Beaker, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Bug,
  Lock,
  Zap
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useState } from 'react';

const PlayChallengePage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
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
  const [activeTab, setActiveTab] = useState<'instructions' | 'testcases' | 'output' | 'security'>('instructions');
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; message: string; severity?: 'high' | 'medium' | 'low' }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<Array<{ type: string; severity: 'high' | 'medium' | 'low'; description: string; fix: string }>>([
    {
      type: "SQL Injection",
      severity: "high",
      description: "The query is constructed using string interpolation, making it vulnerable to SQL injection attacks.",
      fix: "Use parameterized queries or an ORM to prevent SQL injection"
    },
    {
      type: "Password Storage",
      severity: "high",
      description: "Passwords are not hashed before comparison, storing plaintext passwords is extremely risky.",
      fix: "Use bcrypt or Argon2 for password hashing"
    },
    {
      type: "Sensitive Data Exposure",
      severity: "high",
      description: "The JWT token includes sensitive personal information (SSN) and is only base64 encoded.",
      fix: "Never include sensitive data in tokens, use proper JWT signing"
    }
  ]);;

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleReset = () => {
    setCode("// Write your solution here\n\nfunction solution() {\n  // Your code here\n}");
    setOutput("");
    setTestResults([]);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput("Running security tests...\n");
    // Simulate security testing
    setTimeout(() => {
      try {
        const testInput = "<script>alert('xss')</script>";
        const result = eval(`(${code})(${JSON.stringify(testInput)})`);
        setOutput(prev => 
          prev + 
          "\nTest Input: " + testInput +
          "\nSanitized Output: " + JSON.stringify(result, null, 2) +
          "\n\nSecurity Analysis:" +
          "\n- Checking for XSS vulnerabilities..." +
          "\n- Validating input sanitization..." +
          "\n- Analyzing error handling..."
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          setOutput(prev => 
            prev + 
            "\nSecurity Error Detected:" +
            "\n- Error Type: " + error.name +
            "\n- Description: " + error.message +
            "\n\nRecommendation: Implement proper input validation and sanitization"
          );
        }
      }
      setIsRunning(false);
    }, 1000);
  };

  const handleTest = () => {
    setIsRunning(true);
    setTestResults([]);
    // Simulate security testing
    setTimeout(() => {
      const updatedCode = code.toLowerCase();
      const tests = [
        { 
          check: !updatedCode.includes('${username}') && !updatedCode.includes('${password}'),
          message: "SQL Injection Prevention",
          severity: "high" as const,
          details: "Using parameterized queries"
        },
        {
          check: updatedCode.includes('bcrypt.hash') || updatedCode.includes('bcrypt.compare'),
          message: "Password Hashing",
          severity: "high" as const,
          details: "Using secure password hashing"
        },
        {
          check: updatedCode.includes('jwt.sign') && !updatedCode.includes('ssn'),
          message: "Secure Token Creation",
          severity: "high" as const,
          details: "Using JWT with no sensitive data"
        },
        {
          check: updatedCode.includes('try') && !updatedCode.includes('console.log(error)'),
          message: "Error Handling",
          severity: "medium" as const,
          details: "Proper error handling without exposure"
        }
      ];

      const results = tests.map(test => ({
        passed: test.check,
        message: `${test.message} ${test.check ? '✓' : '✗'}`,
        severity: test.severity
      }));

      setTestResults(results);
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    setIsRunning(true);
    setOutput("Submitting your solution...\n");
    // TODO: Implement actual submission logic
    setTimeout(() => {
      setOutput(prev => prev + "\nSolution submitted successfully!");
      setIsRunning(false);
    }, 2000);
  };

  return (
    <PageWrapper>
      <div className="flex flex-col min-h-[calc(100vh-10rem)] p-4">
        <motion.div
          className="w-full h-full bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-red-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Security Challenge #{challengeId}</h1>
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertTriangle size={14} />
                  High-Risk Vulnerability Assessment
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Reset Code"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={handleRun}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Run Code"
                disabled={isRunning}
              >
                <Play size={20} />
              </button>
              <button
                onClick={handleTest}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Run Tests"
                disabled={isRunning}
              >
                <Beaker size={20} />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-2 gap-4 p-4 h-[calc(100vh-16rem)]">
            {/* Left Panel - Code Editor */}
            <div className="bg-slate-900/50 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Right Panel - Tabs */}
            <div className="bg-slate-900/50 rounded-lg flex flex-col overflow-hidden">
              <div className="flex border-b border-slate-700">
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    activeTab === 'instructions'
                      ? 'text-white border-b-2 border-yellow-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText size={16} /> Instructions
                </button>
                <button
                  onClick={() => setActiveTab('testcases')}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    activeTab === 'testcases'
                      ? 'text-white border-b-2 border-yellow-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Beaker size={16} /> Test Cases
                </button>
                <button
                  onClick={() => setActiveTab('output')}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    activeTab === 'output'
                      ? 'text-white border-b-2 border-yellow-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal size={16} /> Output
                </button>
              </div>

              <div className="flex-1 p-4 overflow-auto">
                {activeTab === 'instructions' && (
                  <div className="prose prose-invert">
                    <div className="flex items-center gap-2 mb-4">
                      <Bug className="h-6 w-6 text-red-400" />
                      <h3 className="text-lg font-semibold text-white m-0">Security Code Review Challenge</h3>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                      <h4 className="flex items-center gap-2 text-red-400 font-semibold m-0">
                        <AlertTriangle size={16} />
                        Challenge Overview
                      </h4>
                      <p className="text-slate-300 mt-2">
                        You've been asked to review and fix a user authentication system that has multiple security
                        vulnerabilities. The code contains several critical security flaws that could lead to 
                        system compromise.
                      </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4 mt-4">
                      <h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-400" />
                        Known Vulnerabilities:
                      </h4>
                      <ul className="list-none pl-0 space-y-3 mb-4">
                        <li className="flex items-start gap-2">
                          <Bug className="h-5 w-5 text-red-400 mt-0.5" />
                          <div>
                            <span className="text-red-400 font-semibold">SQL Injection Vulnerability</span>
                            <p className="text-sm text-slate-300 mt-1">
                              The authentication query is vulnerable to SQL injection attacks due to string interpolation
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <Bug className="h-5 w-5 text-red-400 mt-0.5" />
                          <div>
                            <span className="text-red-400 font-semibold">Insecure Password Storage</span>
                            <p className="text-sm text-slate-300 mt-1">
                              Passwords are being compared without proper hashing, potentially exposing user credentials
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <Bug className="h-5 w-5 text-red-400 mt-0.5" />
                          <div>
                            <span className="text-red-400 font-semibold">Token Security Issues</span>
                            <p className="text-sm text-slate-300 mt-1">
                              Sensitive data is exposed in the token and it lacks proper cryptographic signing
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
                      <h4 className="text-md font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <Lock size={16} />
                        Your Tasks:
                      </h4>
                      <ul className="list-none pl-0 space-y-2">
                        <li className="text-slate-300 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-400" />
                          Replace SQL string interpolation with parameterized queries
                        </li>
                        <li className="text-slate-300 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-400" />
                          Implement proper password hashing using bcrypt
                        </li>
                        <li className="text-slate-300 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-400" />
                          Create secure JWT tokens without sensitive data
                        </li>
                        <li className="text-slate-300 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-400" />
                          Add proper error handling without leaking details
                        </li>
                      </ul>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                      <h4 className="text-md font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <Terminal size={16} />
                        Example Secure Implementation:
                      </h4>
                      <pre className="text-sm bg-slate-900/50 p-3 rounded text-slate-300">
{`// Use parameterized queries
const query = 'SELECT * FROM users WHERE username = ?';
const user = await db.query(query, [username]);

// Hash passwords with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// Secure JWT creation
const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);`}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === 'testcases' && (
                  <div className="space-y-4">
                    <div className="border border-slate-700 rounded-lg">
                      <div className="p-3 border-b border-slate-700">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          <Bug className="h-5 w-5 text-red-400" />
                          Security Test Results
                        </h3>
                      </div>
                      <div className="p-3 space-y-2">
                        {testResults.map((result, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg flex items-start gap-2 ${
                              result.passed ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}
                          >
                            {result.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <span className="text-slate-300">{result.message}</span>
                              {result.severity && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ml-2 ${
                                  result.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                  result.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {result.severity.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border border-slate-700 rounded-lg">
                      <div className="p-3 border-b border-slate-700">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          <Shield className="h-5 w-5 text-red-400" />
                          Detected Vulnerabilities
                        </h3>
                      </div>
                      <div className="p-3 space-y-2">
                        {vulnerabilities.map((vuln, index) => (
                          <div
                            key={index}
                            className="p-3 bg-slate-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                vuln.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                vuln.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {vuln.type}
                              </span>
                              <span className="text-sm text-slate-400">
                                Severity: {vuln.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300">{vuln.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'output' && (
                  <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap">
                    {output || 'Run your code to see the output here...'}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleSubmit}
              disabled={isRunning}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Processing...' : 'Submit Solution'}
            </button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default PlayChallengePage;
