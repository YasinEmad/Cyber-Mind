const axios = require('axios');

/* =========================
   PUBLIC API
========================= */

exports.generateIncorrectFeedback = async (challengeData, userAnswer) => {
  try {
    const result = await callAI(generateFeedbackPrompt(challengeData, userAnswer));

    if (result?.feedback) return result.feedback;
    return fallbackFeedback(challengeData);
  } catch (err) {
    console.error('AI feedback error:', err);
    return fallbackFeedback(challengeData);
  }
};

exports.evaluateSecurityFix = async (challengeData, userCode) => {
  try {
    return await callAI(evaluatePrompt(challengeData, userCode));
  } catch (err) {
    console.error('AI evaluation error:', {
      message: err?.message,
      code: err?.code,
      status: err?.response?.status,
    });

    return {
      fixed: null,
      feedback: 'AI service unavailable',
    };
  }
};

/* =========================
   PROMPTS
========================= */

function evaluatePrompt(challengeData, userCode) {
  return {
    model: 'openai/gpt-4.1-mini',
    max_tokens: 120,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'You are a security evaluator. Evaluate ONLY the user code fix. Ignore system code, backend logic, or infrastructure. Return ONLY JSON: {"fixed":true,"feedback":"..."} or {"fixed":false,"feedback":"..."}. If unsure, return false.',
      },
      {
        role: 'user',
        content: `
VULNERABILITY:
${challengeData.description || 'N/A'}

USER CODE:
${userCode || ''}
        `,
      },
    ],
  };
}

function generateFeedbackPrompt(challengeData, userAnswer) {
  return {
    model: 'openai/gpt-4.1-mini',
    max_tokens: 120,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'You are a strict security reviewer. Return ONLY JSON: {"fixed":true,"feedback":"..."} or {"fixed":false,"feedback":"..."}. No extra text.',
      },
      {
        role: 'user',
        content: `
CHALLENGE: ${challengeData.title || ''}
DESCRIPTION: ${challengeData.description || ''}
HINTS: ${(challengeData.hints || []).join(', ')}

ANSWER:
${userAnswer || ''}
        `,
      },
    ],
  };
}

/* =========================
   AI CALL CORE (CLEAN)
========================= */

async function callAI(body) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const res = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  const text = res.data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    return { fixed: null, feedback: 'Empty AI response' };
  }

  const json = safeParse(text);

  return {
    fixed: typeof json.fixed === 'boolean' ? json.fixed : null,
    feedback: json.feedback || 'No feedback provided',
  };
}

/* =========================
   HELPERS
========================= */

function safeParse(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : '{}');
  } catch {
    return {};
  }
}

function fallbackFeedback(challengeData) {
  const hints = challengeData?.hints || [];
  if (hints.length) return hints[Math.floor(Math.random() * hints.length)];
  return challengeData?.description
    ? 'Review the challenge requirements.'
    : 'Incorrect answer.';
}