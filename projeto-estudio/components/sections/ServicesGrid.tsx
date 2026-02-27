import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Scissors, Flower2, Droplets, Zap,
  X, ChevronLeft, ChevronRight, Clock, Euro, CheckCircle2 
} from 'lucide-react';
import { scrollToSection } from '../../utils/scroll';
import { BUSINESS_INFO } from '../../utils/constants';

// --- TIPOS DE DADOS ---
interface Transformation {
  id: number;
  before: string;
  after: string;
  label: string;
}

interface ServiceData {
  id: string;
  title: string;
  desc: string; // Descrição curta para o cartão
  icon: React.ElementType;
  fullDesc: string; // Descrição longa para o modal
  subServices: string[]; // Lista detalhada (ex: Gel, Acrílico...)
  duration: string;
  priceStart: string;
  results: Transformation[];
}

// --- DADOS SOBERANOS: APONTANDO PARA AS SUAS PASTAS LOCAIS ---
const services: ServiceData[] = [
  {
    id: 'sobrancelhas',
    title: 'Olhar & Sobrancelhas',
    desc: 'Microblading, Design e Depilação a Linha para um olhar harmonioso.',
    fullDesc: 'Transforme o seu olhar com as nossas técnicas especializadas. Desde o Microblading fio-a-fio para resultados hiper-realistas, até ao Design de Sobrancelhas personalizado que respeita a sua geometria facial.',
    subServices: ['Microblading Fio-a-Fio', 'Design de Sobrancelhas', 'Depilação a Linha (Threading)', 'Coloração com Henna'],
    duration: '30min - 2h30',
    priceStart: '€15',
    icon: Sparkles,
    results: [
      { 
        id: 1, 
        before: "/assets/resultados/sobrancelhas-antes-1.jpg", 
        after: "/assets/resultados/sobrancelhas-depois-1.jpg",
        label: "Microblading: Reconstrução"
      },
      { 
        id: 2, 
        before: "/assets/resultados/sobrancelhas-antes-2.jpg", 
        after: "/assets/resultados/sobrancelhas-depois-2.jpg",
        label: "Design & Henna"
      }
    ]
  },
  {
    id: 'unhas',
    title: 'Nail Bar',
    desc: 'Unhas de Gel, Acrílico, Verniz Gel, Manicure e Pedicure.',
    fullDesc: 'Cuidado completo para mãos e pés. Trabalhamos com Gel, Acrílico e Verniz Gel de alta durabilidade, focando sempre na saúde da unha natural e num acabamento fino e elegante.',
    subServices: ['Unhas de Gel / Acrílico', 'Verniz Gel', 'Manicure Clássica', 'Pedicure Medical/Estética'],
    duration: '1h - 1h30',
    priceStart: '€25',
    icon: Scissors,
    results: [
      { 
        id: 1, 
        before: "/assets/resultados/unhas1.jpg", 
        after: "/assets/resultados/unhas2.jpg",
        label: "Alongamento em Gel"
      },
      { 
        id: 2, 
        before: "/assets/resultados/unhas3.jpg", 
        after: "/assets/resultados/unhas4.jpg",
        label: "Nail Art Minimalista"
      }
    ]
  },
  {
    id: 'rosto',
    title: 'Estética Facial',
    desc: 'Limpeza de pele profunda e tratamentos de rejuvenescimento.',
    fullDesc: 'Protocolos avançados para purificar, nutrir e iluminar. A nossa Limpeza de Pele remove impurezas sem dor, enquanto os tratamentos de hidratação devolvem a vitalidade ao seu rosto.',
    subServices: ['Limpeza de Pele Profunda', 'Hidratação Intensiva', 'Peeling Químico', 'Tratamento Anti-Age'],
    duration: '1h - 1h30',
    priceStart: '€45',
    icon: Droplets,
    results: [
      { 
        id: 1, 
        before: "/assets/resultados/rosto-antes-1.jpg", 
        after: "/assets/resultados/rosto-depois-1.jpg",
        label: "Limpeza Profunda"
      },
      { 
        id: 2, 
        before: "/assets/resultados/rosto-antes-2.jpg", 
        after: "/assets/resultados/rosto-depois-2.jpg",
        label: "Hidratação & Glow"
      }
    ]
  },
  {
    id: 'corpo',
    title: 'Corpo & Relax',
    desc: 'Massagens Terapêuticas, Relaxantes e Drenagem Linfática.',
    fullDesc: 'O equilíbrio que o seu corpo precisa. Desde a Drenagem Linfática para eliminar retenção de líquidos até à Massagem Terapêutica para aliviar a tensão muscular acumulada.',
    subServices: ['Drenagem Linfática', 'Massagem Terapêutica', 'Massagem Relaxante', 'Massagem Desportiva'],
    duration: '45min - 1h',
    priceStart: '€40',
    icon: Flower2,
    results: [
      { 
        id: 1, 
        before: "/assets/resultados/corpo-antes-1.jpg", 
        after: "/assets/resultados/corpo-depois-1.jpg",
        label: "Alívio de Tensão"
      },
      { 
        id: 2, 
        before: "/assets/resultados/corpo-antes-2.jpg", 
        after: "/assets/resultados/corpo-depois-2.jpg",
        label: "Drenagem: Redução de Edema"
      }
    ]
  },
  {
    id: 'depilacao',
    title: 'Depilação',
    desc: 'Soluções eficazes: Laser, Cera e Linha para uma pele suave.',
    fullDesc: 'Livre-se dos pelos indesejados com a técnica que melhor se adapta a si. Dispomos de Laser de alta potência (resultados rápidos), Cera para peles sensíveis e Linha para zonas delicadas do rosto.',
    subServices: ['Depilação a Laser (Díodo)', 'Depilação a Cera', 'Depilação a Linha (Rosto)'],
    duration: '15min - 1h',
    priceStart: '€10',
    icon: Zap,
    results: [
      { 
        id: 1, 
        before: "/assets/resultados/depilacao-antes-1.jpg", 
        after: "/assets/resultados/depilacao-depois-1.jpg",
        label: "Laser: Resultado 1ª Sessão"
      },
      { 
        id: 2, 
        before: "/assets/resultados/depilacao-antes-2.jpg", 
        after: "/assets/resultados/depilacao-depois-2.jpg",
        label: "Pele Lisa e Suave"
      }
    ]
  }
];

