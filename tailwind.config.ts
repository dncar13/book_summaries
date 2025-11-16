import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        heebo: ['var(--font-heebo)'],
        inter: ['var(--font-inter)']
      },
      colors: {
        brand: {
          teal: '#1abc9c',
          amber: '#f2b705',
          violet: '#7e5bef',
          coral: '#f36f5b'
        }
      },
      boxShadow: {
        card: '0 8px 20px rgba(15, 23, 42, 0.15)'
      }
    }
  },
  corePlugins: {
    preflight: true
  }
};

export default config;
