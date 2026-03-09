import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, MessageCircle, MapPin, Clock, Calendar } from 'lucide-react';

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-montserrat">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-braz-gold/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-braz-gold/5 rounded-full blur-[120px]"></div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 text-center max-w-2xl px-4"
      >
        <motion.div
           animate={{ scale: [1, 1.02, 1] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-braz-gold via-braz-gold/80 to-braz-gold/40 uppercase">
            Braz
          </h1>
          <p className="text-braz-gold/60 tracking-[0.5em] uppercase text-[10px] mt-2 font-light">Especialista em Autoestima</p>
        </motion.div>

        <div className="h-[1px] w-24 bg-braz-gold/30 mx-auto mb-10"></div>

        <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight uppercase">A cuidar da sua autoestima <br/><span className="text-braz-gold text-lg md:text-xl font-medium italic">por dentro e por fora</span></h2>
        
        <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2rem] mb-12 backdrop-blur-sm">
          <p className="text-white/60 text-sm md:text-base leading-relaxed italic mb-6">
            "Sou a Mariana, tenho 27 anos e já trabalho no mundo da beleza há 8 anos. Com 12 cursos realizados, o meu compromisso é elevar a sua confiança com excelência."
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-3 text-white/40">
              <Clock size={16} className="text-braz-gold" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest">Terça - Sexta</p>
                <p className="text-xs text-white">09h – 19h</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <Calendar size={16} className="text-braz-gold" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest">Sábado</p>
                <p className="text-xs text-white">08h – 14h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16">
          <a 
            href="https://wa.me/351914843087" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative px-10 py-5 bg-braz-gold text-black font-black uppercase text-[10px] tracking-widest rounded-full overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              <MessageCircle size={14} /> Marcações via WhatsApp
            </span>
          </a>
          
          <a 
            href="https://instagram.com/studiobraz.estetica/" 
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-5 border border-white/5 rounded-full font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-all flex items-center gap-2 bg-white/[0.02]"
          >
            <Instagram size={14} /> Portefólio no Instagram
          </a>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-0 right-0 text-center opacity-20">
        <p className="text-[8px] uppercase tracking-[1em] font-light">Studio Braz © 2026 • 8 Anos de Experiência</p>
      </div>

    </div>
  );
};

export default Maintenance;
