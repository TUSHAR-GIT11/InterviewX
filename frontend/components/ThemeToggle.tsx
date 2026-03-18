import { useTheme } from "@/ThemeProvider"

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    return (
        <button onClick={toggleTheme} >
            {theme === 'light' ? '🌙' : '☀️'}

        </button>
    )
}