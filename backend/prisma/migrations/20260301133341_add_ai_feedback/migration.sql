-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "coveredConcepts" TEXT[],
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "missedConcepts" TEXT[];
