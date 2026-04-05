"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@apollo/client/react"
import { gql } from "@apollo/client"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// TypeScript interfaces
interface AnalyticsData {
  totalInterviews: number
  avgScore: number
  bestScore: number
  streak: number
  monthlyPerformance: number[]
  skillLevels: number[]
  domainStats: number[]
}

interface GetAnalyticsResponse {
  getAnalyticsData: AnalyticsData
}

// GraphQL Query
const GET_ANALYTICS_DATA = gql`
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
`

export default function Analytics() {
  const { data, loading, error } = useQuery<GetAnalyticsResponse>(GET_ANALYTICS_DATA)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading Analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">Error loading analytics: {error.message}</div>
      </div>
    )
  }

  const analyticsData = data?.getAnalyticsData

  // Chart data with proper typing
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Score',
        data: analyticsData?.monthlyPerformance || [65, 72, 68, 78, 82, 85],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
      },
    ],
  }

  const skillGapData = {
    labels: ['Easy Level', 'Medium Level', 'Hard Level'],
    datasets: [
      {
        label: 'Average Score',
        data: analyticsData?.skillLevels || [0, 0, 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green for Easy
          'rgba(249, 115, 22, 0.8)',  // Orange for Medium
          'rgba(239, 68, 68, 0.8)',   // Red for Hard
        ],
      },
    ],
  }

  const domainDistribution = {
    labels: ['Frontend', 'Backend', 'HR'],
    datasets: [
      {
        data: analyticsData?.domainStats || [45, 35, 20],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
      },
    ],
  }

  // Chart options with proper typing
  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Average Scores' }
    }
  }

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Skills Proficiency' }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  }

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          📊 Analytics Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.totalInterviews || 47}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.avgScore || 78}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.streak || 12} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Best Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.bestScore || 95}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Trend */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📈 Performance Trend
            </h3>
            <Line data={performanceData} options={lineOptions} />
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎯 Performance by Difficulty
            </h3>
            <Bar 
              key={JSON.stringify(analyticsData?.skillLevels)} 
              data={skillGapData} 
              options={barOptions} 
            />
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Shows your average scores across different difficulty levels</p>
            </div>
          </div>
        </div>

        {/* Domain Distribution & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Domain Distribution */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Interview Distribution
            </h3>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Doughnut data={domainDistribution} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Progress Insights */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💡 Progress Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">📈</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Improving in React</span>
                </div>
                <span className="text-green-600 font-semibold">+15%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">🎯</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Strong in Frontend</span>
                </div>
                <span className="text-blue-600 font-semibold">85%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center">
                  <span className="text-orange-600 mr-2">⚠️</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Focus on System Design</span>
                </div>
                <span className="text-orange-600 font-semibold">45%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center">
                  <span className="text-purple-600 mr-2">🔥</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">12-day streak!</span>
                </div>
                <span className="text-purple-600 font-semibold">Keep going!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🚀 Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">📚 Study Focus</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Spend more time on System Design and Database concepts
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">🎯 Practice Goal</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Take 3 more Backend interviews this week
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">⭐ Strength</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Excellent progress in Frontend technologies
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}