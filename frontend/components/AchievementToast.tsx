'use client'
import { useEffect, useState } from "react"

interface Achievement {
    id: string
    name: string
    description: string
    icon: string
}

interface AchievementToastProps {
    achievements: Achievement[]
    onClose: () => void
}

export default function AchievementToast({ achievements, onClose }: AchievementToastProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        if (currentIndex < achievements.length) {
            const timer = setTimeout(() => {
                setIsVisible(false)
                setTimeout(() => {
                    if (currentIndex + 1 < achievements.length) {
                        setCurrentIndex(currentIndex + 1)
                        setIsVisible(true)
                    } else {
                        onClose()
                    }
                }, 300)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [currentIndex, achievements.length, onClose])

    if (achievements.length === 0 || currentIndex >= achievements.length) return null

    const achievement = achievements[currentIndex]

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl shadow-2xl p-6 max-w-sm">
                <div className="flex items-start space-x-4">
                    <div className="text-5xl animate-bounce">{achievement.icon}</div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-bold uppercase tracking-wide">Achievement Unlocked!</span>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                {currentIndex + 1}/{achievements.length}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{achievement.name}</h3>
                        <p className="text-sm text-white/90">{achievement.description}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
