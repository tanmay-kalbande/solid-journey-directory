/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#F5F5F5',
        'surface': '#FFFFFF',
        'primary': '#2C5F2D',
        'primary-dark': '#1a3d1b',
        'secondary': '#97BC62',
        'text-primary': '#333333',
        'text-secondary': '#555555',
        'border-color': '#E0E0E0',
      },
      fontFamily: {
        'sans': ['Poppins', 'Noto Sans Devanagari', 'Inter', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'devanagari': ['Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 4px 6px rgba(0,0,0,0.05)',
        'card': '0 4px 10px rgba(0,0,0,0.1)',
        'card-hover': '0 8px 15px rgba(0,0,0,0.1)',
        'header': '0 8px 15px rgba(0,0,0,0.1)'
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    }
  },
  plugins: [],
}
