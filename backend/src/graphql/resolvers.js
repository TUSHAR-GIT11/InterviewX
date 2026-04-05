import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateQuestions } from "../services/questionEngine.js";
import { evaluateAnswer } from "../services/aiEvaluator.js";
import { evaluateAnswerWithGemini } from "../services/geminiEvaluator.js";
import { checkAndUnlockAchievements } from "../services/achievementChecker.js";

const requireAdmin = (user) => {
  if (!user) {
    throw new Error('Authentication required')
  }
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
}

const resolvers = {
  Query: {
    hello: () => "InterviewX GraphQL API Running 🚀",
    getUserStats: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const userId = context.user.userId;
      const interviews = await prisma.interview.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      const totalInterviews = interviews.length;

      const avgScore = totalInterviews > 0
        ? interviews.reduce((sum, interview) => sum + interview.score, 0) / totalInterviews
        : 0;


      let streak = 0;
      if (interviews.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentDate = new Date(today);

        for (let i = 0; i < interviews.length; i++) {
          const interviewDate = new Date(interviews[i].createdAt);
          interviewDate.setHours(0, 0, 0, 0);

          const diffDays = Math.floor((currentDate - interviewDate) / (1000 * 60 * 60 * 24));

          if (diffDays === 0 || diffDays === 1) {
            if (diffDays === 1) {
              streak++;
              currentDate = new Date(interviewDate);
            }
          } else {
            break;
          }
        }


        const todayInterview = interviews.some(interview => {
          const interviewDate = new Date(interview.createdAt);
          interviewDate.setHours(0, 0, 0, 0);
          return interviewDate.getTime() === today.getTime();
        });

        if (todayInterview) {
          streak++;
        }
      }

      return {
        totalInterviews,
        avgScore: Math.round(avgScore),
        streak
      };
    },
    getMe: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      const user = await prisma.user.findUnique({
        where: { id: context.user.userId }
      })

      if (!user) {
        throw new Error("User not found")
      }

      return user
    },
    getInterviewHistory: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      console.log("🔍 User ID:", context.user.userId)

      const interviews = await prisma.interview.findMany({
        where: { userId: context.user.userId },
        include: { responses: true },
        orderBy: { createdAt: 'desc' }
      })

      console.log("📊 Interviews found:", interviews.length)
      console.log("📋 Interview data:", JSON.stringify(interviews, null, 2))

      return interviews
    },
    getAllUsers: async (_, __, { user }) => {
      requireAdmin(user)
      const users = await prisma.user.findMany({
        include: {
          interviews: true
        }
      })
      return users.map((u) => (
        {
          ...u,
          totalInterviews: u.interviews.length,
          avgScore: u.interviews.length > 0
            ? Math.round(u.interviews.reduce((sum, interview) => sum + interview.score, 0) / u.interviews.length)
            : 0
        }
      ))

    },
    getAdminStats: async (_, __, { user }) => {
      requireAdmin(user)
      const totalUsers = await prisma.user.count()

      const totalQuestions = await prisma.question.count()

      const interviews = await prisma.interview.findMany({
        select: { score: true }
      })


      const totalInterviews = interviews.length


      const avgScore = interviews.length > 0
        ? Math.round(interviews.reduce((sum, interview) => sum + interview.score, 0) / interviews.length)
        : 0


      return {
        totalUsers,
        totalQuestions,
        totalInterviews,
        avgScore
      }
    },
    getAllQuestions: async (_, __, { user }) => {
      requireAdmin(user)
      const questions = await prisma.question.findMany({
        select: {
          id: true,
          domain: true,
          difficulty: true,
          question: true,
          keywords: true,
          tags: true,
          weight: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" }
      })
      return questions
    },
    getUserAchievements: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId: context.user.userId },
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" }
      })

      return userAchievements.map(ua => ({
        ...ua,
        unlockedAt: ua.unlockedAt.toISOString()
      }))
    },
    getAllAchievements: async()=>{
      return await prisma.achievement.findMany({
        orderBy:{ category:'asc' }
      })
    },
    getAnalyticsData: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      const userId = context.user.userId;
      
      // Get all interviews for the user
      const interviews = await prisma.interview.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      const totalInterviews = interviews.length;
      const avgScore = totalInterviews > 0
        ? Math.round(interviews.reduce((sum, i) => sum + i.score, 0) / totalInterviews)
        : 0;
      const bestScore = totalInterviews > 0
        ? Math.max(...interviews.map(i => i.score))
        : 0;

      // Calculate streak
      let streak = 0;
      if (interviews.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentDate = new Date(today);

        for (let i = 0; i < interviews.length; i++) {
          const interviewDate = new Date(interviews[i].createdAt);
          interviewDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((currentDate - interviewDate) / (1000 * 60 * 60 * 24));

          if (diffDays === 0 || diffDays === 1) {
            if (diffDays === 1) {
              streak++;
              currentDate = new Date(interviewDate);
            }
          } else {
            break;
          }
        }

        const todayInterview = interviews.some(interview => {
          const interviewDate = new Date(interview.createdAt);
          interviewDate.setHours(0, 0, 0, 0);
          return interviewDate.getTime() === today.getTime();
        });

        if (todayInterview) {
          streak++;
        }
      }

      // Monthly performance (last 12 months)
      const monthlyPerformance = Array(12).fill(0);
      const now = new Date();
      interviews.forEach(interview => {
        const monthDiff = (now.getFullYear() - interview.createdAt.getFullYear()) * 12 
          + (now.getMonth() - interview.createdAt.getMonth());
        if (monthDiff >= 0 && monthDiff < 12) {
          monthlyPerformance[11 - monthDiff] += interview.score;
        }
      });

      // Skill levels by difficulty (as percentage)
      const easyInterviews = interviews.filter(i => i.difficulty === 'EASY');
      const mediumInterviews = interviews.filter(i => i.difficulty === 'MEDIUM');
      const hardInterviews = interviews.filter(i => i.difficulty === 'HARD');

      console.log('📊 Analytics Debug:');
      console.log('Easy interviews:', easyInterviews.length, 'scores:', easyInterviews.map(i => i.score));
      console.log('Medium interviews:', mediumInterviews.length, 'scores:', mediumInterviews.map(i => i.score));
      console.log('Hard interviews:', hardInterviews.length, 'scores:', hardInterviews.map(i => i.score));

      // Calculate percentage scores (assuming max score per interview is around 50-100)
      // We'll normalize to 0-100 scale
      const calculatePercentage = (interviews) => {
        if (interviews.length === 0) return 0;
        const avgScore = interviews.reduce((sum, i) => sum + i.score, 0) / interviews.length;
        // Normalize: assuming typical max score is 50, convert to percentage
        return Math.min(100, Math.round((avgScore / 50) * 100));
      };

      const skillLevels = [
        calculatePercentage(easyInterviews),
        calculatePercentage(mediumInterviews),
        calculatePercentage(hardInterviews)
      ];

      console.log('Calculated skillLevels:', skillLevels);

      // Domain stats
      const frontendInterviews = interviews.filter(i => i.domain === 'FRONTEND');
      const backendInterviews = interviews.filter(i => i.domain === 'BACKEND');
      const hrInterviews = interviews.filter(i => i.domain === 'HR');

      const domainStats = [
        frontendInterviews.length,
        backendInterviews.length,
        hrInterviews.length
      ];

      return {
        totalInterviews,
        avgScore,
        bestScore,
        streak,
        monthlyPerformance,
        skillLevels,
        domainStats
      };
    }

  },

  Mutation: {
    signup: async (_, { name, email, password }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      const token = jwt.sign(
        { userId: newUser.id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return {
        token,
        user: newUser,
      };
    },

    login: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) throw new Error("User not found");

      const matchPassword = await bcrypt.compare(
        password,
        user.password
      );

      if (!matchPassword) throw new Error("Invalid password");

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return {
        token,
        user,
      };
    },
    startInterview: async (_, { domain, difficulty, count }, context) => {
      if (!context.user) {
        throw new Error("Not Authenticated")
      }

      console.log("\n🚀 ========== STARTING INTERVIEW ==========");
      console.log(`📋 Domain: ${domain}, Difficulty: ${difficulty}, Count: ${count}`);

      // Get questions from database
      const questions = await generateQuestions(domain, difficulty, count, context.user.userId);

      console.log(`✅ Loaded ${questions.length} questions from database`);
      console.log("==============================================\n");


      const interview = await prisma.interview.create({
        data: {
          userId: context.user.userId,
          domain,
          difficulty,
          score: 0,
          questionIds: questions.map(q => q.id)
        }
      })

      return {
        id: interview.id,
        questions
      }
    },
    submitAnswer: async (_, { interviewId, questionId, answer, questionText, keywords, difficulty }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      let question = await prisma.question.findUnique({ where: { id: questionId } })


      if (!question) {
        if (!questionText || !keywords || !difficulty) {
          throw new Error("For AI-generated questions, questionText, keywords, and difficulty are required");
        }
        question = {
          id: questionId,
          question: questionText,
          keywords: keywords,
          difficulty: difficulty,
          tags: keywords
        };
      }


      let evaluation;
      try {
        evaluation = await evaluateAnswerWithGemini(
          question.question,
          answer,
          question.keywords,
          question.difficulty
        );
        console.log("✅ Using Gemini AI evaluation - strict relevance checking");
      } catch (error) {
        console.log("⚠️  Gemini AI unavailable, using fallback evaluation");

        evaluation = await evaluateAnswer(
          question.question,
          answer,
          question.keywords,
          question.difficulty
        );
      }

      const score = evaluation.score


      console.log(`💾 Saving response for question ${questionId}...`);
      const response = await prisma.response.create({
        data: {
          interviewId,
          questionId,
          answer,
          score,
          feedback: evaluation.feedback,
          coveredConcepts: evaluation.coveredConcepts,
          missedConcepts: evaluation.missedConcepts
        }
      })
      console.log(`✅ Response saved with ID: ${response.id}, Score: ${score}`);


      if (question.tags && Array.isArray(question.tags)) {
        for (const tag of question.tags) {
          const existing = await prisma.userTagPerformance.findFirst({
            where: {
              userId: context.user.userId,
              tag
            }
          })

          if (existing) {
            await prisma.userTagPerformance.update({
              where: { id: existing.id },
              data: {
                score: existing.score + score,
                attempts: existing.attempts + 1
              }
            })
          } else {
            await prisma.userTagPerformance.create({
              data: {
                userId: context.user.userId,
                tag,
                score,
                attempts: 1
              }
            })
          }
        }
      }

      return {
        id: response.id,
        score,
        feedback: evaluation.feedback,
        coveredConcepts: evaluation.coveredConcepts,
        missedConcepts: evaluation.missedConcepts
      }
    },
    finishInterview: async (_, { interviewId }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated")
      }

      console.log(`\n📊 ========== FINISHING INTERVIEW ==========`);
      console.log(`Interview ID: ${interviewId}`);

      const responses = await prisma.response.findMany({ where: { interviewId } })
      console.log(`Found ${responses.length} responses`);

      // If no responses (user skipped all questions), return zeros
      if (responses.length === 0) {
        console.log("⚠️  No responses found - user skipped all questions");

        // Update interview with score 0
        await prisma.interview.update({
          where: { id: interviewId },
          data: { score: 0 }
        })

        console.log(`✅ Interview finished with 0 score (all skipped)`);
        console.log("==============================================\n");

        return {
          totalQuestion: 0,
          totalScore: 0,
          percentage: 0
        }
      }

      const totalScore = responses.reduce((sum, r) => sum + r.score, 0)
      const totalQuestion = responses.length;

      console.log(`Total questions answered: ${totalQuestion}`);
      console.log(`Total score: ${totalScore}`);

      const questions = await prisma.question.findMany({
        where: {
          id: { in: responses.map(r => r.questionId) }
        }
      })

      console.log(`Found ${questions.length} questions in database`);

      const maxScore = questions.reduce(
        (sum, q) => sum + (q.keywords.length * q.weight), 0
      )
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      console.log(`Max possible score: ${maxScore}`);
      console.log(`Percentage: ${percentage.toFixed(2)}%`);


      await prisma.interview.update({
        where: { id: interviewId },
        data: { score: totalScore }
      })

      // Check and unlock achievements
      const newAchievements = await checkAndUnlockAchievements(
        context.user.userId,
        Math.round(percentage)
      );

      console.log(`🏆 Unlocked ${newAchievements.length} new achievements`);
      newAchievements.forEach(ach => {
        console.log(`   ${ach.icon} ${ach.name}`);
      });

      console.log(`✅ Interview finished successfully`);
      console.log("==============================================\n");

      return {
        totalQuestion,
        totalScore,
        percentage,
        newAchievements: newAchievements.map(ach => ({
          ...ach,
          createdAt: ach.createdAt.toISOString()
        }))
      }
    },
  },
};

export default resolvers;