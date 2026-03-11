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
`