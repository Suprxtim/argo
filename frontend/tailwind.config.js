/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        coral: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        // Custom animations for the ocean background
        'gradient-shift': 'gradientShift 20s ease infinite',
        'wave-slowest': 'waveSlowest 30s ease-in-out infinite',
        'wave-slow': 'waveSlow 25s ease-in-out infinite',
        'wave-medium': 'waveMedium 20s ease-in-out infinite',
        'wave-fast': 'waveFast 15s ease-in-out infinite',
        'wave-fastest': 'waveFastest 10s ease-in-out infinite',
        'float': 'float 15s linear infinite',
        'float-particle': 'floatParticle 20s linear infinite',
        'pulse-slow': 'pulseSlow 8s ease-in-out infinite',
        'pulse-medium': 'pulseMedium 6s ease-in-out infinite',
        'pulse-fast': 'pulseFast 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        // Ocean wave animations
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        waveSlowest: {
          '0%': { transform: 'translateX(0) translateY(0) scaleY(1);' },
          '25%': { transform: 'translateX(-40px) translateY(15px) scaleY(1.1);' },
          '50%': { transform: 'translateX(-80px) translateY(10px) scaleY(0.9);' },
          '75%': { transform: 'translateX(-40px) translateY(5px) scaleY(1.05);' },
          '100%': { transform: 'translateX(0) translateY(0) scaleY(1);' },
        },
        waveSlow: {
          '0%': { transform: 'translateX(0) translateY(0) scaleY(1);' },
          '25%': { transform: 'translateX(-80px) translateY(12px) scaleY(1.05);' },
          '50%': { transform: 'translateX(-160px) translateY(8px) scaleY(0.95);' },
          '75%': { transform: 'translateX(-80px) translateY(4px) scaleY(1.02);' },
          '100%': { transform: 'translateX(0) translateY(0) scaleY(1);' },
        },
        waveMedium: {
          '0%': { transform: 'translateX(0) translateY(0) scaleY(1);' },
          '25%': { transform: 'translateX(-120px) translateY(-8px) scaleY(1.1);' },
          '50%': { transform: 'translateX(-240px) translateY(-4px) scaleY(0.9);' },
          '75%': { transform: 'translateX(-120px) translateY(-2px) scaleY(1.05);' },
          '100%': { transform: 'translateX(0) translateY(0) scaleY(1);' },
        },
        waveFast: {
          '0%': { transform: 'translateX(0) translateY(0) scaleY(1);' },
          '25%': { transform: 'translateX(-160px) translateY(6px) scaleY(1.08);' },
          '50%': { transform: 'translateX(-320px) translateY(3px) scaleY(0.92);' },
          '75%': { transform: 'translateX(-160px) translateY(1.5px) scaleY(1.03);' },
          '100%': { transform: 'translateX(0) translateY(0) scaleY(1);' },
        },
        waveFastest: {
          '0%': { transform: 'translateX(0) translateY(0) scaleY(1);' },
          '25%': { transform: 'translateX(-200px) translateY(-10px) scaleY(1.15);' },
          '50%': { transform: 'translateX(-400px) translateY(-5px) scaleY(0.85);' },
          '75%': { transform: 'translateX(-200px) translateY(-2.5px) scaleY(1.07);' },
          '100%': { transform: 'translateX(0) translateY(0) scaleY(1);' },
        },
        float: {
          '0%': { 
            transform: 'translateY(0) translateX(0) rotate(0deg)',
            opacity: '0'
          },
          '10%': { opacity: '0.5' },
          '90%': { opacity: '0.5' },
          '100%': { 
            transform: 'translateY(-100vh) translateX(20px) rotate(360deg)',
            opacity: '0'
          },
        },
        floatParticle: {
          '0%': { 
            transform: 'translateY(0) translateX(0) rotate(0deg)',
            opacity: '0'
          },
          '10%': { opacity: '0.3' },
          '90%': { opacity: '0.3' },
          '100%': { 
            transform: 'translateY(-100vh) translateX(10px) rotate(180deg)',
            opacity: '0'
          },
        },
        pulseSlow: {
          '0%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.2)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '0.3' },
        },
        pulseMedium: {
          '0%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.3)', opacity: '0.6' },
          '100%': { transform: 'scale(1)', opacity: '0.3' },
        },
        pulseFast: {
          '0%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.4)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '0.3' },
        }
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}