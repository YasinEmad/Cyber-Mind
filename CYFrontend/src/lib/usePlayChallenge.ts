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
      setCode(chFromStore.initialCode || chFromStore.code || "");
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
    const nextCode = value ?? '';
    setCode(nextCode);
    console.debug('Editor changed, length:', nextCode.length);
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
    }, 1000);
  };

  // --- Submit Logic ---
  // عند التسليم:
  // 1. يتم التحقق من أن المستخدم غير مسجل الدخول
  // 2. يتم إرسال الحل إلى الـ Backend مع Challenge ID الفريد
  // 3. الـ Backend يتحقق إذا كان المستخدم حل هذا التحدي من قبل
  // 4. إذا كانت أول مرة ويكون الحل صحيح: تُضاف النقاط
  // 5. إذا كان حله من قبل: يُسمح بالحل بدون إضافة نقاط
  const handleSubmit = async () => {
    console.debug('usePlayChallenge.handleSubmit called', { challengeId, codeLength: code.length, challengeLoaded: !!chFromStore });
    if (!challengeId || !chFromStore) {
      return;
    }

    const originalCode = (chFromStore.initialCode || chFromStore.code || '').trim();
    const currentCode = code.trim();

    if (!currentCode) {
      console.debug('handleSubmit aborted: current code empty');
      return;
    }

    if (currentCode === originalCode) {
      return;
    }

    setActiveBottomTab('output');

    console.debug('Submitting AI review', { challengeId, codeLength: code.length });
    const resultAction = await dispatch(submitChallenge({ 
      challengeId, 
      answer: code 
    }));
    
    if (submitChallenge.fulfilled.match(resultAction)) {
      const payload = resultAction.payload as SubmitResponse;

      if (payload.success && (payload.awarded || payload.alreadySolved)) {
        setSubmissionResult({ ...payload, challengeTitle: chFromStore.title });
      } else if (payload.success) {
        // Correct logic but not eligible for points (e.g. not logged in)
        setSubmissionResult(null);
      } else {
        // Incorrect solution - show AI feedback
        setSubmissionResult({ ...payload, challengeTitle: chFromStore.title });
      }
    } else {
      const errorPayload = resultAction.payload as string | undefined;
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