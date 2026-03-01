-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "weight" INTEGER NOT NULL DEFAULT 1;
