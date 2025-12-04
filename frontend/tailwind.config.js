/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'main': '#111827',
        'card': '#1f2937',
        'accent': '#3b82f6',
      },
    },
  },
  plugins: [],
}
