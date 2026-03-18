'use client'
import ThemeToggle from "@/components/ThemeToggle"
import { GET_ALL_ACHIEVEMENTS, GET_ME, GET_USER_ACHIEVEMENTS, GET_USER_STATS } from "@/graphql/queries"
import { useQuery } from "@apollo/client/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface MyData {
    getMe:{
        name:string
        email:string
        role:string
    }
}

interface UserStats {
    getUserStats:{
        totalInterviews:string
        avgScore:string
        streak:number 
    }
}

interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    category: string
}

interface UserAchievement {
    id: string
    unlockedAt: string
    achievement: Achievement
}

interface AllAchievementsData {
    getAllAchievements: Achievement[]
}

interface UserAchievementsData {
    getUserAchievements: UserAchievement[]
}

export default function Profile(){
    const {data:myData,loading:dataLoading} = useQuery<MyData>(GET_ME)
    const {data:myStats,loading:statsLoading} = useQuery<UserStats>(GET_USER_STATS)
    const {data:achievementData} = useQuery<UserAchievementsData>(GET_USER_ACHIEVEMENTS)
    const {data:allAchievementData} = useQuery<AllAchievementsData>(GET_ALL_ACHIEVEMENTS)
    const router = useRouter()
    
    useEffect(()=>{
        const token = localStorage.getItem("token")
        if(!token){
            router.push('/login')
        }
    },[])

    const handleLogout = () => {
        localStorage.removeItem("token")
        router.push('/login')
    }

    const handleBackToDashboard = () => {
        router.push('/dashboard')
    }

    if(dataLoading || statsLoading){
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading profile...</p>
                </div>
            </div>
        )
    }

    return(
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header with Navigation */}
                <div className="flex justify-between items-center mb-8">
                    <button 
                        onClick={handleBackToDashboard}
                        className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <ThemeToggle/>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors shadow-md"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>
                    <div className="px-8 pb-8">
                        <div className="relative -mt-16 mb-6">
                            <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
                                <span className="text-5xl font-bold text-indigo-600">
                                    {myData?.getMe?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{myData?.getMe?.name}</h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">{myData?.getMe?.email}</p>
                            </div>
                            
                            <div className="inline-block">
                                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold">
                                    {myData?.getMe?.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Interviews</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {myStats?.getUserStats?.totalInterviews || '0'}
                                </p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Average Score</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {myStats?.getUserStats?.avgScore || '0'}%
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Current Streak</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {myStats?.getUserStats?.streak || '0'} 🔥
                                </p>
                            </div>
                            <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-3">
                                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🏆 Achievements</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allAchievementData?.getAllAchievements.map((achievement) => {
                            const isUnlocked = achievementData?.getUserAchievements.some(
                                ua => ua.achievement.id === achievement.id
                            );
                            const userAchievement = achievementData?.getUserAchievements.find(
                                ua => ua.achievement.id === achievement.id
                            );

                            return (
                                <div
                                    key={achievement.id}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        isUnlocked
                                            ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-md'
                                            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 opacity-60'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className={`text-4xl mb-2 ${!isUnlocked && 'grayscale'}`}>
                                            {achievement.icon}
                                        </div>
                                        <h3 className={`font-semibold text-sm ${
                                            isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {achievement.name}
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {achievement.description}
                                        </p>
                                        {isUnlocked && userAchievement && (
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                                                Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                        {!isUnlocked && (
                                            <p className="text-xs text-gray-400 mt-2">🔒 Locked</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
