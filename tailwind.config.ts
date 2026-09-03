import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './server/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
        serif: ['Markazi Text', 'Vazirmatn', 'serif'],
        engraved: ['Cinzel', 'Vazirmatn', 'serif']
      },
      colors: {
        // Warm cream "paper" ground for the public storefront.
        paper: {
          DEFAULT: '#FBF7EF',
          50: '#FDFBF6',
          100: '#F8F2E6',
          200: '#F1E7D2',
          300: '#E5D6B8',
          400: '#D5C091'
        },
        // Warm dark ink for text (softer than pure black — handmade feel).
        ink: {
          DEFAULT: '#3A332C',
          300: '#867C6B',
          400: '#6B6255',
          500: '#544B40'
        },
        // Cool silver (hairlines / jewelry) and ice-blue (rhinestone accent).
        silver: {
          DEFAULT: '#C4C7CD',
          300: '#DDE0E4',
          500: '#ABAFB8',
          700: '#899098'
        },
        ice: {
          DEFAULT: '#A9D3DC',
          200: '#D3ECF1',
          500: '#7FB9C6',
          700: '#5D93A1'
        },
        // Warm clay (primary action) and pale moon (background motif).
        clay: {
          DEFAULT: '#B5674A',
          400: '#C68165',
          700: '#92503A'
        },
        moon: '#EADFC6',
        // Warm parchment neutrals + accent for the admin panel.
        neutral: {
          50: '#F7F7F5',
          100: '#F0EFEA',
          200: '#E2E0D8',
          300: '#CCC9BE',
          400: '#ABA79A',
          500: '#8D897C',
          600: '#6E6A5E',
          700: '#55524A',
          800: '#3F3D37',
          900: '#32302B',
          950: '#1F1E1A'
        },
        accent: {
          DEFAULT: '#B5674A',
          dark: '#92503A'
        }
      }
    }
  }
}
