import prisma from "../prismaClient.js";
export async function generateQuestions(domain, difficulty, count, userId) {

  const recentInterviews = await prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { questionIds: true }
  });

  const recentQuestionIds = recentInterviews
    .flatMap(interview => interview.questionIds || []);

  const weakTags = await prisma.userTagPerformance.findMany({
    where: { userId },
    orderBy: { score: "asc" },
    take: 3
  });

  const weakTagNames = weakTags.map(t => t.tag);

  let questions;

  
  if (weakTagNames.length > 0) {
    questions = await prisma.question.findMany({
      where: {
        domain,
        difficulty,
        tags: {
          hasSome: weakTagNames
        },
        id: {
          notIn: recentQuestionIds
        }
      },
      distinct: ['question'] 
    });
  }

  
  if (!questions || questions.length < count) {
    questions = await prisma.question.findMany({
      where: { 
        domain, 
        difficulty,
        id: {
          notIn: recentQuestionIds
        }
      },
      distinct: ['question']
    });
  }


  if (questions.length < count) {
    questions = await prisma.question.findMany({
      where: { domain, difficulty },
      distinct: ['question']
    });
  }

  if (questions.length === 0) {
    throw new Error("No questions found for the selected criteria");
  }

  console.log(`Found ${questions.length} questions for ${domain} ${difficulty}`);


  const questionMap = new Map();
  questions.forEach(q => {
    if (!questionMap.has(q.question)) {
      questionMap.set(q.question, q);
    }
  });

  
  const uniqueQuestions = Array.from(questionMap.values());
  const shuffled = uniqueQuestions.sort(() => 0.5 - Math.random());

  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  
  console.log(`Selected ${selected.length} unique questions`);
  console.log('Question IDs:', selected.map(q => q.id));
  
  return selected;
}