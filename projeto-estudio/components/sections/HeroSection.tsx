import React from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '../common/OptimizedImage';
import { ArrowDownCircle } from 'lucide-react';
import { scrollToSection } from '../../utils/scroll';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.5
    }
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const HeroSection: React.FC = () => {
  const handleScroll = () => {
    scrollToSection('servicos');
  };

  return (
    <section id="hero" className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">

      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full">
        <OptimizedImage
          src="/assets/hero-bg.jpg" // Agora aponta para o seu próprio servidor
          alt="Ambiente de estética de luxo escuro e dourado"
          className="w-full h-full object-cover object-center opacity-60"
          priority={true}
        />
        {/* Overlay Escuro Gradual */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-5xl mx-auto px-6 mt-0 md:mt-10"
      >
        {/* CORREÇÃO AQUI: Alterado de Estúdio para Studio */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tighter text-white mb-6 drop-shadow-2xl"
        >
          Studio Braz
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-2xl lg:text-3xl text-braz-pink font-light mb-12 tracking-wide leading-relaxed"
        >
          Estética Avançada &amp; Beleza de Luxo em Águeda
        </motion.p>

        <motion.div variants={itemVariants}>
          <button
            onClick={() => scrollToSection('agendamento')}
            className="bg-braz-pink text-braz-black px-12 py-5 text-lg font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(197,160,89,0.4)] focus:outline-none focus:ring-4 focus:ring-braz-pink/50 rounded-sm hover:scale-105 transform"
          >
            Agende o Seu Tratamento
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.button
        variants={itemVariants}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.8 }}
        onClick={handleScroll}
        className="absolute bottom-10 z-10 text-white/50 hover:text-braz-pink transition-colors focus:outline-none rounded-full p-2 animate-bounce"
      >
        <ArrowDownCircle size={40} strokeWidth={1.5} />
      </motion.button>

    </section>
  );
};

export default HeroSection;