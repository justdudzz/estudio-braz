import React from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '../common/OptimizedImage';
import { BUSINESS_INFO } from '../../utils/constants'; // Importação centralizada

const Gallery: React.FC = () => {
  /**
   * 1. Dados Dinâmicos e Flexíveis:
   * Agora o componente respeita o ratio definido para cada trabalho,
   * permitindo uma grelha mais orgânica e profissional.
   */
  const galleryItems = [
    { id: 1, src: "/gallery/img1.jpg", alt: "Microblading: Detalhe de fios realistas", ratio: 'aspect-[3/4]' },
    { id: 2, src: "/gallery/img2.jpg", alt: "Unhas de Gel: Design minimalista de luxo", ratio: 'aspect-[3/4]' },
    { id: 3, src: "/gallery/img3.jpg", alt: "Limpeza de Pele: Resultado imediato", ratio: 'aspect-square' },
    { id: 4, src: "/gallery/img4.jpg", alt: "Design de Sobrancelhas: Simetria perfeita", ratio: 'aspect-[3/4]' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  return (
    <section id="galeria" className="py-32 bg-braz-black">
      <div className="container mx-auto px-6">

        {/* Cabeçalho da Secção */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-5xl font-montserrat font-extrabold uppercase tracking-tighter text-white mb-3"
          >
            Portfólio de Luxo
          </motion.h2>
          <motion.div variants={itemVariants} className="w-24 h-1 bg-braz-pink mx-auto mb-6" />
          <motion.p variants={itemVariants} className="text-lg text-white/60 max-w-2xl mx-auto font-montserrat">
            A excelência em cada detalhe. Explore os resultados reais dos tratamentos realizados no {BUSINESS_INFO.name}.
          </motion.p>
        </motion.div>

        {/* Grelha de Imagens */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={`relative overflow-hidden rounded-xl shadow-2xl group cursor-pointer bg-[#171717] ${item.ratio} border border-white/5`}
            >
              {/* Overlay de Hover Premium */}
              <div className="absolute inset-0 bg-braz-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Ver Detalhe</span>
                </div>
              </div>

              <OptimizedImage
                src={item.src}
                alt={item.alt}
                className="w-full h-full group-hover:scale-110 transition-transform duration-1000 ease-out"
                width={600}
                height={800}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery;