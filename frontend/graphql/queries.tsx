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
