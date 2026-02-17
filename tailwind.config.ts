import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0f',
          card: '#14141f',
          'card-hover': '#1a1a2e',
          surface: '#1e1e30',
        },
        text: {
          primary: '#e8e8ed',
          secondary: '#8888a0',
        },
        accent: {
          green: '#00ff87',
          gold: '#ffd700',
          red: '#ff4757',
          blue: '#4a90d9',
          yellow: '#ffbe0b',
        },
        border: {
          subtle: '#2a2a3e',
        },
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url('/noise.png')",
      },
    },
  },
  plugins: [],
}
export default config
