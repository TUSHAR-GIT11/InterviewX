"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@apollo/client/react"
import { SUBMIT_ANSWER } from "../../graphql/mutation"

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

interface SubmitAnswerData {
  submitAnswer: {
    id: string
    score: number
    feedback: string
    coveredConcepts: string[]
    missedConcepts: string[]
  }
}

export default function Interview() {
  const router = useRouter()
  const [interview, setInterview] = useState<InterviewSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [answers, setAnswers] = useState<string[]>([])
  const [scores, setScores] = useState<number[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [submitAnswer, { loading }] = useMutation<SubmitAnswerData>(SUBMIT_ANSWER)

  useEffect(() => {
    const storedInterview = localStorage.getItem("currentInterview")
    const startTime = localStorage.getItem("interviewStartTime")
    
    if (!storedInterview) {
      router.push("/dashboard")
      return
    }
    
    const data = JSON.parse(storedInterview)
    setInterview(data)
    setAnswers(new Array(data.questions.length).fill(""))
    setScores(new Array(data.questions.length).fill(0))
    setFeedbacks(new Array(data.questions.length).fill(null))

    // Timer
    const timer = setInterval(() => {
      if (startTime) {
        const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000)
        setTimeElapsed(elapsed)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = interview.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === interview.questions.length - 1
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleNext = async () => {
    setIsSubmitting(true)
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = answer
    setAnswers(newAnswers)

    let newScores = [...scores]
    let newFeedbacks = [...feedbacks]

    if (answer && answer.trim().length > 0) {
      try {
        const result = await submitAnswer({
          variables: {
            interviewId: interview.id,
            questionId: currentQuestion.id,
            answer,
            questionText: currentQuestion.question,
            keywords: currentQuestion.keywords,
            difficulty: currentQuestion.difficulty
          }
        })

        if (result.data) {
          newScores[currentQuestionIndex] = result.data.submitAnswer.score
          setScores(newScores)
          
          newFeedbacks[currentQuestionIndex] = {
            feedback: result.data.submitAnswer.feedback,
            coveredConcepts: result.data.submitAnswer.coveredConcepts,
            missedConcepts: result.data.submitAnswer.missedConcepts
          }
          setFeedbacks(newFeedbacks)
        }
      } catch (err) {
        console.error("Error submitting answer:", err)
      }
    } else {
      newFeedbacks[currentQuestionIndex] = {
        feedback: "Question skipped - no answer provided",
        coveredConcepts: [],
        missedConcepts: currentQuestion.keywords
      }
      setFeedbacks(newFeedbacks)
    }

    setIsSubmitting(false)

    if (isLastQuestion) {
      localStorage.setItem("interviewAnswers", JSON.stringify(newAnswers))
      localStorage.setItem("interviewScores", JSON.stringify(newScores))
      localStorage.setItem("interviewFeedbacks", JSON.stringify(newFeedbacks))
      localStorage.setItem("interviewDuration", timeElapsed.toString())
      router.push(`/results?interviewId=${interview.id}`)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAnswer(answers[currentQuestionIndex + 1] || "")
    }
  }

  const handlePrevious = () => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = answer
    setAnswers(newAnswers)
    setCurrentQuestionIndex(currentQuestionIndex - 1)
    setAnswer(answers[currentQuestionIndex - 1] || "")
  }

  const wordCount = answer.trim().split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IX</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {interview.questions.length}</p>
                <div className="w-48 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-600">Time Elapsed</p>
                <p className="text-lg font-mono font-semibold text-gray-900">{formatTime(timeElapsed)}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold">
                {currentQuestion.domain}
              </span>
              <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                currentQuestion.difficulty === "EASY" ? "bg-green-100 text-green-700" :
                currentQuestion.difficulty === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>
            <span className="text-3xl font-bold text-gray-300">#{currentQuestionIndex + 1}</span>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
              {currentQuestion.question}
            </h2>
            <p className="text-sm text-gray-500">
              💡 Provide a detailed answer with examples and explanations
            </p>
          </div>

          {/* Answer Input */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                Your Answer
              </label>
              <span className="text-xs text-gray-500">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none text-gray-900"
              placeholder="Start typing your answer here..."
            />
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {interview.questions.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentQuestionIndex
                    ? "w-8 bg-indigo-600"
                    : answers[index]
                    ? "w-2 bg-green-400"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>←</span>
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={loading || isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              {loading || isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Evaluating...
                </>
              ) : (
                <>
                  {isLastQuestion ? 'Finish Interview' : 'Next Question'}
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Tip:</span> Your answer will be evaluated by AI for accuracy, completeness, and clarity. Include key concepts and provide examples where applicable.
          </p>
        </div>
      </div>
    </div>
  )
}
