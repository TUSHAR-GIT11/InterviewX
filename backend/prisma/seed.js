import prisma from "../src/prismaClient.js";
import fs from "fs";

async function main() {
  const questions = JSON.parse(
    fs.readFileSync("./data/questions.json", "utf-8")
  );

  await prisma.question.createMany({
    data: questions,
    skipDuplicates: true
  });

  console.log("✅ Questions inserted successfully");

  // Seed achievements
  const achievements = [
    {
      name: "First Steps",
      description: "Complete your first interview",
      icon: "🎯",
      category: "milestone"
    },
    {
      name: "On Fire",
      description: "Maintain a 3-day streak",
      icon: "🔥",
      category: "streak"
    },
    {
      name: "Lightning",
      description: "Maintain a 7-day streak",
      icon: "⚡",
      category: "streak"
    },
    {
      name: "Unstoppable",
      description: "Maintain a 30-day streak",
      icon: "🚀",
      category: "streak"
    },
    {
      name: "Perfectionist",
      description: "Score 90+ on an interview",
      icon: "💯",
      category: "score"
    },
    {
      name: "Champion",
      description: "Score 95+ on an interview",
      icon: "🏆",
      category: "score"
    },
    {
      name: "Flawless",
      description: "Score 100 on an interview",
      icon: "💎",
      category: "score"
    },
    {
      name: "Knowledge Seeker",
      description: "Complete 10 interviews",
      icon: "📚",
      category: "milestone"
    },
    {
      name: "Dedicated Learner",
      description: "Complete 25 interviews",
      icon: "📖",
      category: "milestone"
    },
    {
      name: "Expert",
      description: "Complete 50 interviews",
      icon: "🎓",
      category: "milestone"
    },
    {
      name: "Master",
      description: "Complete 100 interviews",
      icon: "🌟",
      category: "milestone"
    },
    {
      name: "Frontend Specialist",
      description: "Complete 20 frontend interviews",
      icon: "⚛️",
      category: "domain"
    },
    {
      name: "Backend Specialist",
      description: "Complete 20 backend interviews",
      icon: "🔧",
      category: "domain"
    },
    {
      name: "HR Pro",
      description: "Complete 20 HR interviews",
      icon: "💼",
      category: "domain"
    },
    {
      name: "Jack of All Trades",
      description: "Complete interviews in all domains",
      icon: "🎭",
      category: "domain"
    }
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement
    });
  }

  console.log("✅ Achievements inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });