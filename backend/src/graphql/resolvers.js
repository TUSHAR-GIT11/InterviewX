import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateQuestions } from "../services/questionEngine.js";
import { evaluateAnswer } from "../services/aiEvaluator.js";
import crypto from "crypto"
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
        const questions = await generateQuestions(domain,difficulty,count,context.user.userId)
        
        // Create interview record in database
        const interview = await prisma.interview.create({
          data: {
            userId: context.user.userId,
            domain,
            difficulty,
            score: 0
          }
        })
        
        return {
          id: interview.id,
          questions
        }
    },
    submitAnswer:async(_,{interviewId,questionId,answer},context)=>{
      if(!context.user){
        throw new Error("Not authenticated")
      }
      
      const question = await prisma.question.findUnique({where:{id:questionId}})
      if(!question){
        throw new Error("Question not found")
      }

      // Use AI to evaluate the answer
      const evaluation = await evaluateAnswer(
        question.question,
        answer,
        question.keywords,
        question.difficulty
      )

      const score = evaluation.score

      // Save response with AI feedback
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

      // Update user tag performance
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
      const responses = await prisma.response.findMany({where:{interviewId}})
      if(responses.length === 0){
        throw new Error("No response found")
      }
      const totalScore = responses.reduce((sum,r)=>sum + r.score,0)
      const totalQuestion = responses.length;
      const questions = await prisma.question.findMany({
        where:{
          id:{ in:responses.map(r=>r.questionId) }
        }
      })
      const maxScore = questions.reduce(
        (sum,q)=> sum + (q.keywords.length * q.weight),0
      )
      const percentage = (totalScore/maxScore)*100;
      
      // Update interview with final score
      await prisma.interview.update({
        where: { id: interviewId },
        data: { score: totalScore }
      })
      
      return {
        totalQuestion,
        totalScore,
        percentage
      }
    }
  },
};

export default resolvers;