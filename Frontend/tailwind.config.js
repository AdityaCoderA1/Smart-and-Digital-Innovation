/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primaryDark: '#1F6F5F',
        primary: '#2FA084',
        accent: '#6FCF97',
        background: '#EEEEEE',
      },
    },
  },
  plugins: [],
}