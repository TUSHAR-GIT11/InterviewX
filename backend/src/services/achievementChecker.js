import prisma from "../prismaClient.js";

export async function checkAndUnlockAchievements(userId, interviewScore) {
  const newlyUnlocked = [];

  // Get user's interview stats
  const totalInterviews = await prisma.interview.count({
    where: { userId }
  });

  const interviews = await prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  
  const streak = calculateStreak(interviews);

  
  const domainCounts = await prisma.interview.groupBy({
    by: ['domain'],
    where: { userId },
    _count: { domain: true }
  });

  
  const allAchievements = await prisma.achievement.findMany();

  
  const unlockedAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true }
  });
  const unlockedIds = new Set(unlockedAchievements.map(ua => ua.achievementId));


  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue; 

    let shouldUnlock = false;


    if (achievement.name === "First Steps" && totalInterviews >= 1) {
      shouldUnlock = true;
    }
    if (achievement.name === "Knowledge Seeker" && totalInterviews >= 10) {
      shouldUnlock = true;
    }
    if (achievement.name === "Dedicated Learner" && totalInterviews >= 25) {
      shouldUnlock = true;
    }
    if (achievement.name === "Expert" && totalInterviews >= 50) {
      shouldUnlock = true;
    }
    if (achievement.name === "Master" && totalInterviews >= 100) {
      shouldUnlock = true;
    }

    
    if (achievement.name === "On Fire" && streak >= 3) {
      shouldUnlock = true;
    }
    if (achievement.name === "Lightning" && streak >= 7) {
      shouldUnlock = true;
    }
    if (achievement.name === "Unstoppable" && streak >= 30) {
      shouldUnlock = true;
    }

    
    if (achievement.name === "Perfectionist" && interviewScore >= 90) {
      shouldUnlock = true;
    }
    if (achievement.name === "Champion" && interviewScore >= 95) {
      shouldUnlock = true;
    }
    if (achievement.name === "Flawless" && interviewScore === 100) {
      shouldUnlock = true;
    }

    
    const frontendCount = domainCounts.find(d => d.domain === 'FRONTEND')?._count.domain || 0;
    const backendCount = domainCounts.find(d => d.domain === 'BACKEND')?._count.domain || 0;
    const hrCount = domainCounts.find(d => d.domain === 'HR')?._count.domain || 0;

    if (achievement.name === "Frontend Specialist" && frontendCount >= 20) {
      shouldUnlock = true;
    }
    if (achievement.name === "Backend Specialist" && backendCount >= 20) {
      shouldUnlock = true;
    }
    if (achievement.name === "HR Pro" && hrCount >= 20) {
      shouldUnlock = true;
    }
    if (achievement.name === "Jack of All Trades" && frontendCount > 0 && backendCount > 0 && hrCount > 0) {
      shouldUnlock = true;
    }

    // Unlock achievement
    if (shouldUnlock) {
      try {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        });
        newlyUnlocked.push(achievement);
      } catch (error) {
        // Achievement already unlocked, skip
        if (!error.code || error.code !== 'P2002') {
          throw error; // Re-throw if it's not a unique constraint error
        }
      }
    }
  }

  return newlyUnlocked;
}


function calculateStreak(interviews) {
  if (interviews.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  
  const lastInterview = new Date(interviews[0].createdAt);
  lastInterview.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastInterview) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 1) return 0; // Streak broken

  // Count consecutive days
  for (let i = 1; i < interviews.length; i++) {
    const current = new Date(interviews[i - 1].createdAt);
    const previous = new Date(interviews[i].createdAt);
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    const diff = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      streak++;
    } else if (diff === 0) {
      continue; 
    } else {
      break; 
    }
  }

  return streak;
}
