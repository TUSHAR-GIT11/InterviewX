import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateQuestions } from "../services/questionEngine.js";
import { evaluateAnswer } from "../services/aiEvaluator.js";
import { evaluateAnswerWithGemini } from "../services/geminiEvaluator.js";
const resolvers = {
  Query: {
    hello: () => "InterviewX GraphQL API Running 🚀",
    getUserStats: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const userId = context.user.userId;

      // Get all interviews for the user
      const interviews = await prisma.interview.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      const totalInterviews = interviews.length;

      // Calculate average score
      const avgScore = totalInterviews > 0
        ? interviews.reduce((sum, interview) => sum + interview.score, 0) / totalInterviews
        : 0;

      // Calculate streak (consecutive days with interviews)
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
        
        // Check if there's an interview today
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
    startInterview:async(_,{domain,difficulty,count},context)=>{
        if(!context.user){
          throw new Error("Not Authenticated")
        }
        
        console.log("\n🚀 ========== STARTING INTERVIEW ==========");
        console.log(`📋 Domain: ${domain}, Difficulty: ${difficulty}, Count: ${count}`);
        
        // Get questions from database
        const questions = await generateQuestions(domain, difficulty, count, context.user.userId);
        
        console.log(`✅ Loaded ${questions.length} questions from database`);
        console.log("==============================================\n");
        
        // Create interview record with question IDs
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
    submitAnswer:async(_,{interviewId,questionId,answer,questionText,keywords,difficulty},context)=>{
      if(!context.user){
        throw new Error("Not authenticated")
      }
      
      // First try to find question in database (for legacy questions)
      let question = await prisma.question.findUnique({where:{id:questionId}})
      
      // If not found in DB, it's an AI-generated question - use provided data
      if (!question) {
        if (!questionText || !keywords || !difficulty) {
          throw new Error("For AI-generated questions, questionText, keywords, and difficulty are required");
        }
        question = {
          id: questionId,
          question: questionText,
          keywords: keywords,
          difficulty: difficulty,
          tags: keywords // Use keywords as tags for AI questions
        };
      }

      // Use Gemini AI for evaluation (prioritize strict evaluation)
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
        // Fallback to basic evaluation
        evaluation = await evaluateAnswer(
          question.question,
          answer,
          question.keywords,
          question.difficulty
        );
      }

      const score = evaluation.score

      // Save response with AI feedback
      console.log(`💾 Saving response for question ${questionId}...`);
      const response = await prisma.response.create({
        data:{
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

      // Update user tag performance (only for DB questions with proper tags)
      if (question.tags && Array.isArray(question.tags)) {
        for(const tag of question.tags){
          const existing = await prisma.userTagPerformance.findFirst({
            where:{
              userId:context.user.userId,
              tag
            }
          })

          if(existing){
            await prisma.userTagPerformance.update({
              where:{id:existing.id},
              data:{
                score:existing.score + score,
                attempts:existing.attempts + 1
              }
            })
          } else {
            await prisma.userTagPerformance.create({
              data:{
                userId:context.user.userId,
                tag,
                score,
                attempts:1
              }
            })
          }
        }
      }

      return {
        id:response.id,
        score,
        feedback: evaluation.feedback,
        coveredConcepts: evaluation.coveredConcepts,
        missedConcepts: evaluation.missedConcepts
      }
    },
    finishInterview:async(_,{interviewId},context)=>{
      if(!context.user){
        throw new Error("Not authenticated")
      }
      
      console.log(`\n📊 ========== FINISHING INTERVIEW ==========`);
      console.log(`Interview ID: ${interviewId}`);
      
      const responses = await prisma.response.findMany({where:{interviewId}})
      console.log(`Found ${responses.length} responses`);
      
      // If no responses (user skipped all questions), return zeros
      if(responses.length === 0){
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
      
      const totalScore = responses.reduce((sum,r)=>sum + r.score,0)
      const totalQuestion = responses.length;
      
      console.log(`Total questions answered: ${totalQuestion}`);
      console.log(`Total score: ${totalScore}`);
      
      const questions = await prisma.question.findMany({
        where:{
          id:{ in:responses.map(r=>r.questionId) }
        }
      })
      
      console.log(`Found ${questions.length} questions in database`);
      
      const maxScore = questions.reduce(
        (sum,q)=> sum + (q.keywords.length * q.weight),0
      )
      const percentage = maxScore > 0 ? (totalScore/maxScore)*100 : 0;
      
      console.log(`Max possible score: ${maxScore}`);
      console.log(`Percentage: ${percentage.toFixed(2)}%`);
      
      // Update interview with final score
      await prisma.interview.update({
        where: { id: interviewId },
        data: { score: totalScore }
      })
      
      console.log(`✅ Interview finished successfully`);
      console.log("==============================================\n");
      
      return {
        totalQuestion,
        totalScore,
        percentage
      }
    }
  },
};

export default resolvers;