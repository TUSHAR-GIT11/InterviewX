import { gql } from "@apollo/client";

export const GET_USER_STATS = gql`
  query GetUserStats {
    getUserStats {
      totalInterviews
      avgScore
      streak
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
  getMe {
   id
    name
    email
    role
  }
}
`;

export const GET_INTERVIEW_HISTORY = gql`
   query GetInterviewHistory {
  getInterviewHistory {
    id
    domain
    difficulty
    score
    createdAt
    responses {
       id
      questionId
      answer
      score
      feedback
    }
  }
}
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
  getAllUsers {
    id
    name
    email
    avgScore
    totalInterviews
    role
    createdAt
  }
}
`;

export const GET_ADMIN_STATS = gql`
 query GetAdminStats {
  getAdminStats {
    totalUsers
    totalInterviews
    totalQuestions
    avgScore
  }
}
`;

export const GET_ALL_QUESTION = gql`
  query GetAdminStats {
  getAdminStats {
    totalUsers
    totalInterviews
    totalQuestions
    avgScore
  }
}
`;

export const GET_USER_ACHIEVEMENTS = gql`
  query GetUserAchievements {
  getUserAchievements {
    id
    unlockedAt
    achievement {
      id
      name
      description
      icon
      category
    }
  }
}
`;

export const GET_ALL_ACHIEVEMENTS = gql`
 query GetAllAchievements {
  getAllAchievements {
    id
    name
    description
    icon
    category
  }
}
`;

export const GET_ANALYTICS_DATA = gql`
  query GetAnalyticsData {
    getAnalyticsData {
      totalInterviews
      avgScore
      bestScore
      streak
      monthlyPerformance
      skillLevels
      domainStats
    }
  }
`;

