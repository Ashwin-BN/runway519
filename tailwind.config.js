/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#00C896',
          tealDark: '#00A07A',
          tealLight: '#00E5B0',
          navy: '#0F1623',
          surface: '#1A2332',
          border: '#1E2D3D',
          navyBorder: '#243447',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
