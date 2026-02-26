import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants'; // Importação centralizada

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  // Efeito para garantir que o scroll volta ao topo ao carregar a página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * 1. Navegação Corrigida: 
   * Substituição do window.history manual pelo hook navigate do React Router,
   * garantindo que o estado da aplicação é mantido corretamente.
   */
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <section className="min-h-screen bg-braz-black flex items-center justify-center text-center font-montserrat relative overflow-hidden">
      
      {/* Elemento Decorativo de Fundo */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <Compass className="w-[500px] h-[500px] text-braz-pink rotate-12" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mb-8 relative inline-block">
            <h1 className="text-8xl md:text-9xl font-black text-braz-pink uppercase tracking-tighter opacity-20">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
                <Compass className="w-16 h-16 text-braz-pink animate-pulse" />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tight">
            Ups, parece que se perdeu.
          </h2>
          
          <p className="text-lg md:text-xl text-white/60 mb-12 max-w-xl mx-auto leading-relaxed">
            Não se preocupe, no {BUSINESS_INFO.name} cuidamos de si. Vamos voltar ao início para realçar a sua beleza.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoHome}
            className="inline-flex items-center space-x-3 px-10 py-4 bg-braz-pink text-braz-black font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 border-2 border-braz-pink shadow-xl shadow-braz-pink/10"
          >
            <Home size={20} />
            <span>Voltar à Home</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default NotFound;