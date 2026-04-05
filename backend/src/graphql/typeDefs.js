import { gql } from "graphql-tag";

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }
    enum Domain {
      FRONTEND
      BACKEND
      HR
    }
      
      type AdminStats {
        totalUsers: Int!
        totalInterviews: Int!
        totalQuestions:Int!
        avgScore:Float!
      }

       type UserWithStats {
         id:ID!
         name:String!
         email:String!
         role:String!
         totalInterviews:Int!
         avgScore:Float!
         createdAt:String!
       }

      enum Difficulty {
         EASY
         MEDIUM
         HARD
      }

  type AuthPayload {
    token: String!
    user: User!
  }

    type Question {
      id:ID!
      domain:Domain!
      difficulty:Difficulty!
      question:String!
      keywords:[String!]!
    }
      type InterviewSummary {
        totalScore:Int!
        totalQuestion:Int!
        percentage:Float!
        newAchievements:[Achievement!]
      }
      type InterviewSession {
         id:ID!
         questions:[Question!]!
      }
      type AnswerResponse {
         id:ID!
         score:Int!
         feedback:String!
         coveredConcepts:[String!]!
         missedConcepts:[String!]!
      } 
         type Response {
           id:String
           questionId:String
           answer:String
           score:Int
           feedback:String 
         }
         type InterviewWithResponse {
            id:String 
            domain:String
            difficulty:String
            score:Int 
            createdAt:String
            responses:[Response]
         }
            type Achievement {
              id:String
              name:String
              description:String
              icon:String
              category:String
            }

            type UserAchievement {
              id:String
              unlockedAt:String
              achievement: Achievement
            }

            type AnalyticsData {
              totalInterviews: Int!
              avgScore: Int!
              bestScore: Int!
              streak: Int!
              monthlyPerformance: [Int!]!
              skillLevels: [Int!]!
              domainStats: [Int!]!
            }

  type Query {
    hello: String
    getUserStats: UserStats!
    getMe: User  
    getInterviewHistory: [InterviewWithResponse]
    getAllUsers: [UserWithStats!]!
    getAdminStats: AdminStats!
    getAllQuestions: [Question!]!
    getUserAchievements: [UserAchievement]
    getAllAchievements: [Achievement]
    getAnalyticsData: AnalyticsData!
  }

  type UserStats {
    totalInterviews: Int!
    avgScore: Float!
    streak: Int!
  }  

  type Mutation {
    login(email: String!, password: String!): AuthPayload
    signup(name: String!, email: String!, password: String!): AuthPayload
    startInterview(domain:Domain!,difficulty:Difficulty!,count:Int!):InterviewSession!
    submitAnswer(interviewId:String!,questionId:String!,answer:String!,questionText:String,keywords:[String!],difficulty:Difficulty):AnswerResponse!
    finishInterview(interviewId:String!):InterviewSummary!
    createQuestion(domain:Domain!,difficulty:Difficulty!,question:String!,keywords:[String!]!,tags:[String!]!,weight:Int):Question!
    updateQuestion(id:ID!,domain:Domain,difficulty:Difficulty,question:String, keywords:[String!], tags:[String!], weight:Int):Question!
    deleteQuestion(id:ID!):Boolean!
  }
`;

export default typeDefs;
