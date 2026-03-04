import React from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '../common/OptimizedImage';
import { CheckCircle2 } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';
import { scrollToSection } from '../../utils/scroll';

const SpecialistSection: React.FC = () => {
  const highlights = [
    "Especialista em Estética Avançada",
    "Formação Contínua Internacional",
    "Abordagem Personalizada e Holística",
    "Foco em Resultados Naturais e Duradouros"
  ];

  return (
    <section id="especialista" className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      {/* Elemento decorativo de fundo */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-braz-gold/5 -skew-x-12 transform origin-top-right z-0"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">

          {/* Coluna da Imagem */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2 flex justify-center"
          >
            {/* CORREÇÃO: Adicionado 'mx-auto' para forçar o centro e removidas as medidas fixas */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-braz-gold/20 w-full max-w-md lg:max-w-lg mx-auto">
              <OptimizedImage
                src="/mariana-specialist.jpg"
                alt={BUSINESS_INFO.owner}
                /* CORREÇÃO: w-full e h-auto para a imagem fluir, object-center para alinhar */
                className="w-full h-auto object-cover object-center block"
              // Removemos width e height fixos para não estragar o alinhamento
              />
            </div>
          </motion.div>

          {/* Coluna de Texto */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-1/2 space-y-8 text-center md:text-left"
          >
            <div>
              <h3 className="text-braz-gold text-xl font-bold uppercase tracking-widest mb-2 font-montserrat">A Especialista</h3>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 font-montserrat tracking-tight">
                {BUSINESS_INFO.owner}
              </h2>
              <div className="w-24 h-1.5 bg-braz-gold rounded-full mb-8 mx-auto md:mx-0"></div>
            </div>

            <p className="text-white/80 text-lg leading-relaxed font-montserrat">
              Com uma paixão inabalável pela beleza e bem-estar, dedico-me a realçar a sua melhor versão. Acredito que cada rosto é único e merece uma abordagem exclusiva, combinando as técnicas mais avançadas com um toque de arte e precisão.
            </p>
            <p className="text-white/80 text-lg leading-relaxed font-montserrat">
              No {BUSINESS_INFO.name}, o seu conforto e confiança são a minha prioridade. Utilizo apenas produtos de alta performance e tecnologias comprovadas para garantir resultados que superam as expectativas.
            </p>

            <ul className="space-y-4 pt-4 font-montserrat inline-block text-left">
              {highlights.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center text-white/90 font-medium"
                >
                  <CheckCircle2 className="text-braz-gold mr-3 flex-shrink-0" size={24} strokeWidth={1.5} />
                  {item}
                </motion.li>
              ))}
            </ul>

            <div className="pt-8 font-montserrat">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('agendamento')}
                className="bg-transparent border-2 border-braz-gold text-braz-gold px-8 py-3 text-lg font-bold uppercase tracking-widest hover:bg-braz-gold hover:text-braz-black transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-braz-gold/30 rounded-sm"
              >
                Conheça o Meu Trabalho
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SpecialistSection;
