const axios = require('axios');

exports.generateIncorrectFeedback = async (challengeData, userAnswer) => {
  try {
    const aiResult = await generateFeedbackWithAI(challengeData, userAnswer);
    if (aiResult?.feedback) return aiResult.feedback;
    if (typeof aiResult === 'string' && aiResult.trim()) return aiResult.trim();
    return getFallbackIncorrectFeedback(challengeData);
  } catch (error) {
    console.error('AI feedback generation failed:', error);
    return getFallbackIncorrectFeedback(challengeData);
  }
};

exports.evaluateSecurityFix = async (challengeData, userCode) => {
  try {
    const aiResult = await evaluateWithAI(challengeData, userCode);
    return aiResult;
  } catch (error) {
    console.error('AI evaluation failed:', error);

    return {
      fixed: false,
      feedback: 'AI is not ready right now. Please come back later.'
    };
  }
};

function getFallbackIncorrectFeedback(challengeData) {
  const hints = challengeData.hints || [];
  if (hints.length > 0) {
    return hints[Math.floor(Math.random() * hints.length)];
  }

  if (challengeData.description) {
    return 'Review the challenge requirements and try again.';
  }

  return 'Incorrect answer. Try again!';
}

// Extract relevant code lines to reduce token count
function extractRelevantCode(code) {
  if (typeof code !== 'string' || !code) {
    return '';
  }

  const keywordPatterns = ['query', 'req', 'input', 'db', 'execute', 'eval', 'setTimeout', 'innerHTML', 'dangerouslySetInnerHTML', 'sql', 'password', 'token', 'auth', 'validate', 'sanitize', 'params', 'join'];
  const lines = code.split('\n');
  const relevantLines = lines.filter(line => 
    keywordPatterns.some(keyword => line.toLowerCase().includes(keyword))
  );
  return relevantLines.length > 0 
    ? relevantLines.slice(0, 30).join('\n') 
    : lines.slice(0, 30).join('\n');
}

async function evaluateWithAI(challengeData, userCode) {
  const initialCodeRelevant = extractRelevantCode(challengeData.initialCode || '');
  const userCodeRelevant = extractRelevantCode(userCode || '');

  const prompt = `Initial Code:\n${initialCodeRelevant}\n\nUser Code:\n${userCodeRelevant}\n\nVulnerability: ${challengeData.description || 'Not provided'}`;

  const requestBody = {
    model: 'openai/gpt-4.1-mini',
    max_tokens: 80,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'You are a strict JSON API.\n\nRules:\n- Return ONLY valid minified JSON\n- No markdown\n- No explanations\n- No code blocks\n- No extra text\n- Response format must always be:\n{"fixed":true,"feedback":"..."}\nor\n{"fixed":false,"feedback":"..."}\n\nKeep feedback very short.'
      },
      {
        role: 'user',
        content: `Return only valid JSON with keys "fixed" (boolean) and "feedback" (string). ${prompt}`
      }
    ]
  };

  return sendOpenRouterRequest(requestBody);
}

async function generateFeedbackWithAI(challengeData, userAnswer) {
  const prompt = `Challenge: ${challengeData.title}\nDescription: ${challengeData.description}\nHints: ${challengeData.hints?.join(', ') || 'None'}\nUser Answer: ${userAnswer}`;

  const requestBody = {
    model: 'openai/gpt-4.1-mini',
    max_tokens: 80,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'You are a strict JSON API.\n\nRules:\n- Return ONLY valid minified JSON\n- No markdown\n- No explanations\n- No code blocks\n- No extra text\n- Response format must always be:\n{"fixed":true,"feedback":"..."}\nor\n{"fixed":false,"feedback":"..."}\n\nKeep feedback very short.'
      },
      {
        role: 'user',
        content: `Return only valid JSON with keys "fixed" (boolean) and "feedback" (string). ${prompt}`
      }
    ]
  };

  return sendOpenRouterRequest(requestBody);
}

async function sendOpenRouterRequest(body) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable');
  }

  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const response = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  const content = String(response.data?.choices?.[0]?.message?.content || '').trim();
  if (!content) {
    console.error('Unexpected OpenRouter response:', JSON.stringify(response?.data, null, 2));
    return { fixed: false, feedback: 'AI response parsing failed' };
  }

  try {
    const parsed = JSON.parse(content);

    const candidate = parsed.fixed ?? parsed.success ?? parsed.result ?? parsed.status;

    const isTruthy = (v) => {
      if (v === true || v === 1) return true;
      if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        return ['true', 'yes', 'y', '1', 'ok', 'fixed', 'correct'].includes(s);
      }
      return false;
    };

    const fixed = isTruthy(candidate);

    const feedback = (typeof parsed.feedback === 'string' && parsed.feedback.trim())
      ? parsed.feedback.trim()
      : (typeof parsed.message === 'string' && parsed.message.trim())
        ? parsed.message.trim()
        : 'AI response parsing failed';

    return { fixed, feedback };
  } catch (error) {
    console.error('Failed to parse AI JSON response:', content);

    return {
      fixed: false,
      feedback: 'AI response parsing failed'
    };
  }
}

