/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      height: {
        100: '25rem',
      },
      width: {
        88: '22rem',
      },
      spacing: {
        17: '4.25rem',
      },
      zIndex: {
        500: '500',
      },
    },
  },
  plugins: [],
};
