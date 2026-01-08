import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { 
  fetchChallengeById, 
  submitChallenge, 
  resetSubmitStatus, 
  SubmitResponse
} from '@/redux/slices/challengeSlice';
import { toast } from 'react-hot-toast';

interface SubmissionResult extends SubmitResponse {
  challengeTitle: string;
}

export const usePlayChallenge = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  // --- Redux Store Selectors ---
  const chFromStore = useSelector((state: RootState) => state.challenges.challenge);
  const chStatus = useSelector((state: RootState) => state.challenges.status);
  const submitStatus = useSelector((state: RootState) => state.challenges.submitStatus);

  // --- Local State Management ---
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [activeLeftTab, setActiveLeftTab] = useState<'challenge' | 'recommendations' | 'hints'>('challenge');
  const [activeBottomTab, setActiveBottomTab] = useState<'output' | 'tests'>('output');
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; message: string; severity?: 'high' | 'medium' | 'low' }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [hintsList, setHintsList] = useState<Array<{id:number; title:string; content:string}>>([]);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // --- Effects ---
  
  // 1. Fetch challenge data when the page opens
  useEffect(() => {
    if (challengeId) {
      dispatch(fetchChallengeById(challengeId));
    }
    // Clean up submission status on page exit
    return () => {
      dispatch(resetSubmitStatus());
    };
  }, [dispatch, challengeId]);

  // 2. Update code and hints once data arrives from the server
  useEffect(() => {
    if (chFromStore) {
      if (chFromStore.code) setCode(chFromStore.code);
      if (Array.isArray(chFromStore.hints) && chFromStore.hints.length > 0) {
        setHintsList(chFromStore.hints.map((h: string, idx: number) => ({ 
          id: idx, 
          title: `Hint ${idx + 1}`, 
          content: h 
        })));
      } else {
        setHintsList([]);
      }
    }
  }, [chFromStore]);

  // --- Handlers ---

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleReset = () => {
    setCode(chFromStore?.code || "");
    setOutput("");
    setTestResults([]);
    toast.success("Code reset to default");
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

  const clearSubmissionResult = () => {
    setSubmissionResult(null);
  };

  const handleRun = () => {
    setIsRunning(true);
    setActiveBottomTab('output');
    setOutput("Initializing security sandbox...\n> Analyzing AST...\n");
    
    setTimeout(() => {
      try {
        // Quick simulation of console output
        setOutput(prev => 
          prev + 
          `\n[LOG] Sandbox execution started...` +
          `\n[WARN] Monitoring insecure patterns...` +
          `\n[SUCCESS] Script finished without crashing.`
        );
      } catch (error) {
        setOutput(prev => prev + `\n[ERROR] ${error}`);
      }
      setIsRunning(false);
    }, 800);
  };

  const handleTest = () => {
    setIsRunning(true);
    setActiveBottomTab('tests');
    setTestResults([]);
    
    setTimeout(() => {
      const updatedCode = code.toLowerCase();
      // Simulation of testing process (Security Checks)
      const tests = [
        { 
          check: !updatedCode.includes('${username}') && !updatedCode.includes('${password}'),
          message: "Prevent SQL String Interpolation",
          severity: "high" as const,
        },
        {
          check: updatedCode.includes('?') || updatedCode.includes('$1') || updatedCode.includes('params'),
          message: "Use Parameterized Queries",
          severity: "high" as const,
        },
        {
          check: updatedCode.includes('try') && updatedCode.includes('catch'),
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
      
      const allPassed = tests.every(t => t.check);
      if (allPassed) {
        toast.success("All local tests passed! Ready to submit.");
      } else {
        toast.error("Some security checks failed. Review your code.");
      }
    }, 1000);
  };

  // --- Submit Logic ---
  const handleSubmit = async () => {
    const localTestsPassed = testResults.length > 0 && testResults.every(t => t.passed);
    
    if (!localTestsPassed) {
      toast.error("Please pass all local security tests first!");
      return;
    }

    if (challengeId && chFromStore) {
      const resultAction = await dispatch(submitChallenge({ 
        challengeId, 
        answer: code 
      }));
      
      if (submitChallenge.fulfilled.match(resultAction)) {
        const payload = resultAction.payload as SubmitResponse;
        
        if (payload.success) { // If the submission is correct
          setSubmissionResult({ ...payload, challengeTitle: chFromStore.title });
        } else { // If the submission is incorrect
          toast.error(payload.message || "Incorrect answer. Please try again.");
        }
      } else { // If there was a network error or something else
        toast.error("Network error. Please try again later.");
      }
    }
  };

  // --- Derived State ---
  const isAllTestsPassed = testResults.length > 0 && testResults.every(t => t.passed);

  return {
    challengeId, 
    code, 
    output, 
    activeLeftTab, 
    setActiveLeftTab,
    activeBottomTab, 
    setActiveBottomTab, 
    testResults, 
    isRunning,
    revealedHints, 
    hintsList, 
    chFromStore, 
    chStatus,
    submitStatus,
    isAllTestsPassed,
    submissionResult,
    clearSubmissionResult,
    handleEditorChange, 
    handleReset, 
    toggleHint, 
    handleRun, 
    handleTest,
    handleSubmit
  };
};