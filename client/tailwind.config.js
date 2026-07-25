/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            DEFAULT: '#006853', // Deep rich forest/emerald green
            dark: '#004d3e',
            light: '#00b087', // Bright accent green
            deep: '#022c22', // Very dark green background
          },
          blue: {
            DEFAULT: '#0f62ac', // Slate blue for Find Talent card/button
            dark: '#0a4275',
            light: '#3a92e8',
          },
          dark: '#021814',
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', '"Oswald"', 'sans-serif'],
      },
      backgroundImage: {
        'dots-pattern': "radial-gradient(#ffffff1a 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
