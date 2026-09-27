/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: { DEFAULT: '#F5F4EF', dark: '#17181A' },
        card: { DEFAULT: '#FFFFFF', dark: '#232525' },
        header: { DEFAULT: '#FBF8EC', dark: '#1E2020' },
        border: { DEFAULT: '#E5E2D8', dark: '#33352F' },
        ink: { DEFAULT: '#2A2A28', dark: '#E4E3DE' },
        sub: { DEFAULT: '#6B6B63', dark: '#A6A59D' },
        accent: { DEFAULT: '#3F8F5C', dark: '#6FBE8C' },
        accentSoft: { DEFAULT: '#E7F1EA', dark: '#24322A' },
      },
    },
  },
  plugins: [],
};
