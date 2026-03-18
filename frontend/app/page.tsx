"use client"
import { useRouter } from "next/navigation"

export default function Home() {

    const router = useRouter()
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">IX</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">InterviewX</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/login")}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => router.push("/signup")}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                    >
                        Get Started
                    </button>
                </div>
            </nav>
            {/* Hero Section */}
            <section className="text-center px-4 py-24 max-w-4xl mx-auto">
                <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-6">
                    🚀 AI-Powered Interview Prep
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Ace Your Next
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Technical Interview</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                    Practice with AI-generated questions, get instant feedback, track your progress and unlock achievements.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => router.push("/signup")}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                    >
                        Start Practicing Free
                    </button>
                    <button
                        onClick={() => router.push("/login")}
                        className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        Sign In
                    </button>
                </div>
            </section>
            {/* Features Section */}
            <section className="bg-gray-50 dark:bg-gray-800/50 py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                        Everything you need to prepare
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: "🤖", title: "AI Evaluation", desc: "Get instant, detailed feedback on every answer powered by Gemini AI" },
                            { icon: "🎯", title: "Smart Questions", desc: "Questions tailored by domain and difficulty - Frontend, Backend, DSA and more" },
                            { icon: "🏆", title: "Achievements", desc: "Unlock badges as you practice and hit milestones to stay motivated" },
                            { icon: "📊", title: "Track Progress", desc: "See your scores, streaks and weak areas with detailed analytics" },
                        ].map((feature, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-20 px-4 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                    How it works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { step: "1", title: "Create Account", desc: "Sign up for free and set your target domain and difficulty" },
                        { step: "2", title: "Take Interview", desc: "Answer AI-generated questions at your own pace" },
                        { step: "3", title: "Get Feedback", desc: "Review detailed AI feedback and track your improvement" },
                    ].map((item, i) => (
                        <div key={i} className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                                {item.step}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-4 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    © 2026 InterviewX. Built with ❤️ to help developers land their dream jobs.
                </p>
            </footer>
        </div>

    )
}