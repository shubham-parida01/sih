/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          blue: '#1A73E8', // Confident Blue accent
          blueHover: '#1557B6',
          bgLight: '#F8F9FA', // Paytm neutral off-white surface
          emerald: '#10B981', // Safe / Low Risk green
          emeraldGlow: 'rgba(16, 185, 129, 0.1)',
          amber: '#F59E0B', // Warning / Medium/High Risk amber
          amberGlow: 'rgba(245, 158, 11, 0.1)',
          red: '#EF4444', // Blocked / Critical Risk red
          redGlow: 'rgba(239, 68, 68, 0.1)',
          slate: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'fintech': '0 2px 12px 0 rgba(0, 0, 0, 0.04)',
        'fintech-md': '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
        'fintech-lg': '0 10px 30px 0 rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'card': '16px',
      }
    },
  },
  plugins: [],
}
