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
        }
      },
      animation: {
        'jump-in-1s': 'jump-in 0.2s ease-in' 
      }
    },
  },
  plugins: [require("daisyui")],
}
