export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka"', '"Noto Sans TC"', 'sans-serif'],
        sans: ['"DM Sans"', '"Noto Sans TC"', 'sans-serif'],
        cn: ['"Noto Sans TC"', 'sans-serif'],
      },
      colors: {
        night: '#0B0B11',
        surface: '#16161F',
        'surface-light': '#22222E',
        coral: '#FF5757',
        amber: '#FFB443',
        mint: '#1EEBB8',
        lavender: '#8B7BF7',
        cream: '#F0EBE3',
        muted: '#7A7889',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
