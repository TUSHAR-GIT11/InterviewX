// Grok AI-powered interview question generation and evaluation

export async function generateAIQuestion(domain, difficulty, previousQuestions = []) {
  const grokApiKey = process.env.GROK_API_KEY;
  
  console.log(`🔍 Checking Grok API Key: ${grokApiKey ? '✅ Found' : '❌ Missing'}`);
  
  if (!grokApiKey) {
    throw new Error("Grok API key not configured");
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
    console.log(`📡 Calling Grok API for ${domain} ${difficulty} question...`);
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokApiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer. Generate unique, practical interview questions in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "grok-4",
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Grok API Error: ${response.status} ${response.statusText}`);
      console.error(`📄 Error details: ${errorText}`);
      throw new Error(`Grok API error: ${response.status}`);
    }

    console.log(`✅ Grok API responded successfully`);
    const data = await response.json();
    const questionData = JSON.parse(data.choices[0].message.content);
    
    console.log(`📝 Generated question: "${questionData.question.substring(0, 80)}..."`);
    
    return {
      question: questionData.question,
      keywords: questionData.keywords || [],
      expectedPoints: questionData.expectedPoints || [],
      domain,
      difficulty
    };
  } catch (error) {
    console.error("Error generating AI question:", error);
    throw error;
  }
}

export async function evaluateAnswerWithAI(question, answer, keywords, difficulty, expectedPoints) {
  const grokApiKey = process.env.GROK_API_KEY;
  
  if (!grokApiKey) {
    console.log("Grok API key not found");
    throw new Error("Grok API key not configured");
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
  "missedConcepts": ["<concepts from THIS question that were missed>"],
  "isRelevant": <true if answer addresses the question, false otherwise>
}

IMPORTANT: Be STRICT. If they answered about var/let/const when asked about CSS Flexbox, score should be 0-5.`;

  try {
    console.log(`Evaluating with Grok AI: "${question}"`);
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokApiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a STRICT technical interviewer. Check if answers are relevant to the question asked. Give low scores (0-10) for completely wrong answers."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "grok-4",
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Grok API error: ${response.status} - ${errorText}`);
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0].message.content);
    
    console.log(`Grok evaluation - Score: ${evaluation.score}, Relevant: ${evaluation.isRelevant}`);
    
    return {
      score: Math.min(Math.max(Math.round(evaluation.score), 0), 100),
      feedback: evaluation.feedback,
      coveredConcepts: evaluation.coveredConcepts || [],
      missedConcepts: evaluation.missedConcepts || [],
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || []
    };
  } catch (error) {
    console.error("Grok AI evaluation failed:", error.message);
    throw error;
  }
}
