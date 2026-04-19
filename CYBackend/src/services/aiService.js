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

async function evaluateWithAI(challengeData, userCode) {
  const prompt = `
You are a security evaluation system for code in the Challenge Section.

Goal
Verify whether the user has fixed the security vulnerability present in the initial code.

Inputs
* Title: ${challengeData.title}
* Description: ${challengeData.description}
* Level: ${challengeData.level}
* Initial Code: ${challengeData.initialCode}
* User Code: ${userCode}
* Recommendation: ${challengeData.recommendation}

How it works
* The initial code contains an intentional security vulnerability.
* The user is only required to fix that vulnerability.
* Do not evaluate general code functionality.
* Compare security posture only between Initial Code and User Code.

Analysis method
* Understand the vulnerability in the Initial Code.
* Check whether the User Code has correctly fixed the same vulnerability.
* Do not treat unrelated changes as significant.
* Use Recommendation only for context.

Evaluation cases
* If the vulnerability is fixed correctly → the user earns full Level points.
* If the vulnerability remains or is fixed incorrectly → the user earns 0 or partial points depending on the case.

Evaluation rules
* Focus only on the intended vulnerability.
* Ignore improvements outside the vulnerability scope.
* Accept more than one correct fix method.
* Reject superficial fixes that do not prevent exploitation.

Possible vulnerability types
* Injection
* XSS
* Path Traversal
* IDOR
* Authentication flaw
* Authorization flaw
* Missing validation
* Unsafe input handling

Required output
Return a JSON object:
{
  "fixed": boolean,
  "feedback": string
}

Rules:
* English only in feedback
* Max 3 sentences
* No full solutions
* Focus only on vulnerability fix
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
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

  try {
    const result = JSON.parse(text);
    return result;
  } catch (err) {
    console.error("JSON PARSE FAILED");
    console.error("RAW TEXT:", text);
    console.error("ERROR:", err);

    throw new Error("JSON parsing failed");
  }
}