// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}" // Simplified and comprehensive content glob
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#000000',
        'secondary': '#FFFFFF',
        'accent': '#0062FF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'), // Add this line
  ],
};
