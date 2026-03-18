"use client"
import { GET_INTERVIEW_HISTORY } from "@/graphql/queries"
import { useQuery } from "@apollo/client/react"
import { useRouter } from "next/navigation"

interface Interview {
    id: string
    domain: string
    difficulty: string
    score: number
    createdAt: string
    responses: any[]
}

interface InterviewHistoryData {
    getInterviewHistory: Interview[]
}

export default function InterviewHistory() {
    const { data, loading, error } = useQuery<InterviewHistoryData>(GET_INTERVIEW_HISTORY)
    const router = useRouter()

    // Calculate stats
    const totalInterviews = data?.getInterviewHistory?.length || 0
    const avgScore = totalInterviews > 0 
        ? Math.round(data!.getInterviewHistory.reduce((sum, interview) => sum + interview.score, 0) / totalInterviews)
        : 0
    const bestScore = totalInterviews > 0 
        ? Math.max(...data!.getInterviewHistory.map(interview => interview.score))
        : 0

    // Get performance grade
    const getGrade = (score: number) => {
        if (score >= 450) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' }
        if (score >= 400) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' }
        if (score >= 350) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' }
        if (score >= 300) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' }
        return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' }
    }

    // Get difficulty badge color
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'hard': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error Loading History</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interview History</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your progress and performance over time</p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Interviews</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalInterviews}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Score</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{bestScore}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interview List */}
                {totalInterviews === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Interviews Yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Start your first interview to see your history here</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Start Interview
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Interviews</h2>
                        {data?.getInterviewHistory?.map((interview: Interview) => {
                            const gradeInfo = getGrade(interview.score)
                            return (
                                <div key={interview.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{interview.domain}</h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(interview.difficulty)}`}>
                                                            {interview.difficulty}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                            {interview.responses.length} questions
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${gradeInfo.bg} ${gradeInfo.color}`}>
                                                        {gradeInfo.grade}
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{interview.score}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">points</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <span>
                                                {new Date(parseInt(interview.createdAt)).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <div className="flex items-center space-x-4">
                                                <span>Performance: {gradeInfo.grade}</span>
                                                <span>•</span>
                                                <span>{Math.round((interview.score / (interview.responses.length * 100)) * 100)}% accuracy</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}