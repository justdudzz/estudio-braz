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

      // --- 2. IDENTIDADE CROMÁTICA (Dourado Soberano) ---
      colors: {
        'braz-gold': '#C5A059', // A nova alma do estúdio
        'braz-pink': '#C5A059', // Mantido como fallback para não quebrar componentes antigos
        'braz-black': '#0A0A0A', 
        'braz-cream': '#F5F5F5',
        'aura-gold': 'rgba(197, 160, 89, 0.1)', // Para fundos suaves e halos de luz
      },

      // --- 3. ESTÉTICA E IMPACTO ---
      fontWeight: {
        'luxury': '900', // Peso Black para títulos que impõem respeito
      },

      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },

      backgroundImage: {
        // Gradiente que simula o brilho do metal precioso
        'gold-gradient': 'linear-gradient(135deg, #C5A059 0%, #E5C585 100%)',
        'carbon-overlay': 'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,1) 100%)',
      },

      // --- 4. MOVIMENTO SOBERANO ---
      animation: {
        'blink': 'opacity 0.3s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}