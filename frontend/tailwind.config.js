/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#b8d9ff',
          300: '#8cc0ff',
          400: '#5aa0ff',
          500: '#2f7dff',
          600: '#1c5ee0',
          700: '#1849b3',
          800: '#173c8c',
          900: '#16336f',
        },
      },
    },
  },
  plugins: [],
}
