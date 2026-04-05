import "dotenv/config";
import prisma from "../src/prismaClient.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const questionsPath = path.join(__dirname, "../data/questions.json");

async function main() {
  const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
  const backend = questions.filter((q) => q.domain === "BACKEND");

  let inserted = 0;
  let skipped = 0;

  for (const q of backend) {
    const existing = await prisma.question.findFirst({
      where: {
        domain: q.domain,
        difficulty: q.difficulty,
        question: q.question,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.question.create({
      data: {
        domain: q.domain,
        difficulty: q.difficulty,
        question: q.question,
        keywords: q.keywords,
        tags: q.tags,
        weight: q.weight,
      },
    });
    inserted++;
  }

  console.log(`✅ Backend questions: ${inserted} inserted, ${skipped} already in database`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
