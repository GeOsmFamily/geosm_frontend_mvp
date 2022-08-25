const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/**/*.{html,ts}'
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/assets/images/hero.png')",
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        ...defaultTheme.colors,
        primary: '#255033',
        accent: '#fdcd01',
        secondary: '#70af85',
        'secondary-light': '#ecf8ed'
      }
    }
  },
  plugins: [
  require('@tailwindcss/forms'),
  ],
}
