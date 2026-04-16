/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5EDD8',
        sepia: '#2A2118',
        rose: '#D4917A',
        sage: '#8FA68A',
        gold: '#C4974E',
        'faded-blue': '#7B9BB5',
        // Her-side specific tokens
        petal: '#C65A73',      // rose-magenta accent
        plum: '#9B7BAE',       // lavender-purple secondary
        blush: '#FDF0F6',      // her surface bg
      },
      fontFamily: {
        handwriting: ['"Reenie Beanie"', 'cursive'],
        journal: ['Caveat', 'cursive'],
        serif: ['Lora', 'serif'],
        stamp: ['"DM Serif Display"', 'serif'],
      },
      backgroundImage: {
        'paper-texture': "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
        'linen': "url('https://www.transparenttextures.com/patterns/linen-design.png')",
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '0.8', transform: 'scale(1.2)' },
        }
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
