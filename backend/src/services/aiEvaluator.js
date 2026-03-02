// AI-powered answer evaluation using Grok API (xAI)

export async function evaluateAnswer(question, answer, keywords, difficulty) {
  // Handle empty answers
  if (!answer || answer.trim().length === 0 || answer.toLowerCase().includes('no answer provided')) {
    return {
      score: 0,
      feedback: "No answer provided. Please attempt to answer the question to receive a score.",
      coveredConcepts: [],
      missedConcepts: keywords,
    };
  }

  // Check for non-answers
  const answerLower = answer.toLowerCase();
  const nonAnswers = ['dont know', "don't know", 'not sure', 'no idea', 'idk', 'dunno'];
  const isNonAnswer = nonAnswers.some(phrase => answerLower.includes(phrase)) && answer.length < 50;
  
  if (isNonAnswer) {
    return {
      score: 0,
      feedback: "Your answer indicates lack of knowledge. Please study the topic and try again.",
      coveredConcepts: [],
      missedConcepts: keywords,
    };
  }

  // Try Grok API first
  try {
    const grokApiKey = process.env.GROK_API_KEY;
    
    if (grokApiKey) {
      const prompt = `You are an expert technical interviewer. Evaluate this interview answer.

Question: ${question}
Expected Keywords: ${keywords.join(", ")}
Difficulty: ${difficulty}
Candidate's Answer: ${answer}

Provide evaluation in JSON format:
{
  "score": <0-100>,
  "feedback": "<2-3 sentences with specific improvements>",
  "coveredConcepts": ["<concept1>", "<concept2>"],
  "missedConcepts": ["<concept1>", "<concept2>"]
}

Score based on: accuracy (40%), completeness (30%), keyword coverage (20%), clarity (10%)`;

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
              content: "You are an expert technical interviewer. Provide fair, constructive evaluations in valid JSON format only."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: "grok-4",
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const evaluation = JSON.parse(data.choices[0].message.content);
        
        return {
          score: Math.min(Math.max(Math.round(evaluation.score), 0), 100),
          feedback: evaluation.feedback,
          coveredConcepts: evaluation.coveredConcepts || [],
          missedConcepts: evaluation.missedConcepts || []
        };
      }
    }
  } catch (error) {
    console.log("Grok API unavailable, using enhanced evaluation");
  }

  // Fallback to enhanced keyword evaluation
  return enhancedKeywordEvaluation(question, answer, keywords, difficulty);
}

function enhancedKeywordEvaluation(question, answer, keywords, difficulty) {
  const answerLower = answer.toLowerCase();
  const answerWords = new Set(answerLower.split(/\W+/).filter(w => w.length > 2));
  
  // Advanced keyword matching
  const coveredConcepts = [];
  const missedConcepts = [];
  let keywordMatchScore = 0;

  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const keywordParts = keywordLower.split(/\W+/).filter(w => w.length > 2);
    
    // Exact phrase match
    if (answerLower.includes(keywordLower)) {
      coveredConcepts.push(keyword);
      keywordMatchScore += 1.0;
      return;
    }
    
    // Partial match
    const matchedParts = keywordParts.filter(part => {
      return Array.from(answerWords).some(answerWord => {
        return answerWord.includes(part) || part.includes(answerWord) ||
               levenshteinDistance(answerWord, part) <= 2;
      });
    });
    
    const matchRatio = matchedParts.length / keywordParts.length;
    
    if (matchRatio >= 0.7) {
      coveredConcepts.push(keyword);
      keywordMatchScore += matchRatio;
    } else if (matchRatio >= 0.4) {
      coveredConcepts.push(keyword);
      keywordMatchScore += matchRatio * 0.5;
    } else {
      missedConcepts.push(keyword);
    }
  });

  const keywordScore = Math.min((keywordMatchScore / keywords.length) * 100, 100);

  // Content quality analysis
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const hasExamples = /for example|such as|like|e\.g\.|i\.e\.|instance/i.test(answer);
  const hasExplanation = /because|since|therefore|thus|hence|so that|in order to/i.test(answer);
  const hasStructure = sentences.length >= 2;
  const hasProperLength = answer.length >= 100;
  const hasTechnicalDepth = answerWords.size >= 20;
  
  let qualityScore = 0;
  if (hasExamples) qualityScore += 20;
  if (hasExplanation) qualityScore += 20;
  if (hasStructure) qualityScore += 20;
  if (hasProperLength) qualityScore += 20;
  if (hasTechnicalDepth) qualityScore += 20;

  // Length score
  const minLengthByDifficulty = {
    'EASY': 80,
    'MEDIUM': 120,
    'HARD': 180
  };
  
  const requiredLength = minLengthByDifficulty[difficulty] || 100;
  const lengthScore = Math.min((answer.length / requiredLength) * 100, 100);

  // Penalize very short answers
  if (answer.length < 30) {
    return {
      score: Math.min(keywordScore * 0.3, 20),
      feedback: "Your answer is too brief. Provide a comprehensive explanation with more detail and examples.",
      coveredConcepts,
      missedConcepts,
    };
  }

  // Final weighted score
  const finalScore = Math.round(
    keywordScore * 0.50 +
    qualityScore * 0.30 +
    lengthScore * 0.20
  );

  const feedback = generateIntelligentFeedback(
    finalScore,
    keywordScore,
    qualityScore,
    coveredConcepts,
    missedConcepts,
    hasExamples,
    hasExplanation,
    answer.length,
    difficulty
  );

  return {
    score: Math.min(Math.max(finalScore, 0), 100),
    feedback,
    coveredConcepts,
    missedConcepts,
  };
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function generateIntelligentFeedback(
  score,
  keywordScore,
  qualityScore,
  coveredConcepts,
  missedConcepts,
  hasExamples,
  hasExplanation,
  answerLength,
  difficulty
) {
  let feedback = "";
  
  if (score >= 90) {
    feedback = "Outstanding answer! You demonstrated excellent understanding with comprehensive coverage and clear explanations. ";
  } else if (score >= 80) {
    feedback = "Very good answer! You showed strong grasp of the concepts with good detail. ";
  } else if (score >= 70) {
    feedback = "Good answer! You covered the main points but could add more depth. ";
  } else if (score >= 60) {
    feedback = "Satisfactory answer. You have basic understanding but need to elaborate more. ";
  } else if (score >= 40) {
    feedback = "Below average answer. You're missing key concepts and need more detail. ";
  } else {
    feedback = "Insufficient answer. Please review the topic thoroughly and provide comprehensive explanations. ";
  }

  const improvements = [];
  
  if (keywordScore < 60 && missedConcepts.length > 0) {
    improvements.push(`Cover these important concepts: ${missedConcepts.slice(0, 3).join(", ")}`);
  }
  
  if (!hasExamples && score < 80) {
    improvements.push("Include practical examples to illustrate your points");
  }
  
  if (!hasExplanation && score < 80) {
    improvements.push("Explain the 'why' and 'how' behind the concepts");
  }
  
  if (answerLength < 100) {
    improvements.push("Provide more detailed explanations");
  }
  
  if (qualityScore < 60) {
    improvements.push("Structure your answer better with clear sentences");
  }

  if (improvements.length > 0) {
    feedback += "To improve: " + improvements.join("; ") + ". ";
  }

  if (coveredConcepts.length > 0) {
    feedback += `Strong points: ${coveredConcepts.slice(0, 3).join(", ")}.`;
  }

  return feedback.trim();
}
