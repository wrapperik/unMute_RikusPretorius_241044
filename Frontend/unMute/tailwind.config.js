/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Raleway', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
  'text': '#130e0d',
  'background': '#faf8f7',
  'primary': '#997968',
  'secondary': '#c8c6ad',
  'accent': '#b0b491',

      },
    },
  },
  plugins: [],
}