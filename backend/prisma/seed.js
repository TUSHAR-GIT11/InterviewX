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
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });