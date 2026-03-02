"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@apollo/client/react"
import { FINISH_INTERVIEW } from "../../graphql/mutation"

interface Question {
  id: string
  domain: string
  difficulty: string
  question: string
  keywords: string[]
}

interface InterviewSession {
  id: string
  questions: Question[]
}

interface FinishInterviewData {
  finishInterview: {
    totalScore: number
    totalQuestion: number
    percentage: number
  }
}

export default function Results() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const interviewId = searchParams.get("interviewId")

  const [interview, setInterview] = useState<InterviewSession | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [scores, setScores] = useState<number[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0)

  const [finishInterview, { loading }] = useMutation<FinishInterviewData>(FINISH_INTERVIEW)

  useEffect(() => {
    const loadData = async () => {
      const storedInterview = localStorage.getItem("currentInterview")
      const storedAnswers = localStorage.getItem("interviewAnswers")
      const storedScores = localStorage.getItem("interviewScores")
      const storedFeedbacks = localStorage.getItem("interviewFeedbacks")

      if (!storedInterview || !interviewId) {
        router.push("/dashboard")
        return
      }

      const interviewData = JSON.parse(storedInterview)
      const answersData = storedAnswers ? JSON.parse(storedAnswers) : []
      const scoresData = storedScores ? JSON.parse(storedScores) : []
      const feedbacksData = storedFeedbacks ? JSON.parse(storedFeedbacks) : []

      setInterview(interviewData)
      setAnswers(answersData)
      setScores(scoresData)
      setFeedbacks(feedbacksData)

      try {
        const result = await finishInterview({
          variables: { interviewId }
        })
        if (result.data) {
          setSummary(result.data.finishInterview)
        }
      } catch (err) {
        console.error("Error finishing interview:", err)
      }
    }

    loadData()
  }, [interviewId, router, finishInterview])

  if (!interview || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your performance...</p>
        </div>
      </div>
    )
  }

  const totalScore = scores.reduce((sum, score) => sum + score, 0)
  const maxPossibleScore = interview.questions.length * 100
  const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0

  const getGrade = (percent: number) => {
    if (percent >= 90) return { grade: "A+", color: "text-green-600", bg: "bg-green-100", ring: "ring-green-200" }
    if (percent >= 80) return { grade: "A", color: "text-green-600", bg: "bg-green-100", ring: "ring-green-200" }
    if (percent >= 70) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100", ring: "ring-blue-200" }
    if (percent >= 60) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-100", ring: "ring-yellow-200" }
    return { grade: "D", color: "text-red-600", bg: "bg-red-100", ring: "ring-red-200" }
  }

  const gradeInfo = getGrade(percentage)

  const questionAnalysis = interview.questions.map((q, index) => {
    const feedback = feedbacks[index] || {}
    const answerText = answers[index] || ""
    const isAnswered = answerText && answerText.trim().length > 0
    
    return {
      question: q,
      answer: answerText,
      score: scores[index] || 0,
      maxScore: 100,
      feedback: feedback.feedback || (isAnswered ? "Feedback not available" : "Question not answered"),
      coveredConcepts: feedback.coveredConcepts || [],
      missedConcepts: feedback.missedConcepts || (isAnswered ? [] : q.keywords),
      percentage: scores[index] || 0,
      isAnswered
    }
  })

  const weakQuestions = questionAnalysis.filter(qa => qa.percentage < 60)

  const handleNewInterview = () => {
    localStorage.removeItem("currentInterview")
    localStorage.removeItem("interviewAnswers")
    localStorage.removeItem("interviewScores")
    localStorage.removeItem("interviewFeedbacks")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">IX</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Interview Results
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className={`w-24 h-24 ${gradeInfo.bg} rounded-2xl flex items-center justify-center ring-4 ${gradeInfo.ring}`}>
                <span className={`text-4xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Interview Complete!</h2>
                <p className="text-lg text-gray-600">You scored {percentage.toFixed(1)}%</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {totalScore}
              </div>
              <div className="text-sm text-gray-500">out of {maxPossibleScore}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Questions Answered</div>
              <div className="text-3xl font-bold text-blue-900">{interview.questions.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="text-sm text-green-700 mb-1">Average Score</div>
              <div className="text-3xl font-bold text-green-900">{(totalScore / interview.questions.length).toFixed(0)}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="text-sm text-purple-700 mb-1">Performance</div>
              <div className="text-3xl font-bold text-purple-900">
                {percentage >= 60 ? "Pass ✓" : "Review"}
              </div>
            </div>
          </div>
        </div>

        {/* Weak Areas */}
        {weakQuestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Areas for Improvement</h3>
                <p className="text-gray-600">Focus on these topics to strengthen your knowledge</p>
              </div>
            </div>
            <div className="space-y-3">
              {weakQuestions.map((qa, index) => (
                <div key={index} className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{qa.question.question}</h4>
                      <div className="flex flex-wrap gap-2">
                        {qa.missedConcepts.map((concept, i) => (
                          <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-red-600">{qa.percentage}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Detailed Analysis</h3>
          </div>
          
          <div className="space-y-4">
            {questionAnalysis.map((qa, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                  className="w-full p-6 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl ${
                      qa.percentage >= 80 ? 'bg-green-100 text-green-700' :
                      qa.percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                      qa.percentage >= 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {qa.score}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500">Q{index + 1}</span>
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                          {qa.question.domain}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          qa.question.difficulty === "EASY" ? "bg-green-100 text-green-700" :
                          qa.question.difficulty === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {qa.question.difficulty}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{qa.question.question}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Score</div>
                      <div className="text-2xl font-bold text-gray-900">{qa.percentage}%</div>
                    </div>
                  </div>
                  <svg 
                    className={`w-6 h-6 text-gray-400 transition-transform ${expandedQuestion === index ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedQuestion === index && (
                  <div className="p-6 bg-white border-t border-gray-200">
                    <div className="space-y-6">
                      {/* Your Answer */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">✍️</span>
                          <h5 className="font-semibold text-gray-900">Your Answer</h5>
                        </div>
                        <div className={`p-4 rounded-lg ${qa.isAnswered ? 'bg-gray-50 border border-gray-200' : 'bg-red-50 border border-red-200'}`}>
                          <p className={`text-sm ${qa.isAnswered ? 'text-gray-700' : 'text-red-700'}`}>
                            {qa.answer || "No answer provided"}
                          </p>
                        </div>
                      </div>

                      {/* AI Feedback */}
                      {qa.isAnswered && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">🤖</span>
                            <h5 className="font-semibold text-gray-900">AI Feedback</h5>
                          </div>
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900 leading-relaxed">{qa.feedback}</p>
                          </div>
                        </div>
                      )}

                      {/* Concepts */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">✅</span>
                            <h5 className="font-semibold text-green-700">Covered Concepts</h5>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {qa.coveredConcepts.length > 0 ? (
                              qa.coveredConcepts.map((concept, i) => (
                                <span key={i} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                  {concept}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500 italic">None</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">❌</span>
                            <h5 className="font-semibold text-red-700">Missed Concepts</h5>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {qa.missedConcepts.length > 0 ? (
                              qa.missedConcepts.map((concept, i) => (
                                <span key={i} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                                  {concept}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500 italic">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex gap-4">
            <button
              onClick={handleNewInterview}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
            >
              Start New Interview
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
