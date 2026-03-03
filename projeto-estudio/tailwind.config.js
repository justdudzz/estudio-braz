/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- 1. GEOMETRIA SAGRADA (Proporção Áurea φ ≈ 1.618) ---
      // Estes valores garantem um equilíbrio visual perfeito em todo o site
      spacing: {
        'phi-0': '0.382rem', // 1 - (1/phi)
        'phi-1': '0.618rem', // 1/phi
        'phi-2': '1rem',
        'phi-3': '1.618rem', // phi
        'phi-4': '2.618rem', // phi^2
        'phi-5': '4.236rem', // phi^3
        'phi-6': '6.854rem', // phi^4
        'phi-7': '11.090rem', // phi^5
      },

      fontSize: {
        'golden-xs': ['0.618rem', '1rem'],
        'golden-sm': ['0.809rem', '1.309rem'],
        'golden-base': ['1rem', '1.618rem'],
        'golden-lg': ['1.618rem', '2.618rem'],
        'golden-xl': ['2.618rem', '4.236rem'],
      },

      borderRadius: {
        'golden': '0.618rem',
        'golden-lg': '1.618rem',
      },

      // --- 2. IDENTIDADE CROMÁTICA (Dourado Soberano Elite) ---
      colors: {
        'braz-gold': '#C5A059', // A nova alma do estúdio
        'braz-gold-light': '#D6B878', // Para hovers subtis
        'braz-gold-dark': '#9A7A3E', // Para gradientes profundos
        'braz-black': '#050505', // Preto abismal para luxo
        'braz-charcoal': '#121212', // Cinzento rico para cartões
        'braz-cream': '#F8F6F0', // Branco sujo editorial
        'aura-gold': 'rgba(197, 160, 89, 0.08)', // Halos ultra-suaves
        'glass-dark': 'rgba(10, 10, 10, 0.4)', // Vidro negro premium
      },

      // --- 3. ESTÉTICA E IMPACTO ---
      fontWeight: {
        'luxury': '900', // Peso Black para títulos que impõem respeito
      },

      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },

      backgroundImage: {
        // Gradiente metálico hiper-realista para detalhes premium
        'gold-metallic': 'linear-gradient(135deg, #A88241 0%, #D6B878 35%, #FFF2C8 50%, #D6B878 65%, #A88241 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C5A059 0%, #E5C585 100%)',
        'carbon-overlay': 'linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,1) 100%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.0) 100%)',
      },

      boxShadow: {
        'elite-glow': '0 0 40px -10px rgba(197, 160, 89, 0.15)',
        'elite-glow-hover': '0 0 60px -15px rgba(197, 160, 89, 0.3)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },

      // --- 4. MOVIMENTO SOBERANO (Cinema & Fluidez) ---
      animation: {
        'blink': 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}