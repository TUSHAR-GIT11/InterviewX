# InterviewX - AI-Powered Interview Platform

A modern, full-stack interview preparation platform with AI-powered answer evaluation.

## Features

- 🎯 **Smart Interview System** - Choose domain (Frontend/Backend/HR), difficulty, and question count
- 🤖 **AI Answer Evaluation** - Intelligent scoring with detailed feedback
- 📊 **Performance Analytics** - Track your progress with stats and streaks
- 🎨 **Modern UI** - Professional, responsive design with Tailwind CSS
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 📈 **Personalized Questions** - Focuses on your weak areas over time

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Apollo Client (GraphQL)
- Tailwind CSS

### Backend
- Node.js
- Express
- Apollo Server (GraphQL)
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/TUSHAR-GIT11/InterviewX.git
cd InterviewX
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables

Create `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/interviewx"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="your-openai-key" # Optional
```

5. Run database migrations
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

6. Start the backend server
```bash
cd backend
node src/server.js
```

7. Start the frontend development server
```bash
cd frontend
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
InterviewX/
├── backend/
│   ├── src/
│   │   ├── graphql/
│   │   │   ├── resolvers.js
│   │   │   └── typeDefs.js
│   │   ├── services/
│   │   │   ├── aiEvaluator.js
│   │   │   └── questionEngine.js
│   │   ├── context.js
│   │   ├── prismaClient.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── data/
│       └── questions.json
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── interview/
│   │   ├── results/
│   │   ├── login/
│   │   └── signup/
│   ├── graphql/
│   │   ├── queries.tsx
│   │   └── mutation.tsx
│   └── lib/
│       └── apolloClient.js
└── README.md
```

## Features in Detail

### Interview Flow
1. **Dashboard** - Select domain, difficulty, and number of questions
2. **Interview** - Answer questions one by one with real-time timer
3. **Results** - Get detailed AI feedback with scores and improvement suggestions

### AI Evaluation
- Advanced keyword matching with fuzzy logic
- Content quality analysis
- Structure and clarity scoring
- Personalized feedback and improvement tips

### User Analytics
- Total interviews completed
- Average score tracking
- Daily streak counter
- Weak area identification

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Author

Tushar - [GitHub](https://github.com/TUSHAR-GIT11)
