import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-14 h-7 rounded-full transition-colors duration-300
                 flex items-center px-1
                 bg-gray-200 dark:bg-brand-border"
    >
      {/* Track */}
      <span
        className={`absolute w-5 h-5 rounded-full flex items-center
                    justify-center transition-all duration-300 shadow-sm
                    ${
                      isDark
                        ? 'translate-x-7 bg-brand-teal'
                        : 'translate-x-0 bg-white'
                    }`}
      >
        {isDark ? (
          <Moon size={11} className="text-brand-navy" />
        ) : (
          <Sun size={11} className="text-yellow-500" />
        )}
      </span>
    </button>
  )
}
