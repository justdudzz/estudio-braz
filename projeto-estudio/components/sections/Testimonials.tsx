import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, Instagram } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';

const testimonialsData = [
  {
    quote: "A excelência em pessoa. O microblading ficou incrivelmente natural. A Mariana tem um talento único e um cuidado extremo com cada detalhe.",
    name: "Catarina V.",
    service: "Microblading",
    stars: 5
  },
  {
    quote: "Uma verdadeira experiência de spa. A limpeza de pele não só melhorou a textura do meu rosto como me deixou completamente relaxada.",
    name: "Joana M.",
    service: "Limpeza de Pele Profunda",
    stars: 5
  },
  {
    quote: "Design perfeito e durabilidade impressionante. São, sem dúvida, as melhores unhas de gel que já fiz na região de Águeda.",
    name: "Beatriz S.",
    service: "Design de Unhas",
    stars: 5
  },
  {
    quote: "O lifting de pestanas abriu o meu olhar de uma forma que nunca imaginei ser possível. Recomendo de olhos fechados o Studio Braz.",
    name: "Inês P.",
    service: "Lifting de Pestanas",
    stars: 5
  }
];

const TestimonialCard: React.FC<{ testimonial: typeof testimonialsData[0], index: number }> = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="relative bg-gradient-to-br from-[#121212] to-[#0A0A0A] p-8 md:p-10 rounded-golden-lg border border-white/5 flex flex-col h-full shadow-2xl hover:border-braz-pink/30 hover:shadow-[0_0_30px_rgba(197,160,89,0.1)] transition-all duration-500 group overflow-hidden"
  >
    {/* Aspas decorativas transparentes no fundo */}
    <Quote className="absolute -bottom-4 -right-4 text-white/5 group-hover:text-braz-pink/5 group-hover:rotate-12 transition-all duration-700 w-40 h-40" />

    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className="flex text-braz-pink gap-1">
        {[...Array(testimonial.stars)].map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
        ))}
      </div>
      <Quote className="text-braz-pink/40" size={24} />
    </div>

    <p className="text-white/80 font-light italic mb-10 flex-grow text-sm md:text-base leading-relaxed tracking-wide relative z-10">
      "{testimonial.quote}"
    </p>

    <div className="mt-auto pt-6 border-t border-white/10 relative z-10 flex justify-between items-end">
      <div>
        <p className="font-bold text-white uppercase text-xs tracking-[0.2em] mb-1">{testimonial.name}</p>
        <p className="text-[10px] text-braz-pink uppercase tracking-widest">{testimonial.service}</p>
      </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
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