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

  type Query {
    hello: String
    getUserStats: UserStats!
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
    submitAnswer(interviewId:String!,questionId:String!,answer:String!):AnswerResponse!
    finishInterview(interviewId:String!):InterviewSummary!
  }
`;

export default typeDefs;