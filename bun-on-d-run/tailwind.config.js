/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: { DEFAULT: '#0A0A0B', 800: '#141416', 700: '#1E1E21', 600: '#2A2A2E' },
        racing: { DEFAULT: '#E10600', dark: '#B30500' },
        flame: '#FF6B00',
        cream: { DEFAULT: '#FFF8E7', muted: '#CFC8B8' },
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Archivo Black"', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        toastIn: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        toastIn: 'toastIn .25s ease-out',
      },
    },
  },
  plugins: [],
}