// --- COMPONENTE: Troca Automática Antes/Depois ---
const AutoSwitchImage: React.FC<{ before: string; after: string; label: string }> = ({ before, after, label }) => {
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowAfter(prev => !prev);
    }, 3500); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.img
          key={showAfter ? 'after' : 'before'}
          src={showAfter ? after : before}
          alt={showAfter ? "Resultado Final" : "Estado Inicial"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute top-6 left-6 z-10 flex flex-col items-start gap-2">
        <motion.div
          key={showAfter ? 'label-after' : 'label-before'}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`px-4 py-2 rounded-md font-bold text-sm tracking-widest uppercase shadow-lg border-l-4 ${
            showAfter 
              ? 'bg-braz-pink text-braz-black border-white' 
              : 'bg-white/90 text-black border-braz-pink'
          }`}
        >
          {showAfter ? "Resultado Final" : "Antes"}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
        <motion.div
          key={showAfter ? 'prog-after' : 'prog-before'}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3.5, ease: "linear" }}
          className="h-full bg-braz-pink"
        />
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md p-3 rounded-lg border border-white/10 inline-flex items-center shadow-lg">
          <Sparkles className="w-4 h-4 text-braz-pink mr-2" />
          <span className="text-white font-medium text-sm tracking-wide">{label}</span>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DO CARTÃO ---
