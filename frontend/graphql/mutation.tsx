import { gql } from "@apollo/client";

export const SIGNUP = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
  signup(name: $name, email: $email, password: $password) {
    token
    user {
      id
      name
      email
      
    }
  }
}
`;

export const LOGIN = gql`
 mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
       id
       name
       email
       role  
    }
  }
}
`;

export const START_INTERVIEW = gql`
  mutation StartInterview($domain: Domain!, $difficulty: Difficulty!, $count: Int!) {
  startInterview(domain: $domain, difficulty: $difficulty, count: $count) {
    id
    questions {
      id
      domain
      difficulty
      question
      keywords
    }
  }
}
`;

export const SUBMIT_ANSWER = gql`
  mutation SubmitAnswer($interviewId: String!, $questionId: String!, $answer: String!, $questionText: String, $keywords: [String!], $difficulty: Difficulty) {
    submitAnswer(interviewId: $interviewId, questionId: $questionId, answer: $answer, questionText: $questionText, keywords: $keywords, difficulty: $difficulty) {
      id
      score
      feedback
      coveredConcepts
      missedConcepts
    }
  }
`;

export const FINISH_INTERVIEW = gql`
  mutation FinishInterview($interviewId: String!) {
    finishInterview(interviewId: $interviewId) {
      totalScore
      totalQuestion
      percentage
      newAchievements {
        id
        name
        description
        icon
      }
    }
  }
`;