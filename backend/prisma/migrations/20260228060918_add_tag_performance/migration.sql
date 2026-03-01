-- CreateTable
CREATE TABLE "UserTagPerformance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserTagPerformance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTagPerformance" ADD CONSTRAINT "UserTagPerformance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
