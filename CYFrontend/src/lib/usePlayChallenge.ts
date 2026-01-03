import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchChallengeById } from '@/redux/slices/challengeSlice';

export const usePlayChallenge = () => {
  const { challengeId } = useParams<{ challengeId: string }>();

  // --- State Management ---
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [activeLeftTab, setActiveLeftTab] = useState<'challenge' | 'recommendations' | 'hints'>('challenge');
  const [activeBottomTab, setActiveBottomTab] = useState<'output' | 'tests'>('output');
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; message: string; severity?: 'high' | 'medium' | 'low' }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [hintsList, setHintsList] = useState<Array<{id:number; title:string; content:string}>>([]);

  const dispatch = useDispatch<AppDispatch>();
  const chFromStore = useSelector((state: RootState) => state.challenges.challenge);
  const chStatus = useSelector((state: RootState) => state.challenges.status);

  useEffect(() => {
    if (challengeId) dispatch(fetchChallengeById(challengeId));
  }, [dispatch, challengeId]);

  useEffect(() => {
    if (chFromStore) {
      if (chFromStore.code) setCode(chFromStore.code);
      if (Array.isArray(chFromStore.hints) && chFromStore.hints.length > 0) {
        setHintsList(chFromStore.hints.map((h: string, idx: number) => ({ id: idx, title: `Hint ${idx + 1}`, content: h })));
      } else {
        setHintsList([]);
      }
    }
  }, [chFromStore]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleReset = () => {
    setCode(chFromStore?.code || "");
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
        setOutput(prev => 
          prev + 
          `\n[LOG] Input received: ${testInput}` +
          `\n[LOG] Query constructed...` +
          `\n[WARN] Potential SQL syntax error detected in simulation.` +
          `\n[SUCCESS] Execution finished in 14ms.`
        );
      } catch (error) {}
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

      setTestResults(tests.map(test => ({
        passed: test.check,
        message: test.message,
        severity: test.severity
      })));
      setIsRunning(false);
    }, 1200);
  };

  return {
    challengeId, code, output, activeLeftTab, setActiveLeftTab,
    activeBottomTab, setActiveBottomTab, testResults, isRunning,
    revealedHints, hintsList, chFromStore, chStatus,
    handleEditorChange, handleReset, toggleHint, handleRun, handleTest
  };
};