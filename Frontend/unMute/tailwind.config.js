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
        milk: '#F9F7F0',
        lightStone: '#D8D2C2',
        desertClay: '#B17457',
        darkClay: '#80513cff',
        graphite: '#4A4947',
      },
    },
  },
  plugins: [],
}