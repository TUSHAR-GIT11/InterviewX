"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@apollo/client/react"
import { START_INTERVIEW } from "../../graphql/mutation"
import { GET_ME, GET_USER_STATS } from "../../graphql/queries"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  domain: string
  difficulty: string
  question: string
  keywords: string[]
}

interface StartInterviewData {
  startInterview: {
    id: string
    questions: Question[]
  }
}

interface UserStats {
  totalInterviews: number
  avgScore: number
  streak: number
}

interface GetUserStats {
  getUserStats: UserStats
}

interface GetMe {
  getMe: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function Dashboard() {
  const router = useRouter()
  const [domain, setDomain] = useState<string>("FRONTEND")
  const [difficulty, setDifficulty] = useState<string>("EASY")
  const [count, setCount] = useState<number>(5)
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
  }, [router])

  const { data: meData } = useQuery<GetMe>(GET_ME)
  const { data: statsData, loading: statsLoading } = useQuery<GetUserStats>(GET_USER_STATS)
  const [startInterview, { loading, error }] = useMutation<StartInterviewData>(START_INTERVIEW)

  useEffect(() => {
    if (meData?.getMe?.name) {
      setUserName(meData.getMe.name)
    }
  }, [meData])

  const handleStartInterview = async () => {
    try {
      const result = await startInterview({
        variables: { domain, difficulty, count }
      })
      
      if (result.data) {
        localStorage.setItem("currentInterview", JSON.stringify(result.data.startInterview))
        localStorage.setItem("interviewStartTime", Date.now().toString())
        router.push("/interview")
      }
    } catch (err) {
      console.error("Error starting interview:", err)
    }
  }

  const domainInfo = {
    FRONTEND: { icon: "🎨", desc: "HTML, CSS, JavaScript, React" },
    BACKEND: { icon: "⚙️", desc: "Node.js, APIs, Databases" },
    HR: { icon: "👥", desc: "Behavioral & Situational" }
  }

  const difficultyInfo = {
    EASY: { color: "green", desc: "Beginner friendly" },
    MEDIUM: { color: "yellow", desc: "Intermediate level" },
    HARD: { color: "red", desc: "Advanced concepts" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IX</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  InterviewX
                </h1>
                <p className="text-xs text-gray-500">AI-Powered Interview Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{userName || "..."}</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("token")
                  localStorage.removeItem("user")
                  router.push("/login")
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Ready for Your Interview?
          </h2>
          <p className="text-lg text-gray-600">
            Configure your interview settings and let's get started
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : statsData?.getUserStats?.totalInterviews || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : statsData?.getUserStats?.avgScore || "--"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : `${statsData?.getUserStats?.streak || 0} days`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="space-y-8">
            {/* Domain Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Select Interview Domain
              </label>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(domainInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setDomain(key)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      domain === key
                        ? "border-indigo-600 bg-indigo-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-3xl mb-2">{info.icon}</div>
                    <div className="font-semibold text-gray-900 mb-1">{key}</div>
                    <div className="text-xs text-gray-600">{info.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Choose Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(difficultyInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      difficulty === key
                        ? `border-${info.color}-600 bg-${info.color}-50 shadow-md`
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                      key === "EASY" ? "bg-green-100 text-green-700" :
                      key === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {key}
                    </div>
                    <div className="text-xs text-gray-600">{info.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold text-gray-900">
                  Number of Questions
                </label>
                <span className="text-3xl font-bold text-indigo-600">{count}</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>3 questions</span>
                <span>~{count * 2} minutes</span>
                <span>10 questions</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <span>⚠️</span>
                <span>{error.message}</span>
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={handleStartInterview}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Preparing Interview...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Start Interview
                  <span>→</span>
                </span>
              )}
            </button>

            {/* Interview Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📋</span>
                Interview Summary
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Domain</p>
                  <p className="font-semibold text-gray-900">{domain}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Difficulty</p>
                  <p className="font-semibold text-gray-900">{difficulty}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Questions</p>
                  <p className="font-semibold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>💡</span>
            Interview Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Take your time to read each question carefully</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Provide detailed explanations with examples when possible</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Use proper technical terminology and concepts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>AI will evaluate your answers for accuracy and completeness</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
