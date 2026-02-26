import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, Instagram } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';

const testimonialsData = [
  {
    quote: "A Mariana é uma artista. O microblading ficou super natural, exatamente como eu queria!",
    name: "Sofia R.",
    service: "Microblading",
    stars: 5
  },
  {
    quote: "Ambiente fantástico e atendimento de luxo. A limpeza de pele mudou a textura do meu rosto.",
    name: "Carla M.",
    service: "Limpeza de Pele",
    stars: 5
  },
  {
    quote: "Melhores unhas de gel da região. Durabilidade e design impecáveis.",
    name: "Beatriz S.",
    service: "Unhas de Gel",
    stars: 5
  }
];

const TestimonialCard: React.FC<{ testimonial: typeof testimonialsData[0], index: number }> = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="bg-[#171717] p-8 rounded-2xl border border-white/5 flex flex-col h-full shadow-xl hover:border-braz-pink/20 transition-all group"
  >
    <div className="flex text-braz-pink mb-4">
      {[...Array(testimonial.stars)].map((_, i) => (
        <Star key={i} size={14} fill="currentColor" />
      ))}
    </div>
    <Quote className="text-braz-pink/20 mb-4 group-hover:text-braz-pink/40 transition-colors" size={32} />
    <p className="text-white/80 italic mb-8 flex-grow leading-relaxed">
      "{testimonial.quote}"
    </p>
    <div className="mt-auto pt-4 border-t border-white/5">
      <p className="font-bold text-white uppercase text-xs tracking-widest">{testimonial.name}</p>
      <p className="text-[10px] text-braz-pink uppercase tracking-wider">{testimonial.service}</p>
    </div>
  </motion.div>
);

const Testimonials: React.FC = () => {
  return (
    <section id="testemunhos" className="py-32 bg-braz-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-extrabold text-white uppercase tracking-tighter">Experiências Reais</h2>
          <div className="w-20 h-1 bg-braz-pink mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 text-center bg-white/5 p-10 rounded-2xl border border-dashed border-white/10"
        >
          <p className="text-white/60 mb-6 font-montserrat">Partilhe a sua transformação e ajude outras mulheres.</p>
          <a
            href={BUSINESS_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 bg-transparent border border-braz-pink text-braz-pink px-8 py-3 font-bold uppercase text-xs tracking-[0.2em] hover:bg-braz-pink hover:text-braz-black transition-all"
          >
            <Instagram size={18} />
            <span>Avaliar no Instagram</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;