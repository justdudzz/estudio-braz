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
      colors: {
        // MUDANÇA: O 'braz-pink' agora é o DOURADO do logótipo
        'braz-pink': '#C5A059', 
        
        // Fundo preto profundo para contraste de luxo
        'braz-black': '#0A0A0A', 
        
        // Creme suave para detalhes secundários
        'braz-cream': '#F5F5F5',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        // Gradiente dourado para botões e detalhes premium
        'gold-gradient': 'linear-gradient(135deg, #C5A059 0%, #E5C585 100%)',
      }
    },
  },
  plugins: [],
}