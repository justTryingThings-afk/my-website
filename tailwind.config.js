// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // This line tells Tailwind to scan all your React files
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html", // For create-react-app, index.html is in public
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Add this for the Inter font
      },
    },
  },
  plugins: [],
}