/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#fcfaf2',       // Warm cream neobrutalist canvas
          card: '#ffffff',     // Pure white card base
          black: '#000000',    // Solid ink black
          yellow: '#fde047',   // Classic punchy neobrutal yellow
          yellowHover: '#facc15',
          blue: '#3b82f6',     // Electric blue
          blueLight: '#dbeafe',
          green: '#4ade80',    // Electric mint green
          greenLight: '#dcfce7',
          pink: '#f472b6',     // Coral pink
          pinkLight: '#fce7f3',
          purple: '#c084fc',   // Vivid lavender purple
          purpleLight: '#f3e8ff',
          amber: '#fbbf24',    // Warm amber
          amberLight: '#fef3c7',
          coral: '#fb7185',
          coralLight: '#ffe4e6',
          gray: '#f1f5f9'
        }
      },
      boxShadow: {
        'neo-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        'neo': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'neo-md': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'neo-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'neo-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
        'neo-hover': '0 6px 12px 0 rgba(0, 0, 0, 0.08)',
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '1': '1px',
        '2': '1px',
        '3': '1px',
        '4': '1.5px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
