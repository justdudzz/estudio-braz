import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

interface BeforeAfterImage {
  serviceId: string;
  before: string;
  after: string;
}

/**
 * 1. Soberania de Ativos:
 * Links externos substituídos por caminhos locais seguros na sua pasta de ativos.
 */
const beforeAfterImages: BeforeAfterImage[] = [
  {
    serviceId: 'microblading',
    before: '/assets/resultados/microblading-antes.jpg',
    after: '/assets/resultados/microblading-depois.jpg',
  },
  {
    serviceId: 'unhas-gel',
    before: '/assets/resultados/unhas1.jpg',
    after: '/assets/resultados/unhas2.jpg',
  },
  {
    serviceId: 'massagens',
    before: '/assets/resultados/massagem-antes.jpg',
    after: '/assets/resultados/massagem-depois.jpg',
  },
  {
    serviceId: 'limpeza-pele',
    before: '/assets/resultados/limpeza-antes.jpg',
    after: '/assets/resultados/limpeza-depois.jpg',
  },
];

const serviceOptions = [
  { value: '', label: 'Selecione um Serviço' },
  { value: 'microblading', label: 'Microblading de Sobrancelhas' },
  { value: 'unhas-gel', label: 'Unhas de Gel & Verniz Gel' },
  { value: 'massagens', label: 'Massagens Terapêuticas' },
  { value: 'limpeza-pele', label: 'Limpeza de Pele Profunda' },
];

const TrustMirror: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [showBefore, setShowBefore] = useState(true);

  const currentImages = beforeAfterImages.find(img => img.serviceId === selectedService);

  return (
    <section id="espelho-confianca" className="py-24 lg:py-32 px-8 lg:px-16 bg-braz-black" aria-labelledby="trustmirror-heading">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="trustmirror-heading" className="text-5xl lg:text-6xl font-bold mb-6 text-white uppercase tracking-tighter">
            O Seu <span className="text-braz-pink">Espelho</span> de Confiança
          </h2>
          <div className="w-24 h-1 bg-braz-pink mx-auto mb-8" />
          <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
            A transformação começa aqui. Selecione um dos nossos serviços de elite e visualize o impacto real dos nossos tratamentos.
          </p>
        </motion.div>

        <motion.div
          className="bg-[#171717] p-8 md:p-12 rounded-2xl shadow-2xl border border-white/5 flex flex-col items-center space-y-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-full max-w-md">
            <Select
              id="service-selector"
              label="O que deseja transformar?"
              options={serviceOptions}
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setShowBefore(true); // Reset para o "Antes" ao mudar serviço
              }}
              className="border-white/10 focus:border-braz-pink"
            />
          </div>

          <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black/50 group">
            <AnimatePresence mode="wait">
              {selectedService && currentImages ? (
                <motion.div
                  key={selectedService + (showBefore ? 'before' : 'after')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img
                    src={showBefore ? currentImages.before : currentImages.after}
                    alt={`${showBefore ? 'Antes' : 'Depois'} do tratamento de ${selectedService}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Overlay Informativo */}
                  <div className="absolute top-4 left-4 bg-braz-black/80 backdrop-blur-md px-4 py-1 rounded-full border border-braz-pink/30">
                    <span className="text-braz-pink text-xs font-bold uppercase tracking-widest">
                      {showBefore ? 'Antes' : 'Depois'}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 space-y-4">
                  <Sparkles className="w-12 h-12 opacity-20" />
                  <p className="font-montserrat">Selecione um serviço para ver o resultado</p>
                </div>
              )}
            </AnimatePresence>

            {/* Controlos de Visualização */}
            {selectedService && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-braz-black/60 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl">
                <button
                  onClick={() => setShowBefore(true)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-full transition-all ${showBefore ? 'bg-braz-pink text-braz-black font-bold' : 'text-white hover:bg-white/10'
                    }`}
                  aria-pressed={showBefore}
                >
                  <EyeOff size={18} />
                  <span>Antes</span>
                </button>
                <button
                  onClick={() => setShowBefore(false)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-full transition-all ${!showBefore ? 'bg-braz-pink text-braz-black font-bold' : 'text-white hover:bg-white/10'
                    }`}
                  aria-pressed={!showBefore}
                >
                  <Eye size={18} />
                  <span>Depois</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustMirror;