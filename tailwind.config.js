/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050914',
          900: '#08111f',
          800: '#101b2f',
          700: '#1a2841',
          600: '#273758'
        },
        cream: '#f7f2e8',
        mint: '#34d399',
        rose: '#fb7185',
        amber: '#f59e0b'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(2, 6, 23, 0.35)'
      },
      borderRadius: {
        '2xl': '1.25rem'
      }
    }
  },
  plugins: []
}