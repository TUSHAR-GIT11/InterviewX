"use client"

import { useState } from "react"
import { useMutation } from "@apollo/client/react"
import { LOGIN } from "../../graphql/mutation"
import { useRouter } from "next/navigation"

interface LoginData {
  login: {
    token: string
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }
}

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [login, { data, loading, error }] = useMutation<LoginData>(LOGIN)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            const result = await login({
                variables: { email, password }
            })
            if (result.data) {
                localStorage.setItem("token", result.data.login.token)
                localStorage.setItem("user", JSON.stringify(result.data.login.user))
                router.push("/dashboard")
            }
        } catch (err) {
            console.error("Login error:", err)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {error && (
                        <p className="text-center text-sm text-red-600 mt-4">
                            Error: {error.message}
                        </p>
                    )}

                    {data && (
                        <p className="text-center text-sm text-green-600 mt-4">
                            Login successful! Redirecting...
                        </p>
                    )}

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Don't have an account?{" "}
                        <a href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
