/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': { 'min': '0px', 'max': '767px' },
      },
      boxShadow: {
        'custom': '0px 0px 4px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        slideDown: {
          '0%': {
            transform: 'scale(0)',
          },
          '100%': {
            transform: 'scale(1)',
            top: '175%',
          },
        },
        slideUp: {
          '0%': {
            transform: 'scale(1)',
            top: '175%',
          },
          '100%': {
            transform: 'scale(0)',
          },
        },
        slideRight: {
          '0%': {
            transform: 'scale(0)',
          },
          '100%': {
            transform: 'scale(1)',
            left: '175%',
          },
        },
        slideLeft: {
          '0%': {
            transform: 'scale(1)',
            left: '175%',
          },
          '100%': {
            transform: 'scale(0)',
          },
        },
        clockwiseSpin: {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '50%': {
            transform: 'rotate(180deg)',
          },
          '100%': {
            transform: 'rotate(0deg)',
          },
        },
        anticlockwiseSpin: {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '50%': {
            transform: 'rotate(-180deg)',
          },
          '100%': {
            transform: 'rotate(0deg)',
          },
        },
      },
      animation: {
        slideDown: 'slideDown 250ms linear forwards',
        slideUp: 'slideUp 250ms linear forwards',
        slideRight: 'slideRight 250ms linear forwards',
        slideLeft: 'slideLeft 250ms linear forwards',
        clockwiseSpin: 'clockwiseSpin 400ms linear forwards',
        anticlockwiseSpin: 'anticlockwiseSpin 400ms linear forwards',
      },
    },
  },
  plugins: [],
}

