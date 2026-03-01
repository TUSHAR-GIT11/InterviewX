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

      // Finish interview and get summary
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your performance...</p>
        </div>
      </div>
    )
  }

  const totalScore = scores.reduce((sum, score) => sum + score, 0)
  const maxPossibleScore = interview.questions.reduce(
    (sum, q) => sum + (q.keywords.length * 1), 
    0
  )
  const percentage = summary ? summary.percentage : (totalScore / maxPossibleScore) * 100

  const getGrade = (percent: number) => {
    if (percent >= 90) return { grade: "A+", color: "text-green-600", bg: "bg-green-100" }
    if (percent >= 80) return { grade: "A", color: "text-green-600", bg: "bg-green-100" }
    if (percent >= 70) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100" }
    if (percent >= 60) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { grade: "D", color: "text-red-600", bg: "bg-red-100" }
  }

  const gradeInfo = getGrade(percentage)

  // Analyze weak areas
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
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-indigo-600">InterviewX</h1>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className={`w-32 h-32 ${gradeInfo.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className={`text-5xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
            <p className="text-xl text-gray-600">You scored {percentage.toFixed(1)}%</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Score</p>
              <p className="text-3xl font-bold text-indigo-600">{totalScore}</p>
              <p className="text-xs text-gray-500">out of {maxPossibleScore}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Questions</p>
              <p className="text-3xl font-bold text-green-600">{interview.questions.length}</p>
              <p className="text-xs text-gray-500">answered</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-purple-600">{percentage.toFixed(0)}%</p>
              <p className="text-xs text-gray-500">overall</p>
            </div>
          </div>
        </div>

        {/* Weak Areas Analysis */}
        {weakQuestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Areas for Improvement</h3>
            <p className="text-gray-600 mb-6">
              Focus on these topics to strengthen your knowledge
            </p>
            <div className="space-y-4">
              {weakQuestions.map((qa, index) => (
                <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1">{qa.question.question}</h4>
                    <span className="text-red-600 font-bold ml-4">{qa.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm text-gray-600 mb-1">Missed Concepts:</p>
                    <div className="flex flex-wrap gap-2">
                      {qa.missedConcepts.map((concept, i) => (
                        <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-700 italic">"{qa.feedback}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Analysis</h3>
          <div className="space-y-6">
            {questionAnalysis.map((qa, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                        {qa.question.domain}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {qa.question.difficulty}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{qa.question.question}</h4>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-indigo-600">{qa.score}/{qa.maxScore}</p>
                    <p className="text-sm text-gray-500">{qa.percentage.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
                  <p className={`text-sm p-3 rounded ${qa.isAnswered ? 'text-gray-600 bg-gray-50' : 'text-red-600 bg-red-50'}`}>
                    {qa.answer || "No answer provided"}
                  </p>
                </div>

                {qa.isAnswered && (
                  <div className="mb-4 bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium text-blue-900 mb-1">AI Feedback:</p>
                    <p className="text-sm text-blue-800 italic">{qa.feedback}</p>
                  </div>
                )}

                {!qa.isAnswered && (
                  <div className="mb-4 bg-red-50 p-3 rounded">
                    <p className="text-sm font-medium text-red-900 mb-1">⚠️ Skipped Question</p>
                    <p className="text-sm text-red-800">You did not provide an answer for this question.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-2">Covered Concepts:</p>
                    <div className="flex flex-wrap gap-2">
                      {qa.coveredConcepts.length > 0 ? (
                        qa.coveredConcepts.map((concept, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            ✓ {concept}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-2">Missed Concepts:</p>
                    <div className="flex flex-wrap gap-2">
                      {qa.missedConcepts.length > 0 ? (
                        qa.missedConcepts.map((concept, i) => (
                          <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                            ✗ {concept}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex gap-4">
            <button
              onClick={handleNewInterview}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Start New Interview
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
