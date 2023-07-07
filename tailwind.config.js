/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        vt323: ['VT323', ...defaultTheme.fontFamily.mono],
        Nosutaru: ['Nosutaru-dotMPlusH-10-Regular', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        sm: ['20px', '20px'],
        base: ['24px', '24px'],
        lg: ['28px', '28px'],
        xl: ['36px', '32px'],
        '2xl': ['48px', '48px'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
