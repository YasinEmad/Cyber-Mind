exports.generateIncorrectFeedback = async (challengeData, userAnswer) => {
  try {
    const aiResult = await generateFeedbackWithAI(challengeData, userAnswer);
    if (aiResult?.feedback) return aiResult.feedback;
    if (typeof aiResult === 'string' && aiResult.trim()) return aiResult.trim();
    return getFallbackIncorrectFeedback(challengeData);
  } catch (error) {
    console.error("AI feedback generation failed:", error);
    return getFallbackIncorrectFeedback(challengeData);
  }
};

exports.evaluateSecurityFix = async (challengeData, userCode) => {
  try {
    const aiResult = await evaluateWithAI(challengeData, userCode);
    return aiResult;
  } catch (error) {
    console.error("AI evaluation failed:", error);

    return {
      fixed: false,
      feedback: "Evaluation service is temporarily unavailable. Please try again in a moment."
    };
  }
};

function getFallbackIncorrectFeedback(challengeData) {
  const hints = challengeData.hints || [];
  if (hints.length > 0) {
    return hints[Math.floor(Math.random() * hints.length)];
  }

  if (challengeData.description) {
    return `Review the challenge requirements and try again.`;
  }

  return 'Incorrect answer. Try again!';
}


// Extract relevant code lines to reduce token count
function extractRelevantCode(code) {
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
  // Extract relevant code sections only
  const initialCodeRelevant = extractRelevantCode(challengeData.initialCode);
  const userCodeRelevant = extractRelevantCode(userCode);

  const prompt = `Initial Code:\n${initialCodeRelevant}\n\nUser Code:\n${userCodeRelevant}\n\nVulnerability: ${challengeData.description}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: "You are a security fix evaluator. Analyze code changes and determine if a vulnerability is fixed. Return ONLY valid JSON with 'fixed' (boolean) and 'feedback' (max 15 words) fields. No explanations outside JSON."
        }]
      },
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 100
      }
    })
  });

  const data = await response.json();

  console.log("GEMINI RAW RESPONSE");
  console.log(JSON.stringify(data, null, 2));

  if (!response.ok || data.error) {
    console.error("STATUS:", response.status);
    console.error("API ERROR:", data.error);

    const errorMessage = data.error?.message || response.statusText;

    if (data.error?.code === 429) {
      throw new Error("Quota exceeded");
    }

    throw new Error(`API Error: ${errorMessage}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  console.log("EXTRACTED TEXT");
  console.log(text);

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return parseAIResponse(text);
}

async function generateFeedbackWithAI(challengeData, userAnswer) {
  const prompt = `Challenge: ${challengeData.title}
Description: ${challengeData.description}
Hints: ${challengeData.hints?.join(', ') || 'None'}
User Answer: ${userAnswer}

Generate a short, helpful feedback message (max 20 words) for why this answer is incorrect and a hint to guide the user.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: "You are a helpful tutor for coding challenges. Provide short, encouraging feedback for incorrect answers. Return ONLY valid JSON with 'feedback' field containing a string (max 20 words)."
        }]
      },
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 50
      }
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(`API Error: ${data.error?.message || response.statusText}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return parseAIResponse(text);
}

function parseAIResponse(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Empty text from AI response");
  }

  try {
    return JSON.parse(trimmed);
  } catch (firstErr) {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (secondErr) {
        console.error("JSON parsing failed on extracted substring", secondErr);
      }
    }

    // If the AI returned a plain text message instead of JSON, use it directly.
    return { feedback: trimmed };
  }
}

