/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
 
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes:{
        'jump-in': {
          '0%': {
              transform: 'scale(70%)',
          },
          '80%': {
              transform: 'scale(120%)',
          },
          '100%': {
              transform: 'scale(100%)',
          },
        },
        'blink-inline': {
          'from, to' : {
            backgroundColor: 'transparent'
          },
          '50%' : {
            backgroundColor: '#22C55E'
          }
        },
        'rotate-ac-135': {
          'to': {
            transform: 'rotate(-135deg)'
          }
        },
        'rotate-ac-75': {
          'to': {
            transform: 'rotate(-75deg)'
          }
        },
        'rotate-ac-15': {
          to: {
            transform: 'rotate(-15deg)'
          }
        },
        'rotate-ac--45': {
          to: {
            transform: 'rotate(45deg)'
          }
        },
        'rotate-ac-255': {
          to: {
            transform: 'rotate(-225deg)'
          }
        }, 
        // clockwise rotations
        'rotate-c-135': {
          'to': {
            transform: 'rotate(135deg)'
          }
        },
        'rotate-c-75': {
          'to': {
            transform: 'rotate(75deg)'
          }
        },
        'rotate-c-15': {
          to: {
            transform: 'rotate(15deg)'
          }
        },
        'rotate-c--45': {
          to: {
            transform: 'rotate(-45deg)'
          }
        },
        'rotate-c-255': {
          to: {
            transform: 'rotate(225deg)'
          }
        },
        'type-in': {
          from: { width: '0' },
          to: { width: '100%' }
        }
      },
      animation: {
        'jump-in-1s': 'jump-in 0.2s ease-in',
        'blink-inline-0.5s': 'blink-inline 1s step-end 10',
        'rotate-ac-135-2s': 'rotate-ac-135 2s ease-in-out forwards 1',
        'rotate-ac-255-2s': 'rotate-ac-255 2s ease-in-out forwards 1',
        'rotate-ac-75-2s': 'rotate-ac-75 2s ease-in-out forwards 1',
        'rotate-ac-15-2s': 'rotate-ac-15 2s ease-in-out forwards 1',
        'rotate-ac--45-2s': 'rotate-ac--45 2s ease-in-out forwards 1',
        'rotate-c-135-2s': 'rotate-c-135 2s ease-in-out forwards 1',
        'rotate-c-255-2s': 'rotate-c-255 2s ease-in-out forwards 1',
        'rotate-c-75-2s': 'rotate-c-75 2s ease-in-out forwards 1',
        'rotate-c-15-2s': 'rotate-c-15 2s ease-in-out forwards 1',
        'rotate-c--45-2s': 'rotate-c--45 2s ease-in-out forwards 1',
        'rotate-test-2s': 'rotate-test 2s ease-in-out forwards 1',
        'type-in-2s': 'type-in 2s forwards 1'
      },
      colors: {
        'tema-40': '#264653',
        'tema-25': '#2A9D8F',
        'tema-15': '#E9C46A',
        'tema-10': '#F4A261',
        'tema-10': '#E76F51',
        'tema-40-opacity-95': '#EDF1D6f2',
        'tema-25-opacity-95': '#9DC08Bf2',
        'tema-15-opacity-95': '#609966f2',
        'tema-10-opacity-95': '#40513Bf2',
        'tema-10-opacity-95': '#40513Bf2',
      },
    },
  },
  plugins: [require("daisyui")],
}
