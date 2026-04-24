/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F58220',
          dark: '#E5741A',
          light: '#FFF3E6',
          faded: '#FDE8D0',
        },
        surface: {
          DEFAULT: '#F8F8F8',
          alt: '#F5F5F5',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#666666',
          tertiary: '#999999',
        },
        success: {
          DEFAULT: '#4CAF50',
          light: '#E8F5E9',
        },
        error: {
          DEFAULT: '#F44336',
          light: '#FFEBEE',
        },
        warning: {
          DEFAULT: '#FF9800',
          light: '#FFF3E0',
        },
        info: {
          DEFAULT: '#2196F3',
          light: '#E3F2FD',
        },
        border: {
          DEFAULT: '#E0E0E0',
          light: '#EEEEEE',
        },
        veg: '#4CAF50',
        nonveg: '#F44336',
        star: '#FFB800',
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
