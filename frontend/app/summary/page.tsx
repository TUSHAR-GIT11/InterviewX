"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Summary() {
  const router = useRouter()
  const [answers, setAnswers] = useState<string[]>([])

  useEffect(() => {
    const storedAnswers = localStorage.getItem("interviewAnswers")
    if (!storedAnswers) {
      router.push("/dashboard")
      return
    }
    setAnswers(JSON.parse(storedAnswers))
  }, [router])

  const handleNewInterview = () => {
    localStorage.removeItem("currentInterview")
    localStorage.removeItem("interviewAnswers")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-indigo-600">InterviewX</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Completed!</h2>
            <p className="text-gray-600">You have successfully completed the interview</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Interview Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600">Questions Answered</p>
                <p className="text-2xl font-bold text-indigo-600">{answers.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-2xl font-bold text-green-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleNewInterview}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Start New Interview
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}