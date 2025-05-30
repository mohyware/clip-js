import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        surfacePrimary: "oklch(.141 .005 285.823)",
        darkSurfacePrimary: "oklch(.141 .005 285.823)",
      },
      border: {
        DEFAULT: "rgba(128, 128, 128, 0.5)",
      },
    },
  },
  plugins: [],
}
export default config
