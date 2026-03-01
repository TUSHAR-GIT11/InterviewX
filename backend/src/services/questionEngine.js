import prisma from "../prismaClient.js";
export async function generateQuestions(domain, difficulty, count, userId) {
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
        }
      }
    });
  } else {
    questions = await prisma.question.findMany({
      where: { domain, difficulty }
    });
  }

  if (questions.length === 0) {
    throw new Error("No question found");
  }   

  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}