
export async function evaluateAnswerWithGemini(question, answer, keywords, difficulty) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  console.log(`🔍 Checking Gemini API Key: ${geminiApiKey ? '✅ Found' : '❌ Missing'}`);
  
  if (!geminiApiKey) {
    console.log("Gemini API key not found");
    throw new Error("Gemini API key not configured");
  }

  // Handle empty answers
  if (!answer || answer.trim().length === 0) {
    return {
      score: 0,
      feedback: "No answer provided. Please attempt to answer the question to receive a score.",
      coveredConcepts: [],
      missedConcepts: keywords,
    };
  }

  const prompt = `You are a STRICT technical interviewer. Your job is to check if the candidate answered the CORRECT question.

QUESTION ASKED: ${question}
CANDIDATE'S ANSWER: ${answer}

STEP 1: Does the answer address the question asked?
- If the candidate answered a COMPLETELY DIFFERENT question, score = 0-5
- If partially relevant but mostly off-topic, score = 10-20
- If relevant but incomplete, score = 30-70
- If relevant and complete, score = 70-100

Expected Keywords for THIS question: ${keywords.join(", ")}
Difficulty: ${difficulty}

Provide evaluation in JSON format:
{
  "score": <0-100>,
  "feedback": "<Start with: 'Your answer is [relevant/not relevant] to the question.' Then provide 2-3 sentences of specific feedback>",
  "coveredConcepts": ["<only concepts from THIS question>"],
  "missedConcepts": ["<concepts from THIS question that were missed>"]
}

IMPORTANT: Be STRICT. If they answered about var/let/const when asked about CSS Flexbox, score should be 0-5.`;

  try {
    console.log(`📡 Calling Gemini API for evaluation...`);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API Error: ${response.status} ${response.statusText}`);
      console.error(`📄 Error details: ${errorText}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    console.log(`✅ Gemini API responded successfully`);
    const data = await response.json();
    
    // Extract text from Gemini response
    const textContent = data.candidates[0].content.parts[0].text;
    console.log(`📝 Raw response: ${textContent.substring(0, 100)}...`);
    
    // Extract JSON from markdown code blocks if present
    let jsonText = textContent;
    const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) || textContent.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    
    const evaluation = JSON.parse(jsonText);
    
    console.log(`📊 Gemini evaluation - Score: ${evaluation.score}`);
    
    return {
      score: Math.min(Math.max(Math.round(evaluation.score), 0), 100),
      feedback: evaluation.feedback,
      coveredConcepts: evaluation.coveredConcepts || [],
      missedConcepts: evaluation.missedConcepts || []
    };
  } catch (error) {
    console.error("Gemini AI evaluation failed:", error.message);
    throw error;
  }
}

export async function generateQuestionWithGemini(domain, difficulty, previousQuestions = []) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }

  const difficultyGuide = {
    EASY: "beginner-friendly, fundamental concepts",
    MEDIUM: "intermediate level, practical application",
    HARD: "advanced concepts, system design, optimization"
  };

  const domainContext = {
    FRONTEND: "HTML, CSS, JavaScript, React, Next.js, web development",
    BACKEND: "Node.js, APIs, databases, authentication, server-side",
    HR: "behavioral questions, situational scenarios, soft skills"
  };

  const previousQuestionsText = previousQuestions.length > 0 
    ? `\n\nPreviously asked questions (DO NOT repeat these):\n${previousQuestions.join('\n')}`
    : '';

  const prompt = `You are an expert technical interviewer. Generate ONE unique interview question.

Domain: ${domain} (${domainContext[domain]})
Difficulty: ${difficulty} (${difficultyGuide[difficulty]})${previousQuestionsText}

Provide response in JSON format:
{
  "question": "<the interview question>",
  "keywords": ["<key concept 1>", "<key concept 2>", "<key concept 3>"],
  "expectedPoints": ["<point 1>", "<point 2>", "<point 3>"]
}

Make the question specific, practical, and relevant to real-world scenarios.`;

  try {
    console.log(`📡 Calling Gemini API for question generation...`);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.candidates[0].content.parts[0].text;
    
    console.log(`📝 Raw Gemini response: ${textContent.substring(0, 150)}...`);
    
    // Extract JSON from markdown code blocks or plain text
    let jsonText = textContent.trim();
    
    // Try to extract from ```json ... ``` blocks
    let jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      // Try to extract from ``` ... ``` blocks
      jsonMatch = jsonText.match(/```\s*([\s\S]*?)\s*```/);
    }
    
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    
    // Remove any remaining backticks or "json" prefix
    jsonText = jsonText.replace(/^`+|`+$/g, '').replace(/^json\s*/i, '').trim();
    
    // If it starts with { or [, it's probably valid JSON
    if (!jsonText.startsWith('{') && !jsonText.startsWith('[')) {
      // Try to find the first { or [
      const jsonStart = jsonText.search(/[{\[]/);
      if (jsonStart !== -1) {
        jsonText = jsonText.substring(jsonStart);
      }
    }
    
    console.log(`🔧 Cleaned JSON: ${jsonText.substring(0, 100)}...`);
    
    const questionData = JSON.parse(jsonText);
    
    console.log(`✅ Generated question: "${questionData.question.substring(0, 60)}..."`);
    
    return {
      question: questionData.question,
      keywords: questionData.keywords || [],
      expectedPoints: questionData.expectedPoints || [],
      domain,
      difficulty
    };
  } catch (error) {
    console.error("Error generating Gemini question:", error);
    throw error;
  }
}