const ServiceCard: React.FC<{ service: ServiceData, index: number, onOpen: (s: ServiceData) => void }> = ({ service, index, onOpen }) => {
    const Icon = service.icon;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="group bg-[#171717] p-8 shadow-2xl border border-white/5 flex flex-col h-full rounded-2xl transition-all duration-500 hover:border-braz-pink/40 hover:shadow-braz-pink/10 hover:-translate-y-2"
        >
            <div className="bg-braz-pink/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-braz-pink transition-colors duration-500">
                <Icon className="text-braz-pink group-hover:text-braz-black transition-colors duration-500" size={28} strokeWidth={1.5} />
            </div>

            <h3 className="text-xl font-montserrat font-bold text-white mb-3 uppercase tracking-tight">
                {service.title}
            </h3>
            
            <p className="text-white/60 text-sm font-montserrat leading-relaxed mb-6 flex-grow">
                {service.desc}
            </p>
            
            <button 
                onClick={() => onOpen(service)}
                className="w-full bg-transparent border border-braz-pink/30 text-braz-pink px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-braz-pink hover:text-braz-black transition-all duration-300 rounded-lg active:scale-95 flex items-center justify-center gap-2"
            >
                <span>Ver Resultados</span>
                <ChevronRight size={14} />
            </button>
        </motion.div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const ServicesGrid: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  useEffect(() => {
    if (selectedService) setCurrentResultIndex(0);
  }, [selectedService]);

  const nextResult = () => {
    if (!selectedService) return;
    setCurrentResultIndex((prev) => (prev + 1) % selectedService.results.length);
  };

  const prevResult = () => {
    if (!selectedService) return;
    setCurrentResultIndex((prev) => (prev - 1 + selectedService.results.length) % selectedService.results.length);
  };

  return (
    <section id="servicos" className="py-24 bg-braz-black relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-braz-pink text-xs font-bold uppercase tracking-[0.4em] mb-4">
            Menu de Serviços
          </motion.p>
          <h2 className="text-4xl md:text-5xl font-montserrat font-extrabold text-white uppercase tracking-tighter">
            Excelência & Cuidado
          </h2>
          <div className="w-16 h-1 bg-braz-pink mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {services.map((service, index) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              index={index} 
              onOpen={setSelectedService} 
            />
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <p className="text-white/30 text-[10px] uppercase tracking-widest">
                * Todos os serviços incluem avaliação inicial personalizada.
            </p>
        </div>
      </div>

      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#121212] w-full max-w-5xl h-[90vh] md:h-[650px] rounded-2xl border border-braz-pink/20 shadow-2xl flex flex-col md:flex-row overflow-hidden"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 z-30 text-white/50 hover:text-white bg-black/50 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              {/* ESQUERDA: Imagem Automática */}
              <div className="w-full md:w-3/5 bg-black relative h-[45%] md:h-full group border-b md:border-b-0 md:border-r border-white/10">
                <AutoSwitchImage 
                  before={selectedService.results[currentResultIndex].before}
                  after={selectedService.results[currentResultIndex].after}
                  label={selectedService.results[currentResultIndex].label}
                />

                <button 
                  onClick={(e) => { e.stopPropagation(); prevResult(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-braz-pink text-white p-3 rounded-full backdrop-blur-sm transition-all border border-white/10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextResult(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-braz-pink text-white p-3 rounded-full backdrop-blur-sm transition-all border border-white/10"
                >
                  <ChevronRight size={24} />
                </button>
                
                <div className="absolute bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                  {selectedService.results.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentResultIndex ? 'w-8 bg-braz-pink' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* DIREITA: Conteúdo */}
              <div className="w-full md:w-2/5 p-8 flex flex-col h-[55%] md:h-full overflow-y-auto bg-[#171717]">
                <div className="mb-auto">
                  <div className="flex items-center space-x-2 text-braz-pink mb-4 opacity-80">
                    <selectedService.icon size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Sobre o Serviço</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-montserrat font-bold text-white mb-4 uppercase tracking-tighter leading-tight">
                    {selectedService.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm leading-relaxed mb-6">
                    {selectedService.fullDesc}
                  </p>

                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Inclui:</h4>
                    <ul className="space-y-2">
                        {selectedService.subServices.map((sub, i) => (
                            <li key={i} className="text-white/90 text-sm flex items-start">
                                <CheckCircle2 size={14} className="text-braz-pink mr-2 mt-0.5 flex-shrink-0" />
                                {sub}
                            </li>
                        ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center text-braz-pink mb-1">
                        <Clock size={14} className="mr-2" />
                        <span className="text-[10px] font-bold uppercase">Tempo</span>
                      </div>
                      <p className="text-white text-sm font-bold">{selectedService.duration}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center text-braz-pink mb-1">
                        <Euro size={14} className="mr-2" />
                        <span className="text-[10px] font-bold uppercase text-white/60">Desde (IVA Incl.)</span>
                      </div>
                      <p className="text-white text-sm font-bold">{selectedService.priceStart}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                  <button 
                    onClick={() => {
                      setSelectedService(null);
                      setTimeout(() => scrollToSection('agendamento'), 300);
                    }}
                    className="w-full bg-braz-pink text-braz-black py-4 text-sm font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 rounded-sm"
                  >
                    <span>Agendar Agora</span>
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesGrid;