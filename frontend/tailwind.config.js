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
          50: '#fdf2f4',
          100: '#fbe5e9',
          500: '#ff385c', // Airbnb red/pink
          600: '#e31c5f',
          700: '#d11250',
        }
      }
    },
  },
  plugins: [],
}
