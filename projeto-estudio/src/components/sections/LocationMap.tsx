import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';

const LocationMap: React.FC = () => {
  // Query precisa para o mapa baseada na morada oficial
  const mapQuery = encodeURIComponent(BUSINESS_INFO.address);

  return (
    <section id="localizacao" className="relative w-full h-[600px] bg-braz-black overflow-hidden group">

      {/* Luxurious top border fade */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-braz-gold/30 to-transparent z-20" />

      {/* LINK GIGANTE DE FUNDO (Invisível) */}
      <a
        href={BUSINESS_INFO.addressUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10 cursor-pointer"
        aria-label="Ver no Google Maps"
      />

      {/* MAPA VISUAL */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none transition-all duration-1000 group-hover:grayscale group-hover:contrast-[1.1] group-hover:brightness-[0.6] opacity-60 mix-blend-luminosity">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          title="Mapa Localização Studio Braz"
          src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          className="w-full h-full opacity-100 group-hover:opacity-80 transition-opacity duration-1000"
        ></iframe>
      </div>

      {/* Overlay Escuro para Luxo */}
      <div className="absolute inset-0 bg-gradient-to-b from-braz-black via-transparent to-braz-black pointer-events-none z-10" />

      {/* CARTÃO DE INFORMAÇÃO */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out translate-y-8 group-hover:translate-y-0">
        <div className="bg-[#101010]/90 backdrop-blur-2xl p-10 rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] text-center relative pointer-events-auto">

          {/* Glowing backgound element */}
          <div className="absolute inset-0 bg-braz-gold/5 blur-[50px] rounded-full pointer-events-none" />

          {/* Marcador Decorativo */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-br from-braz-gold to-[#e3c178] text-black p-4 rounded-full shadow-[0_0_20px_rgba(197,160,89,0.4)] border-[6px] border-[#101010]">
            <MapPin size={28} strokeWidth={1.5} className="drop-shadow-sm" />
          </div>

          <h3 className="text-2xl font-montserrat font-black text-white uppercase tracking-[0.2em] mt-6 mb-3">
            Studio Braz
          </h3>

          <p className="text-white/60 mb-8 font-medium text-sm leading-relaxed max-w-[200px] mx-auto">
            {BUSINESS_INFO.address}
          </p>

          {/* BOTÃO REAL DE REDIRECIONAMENTO */}
          <motion.a
            href={BUSINESS_INFO.addressUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.98 }}
            className="relative z-40 inline-flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:bg-braz-gold hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:scale-105 active:scale-95"
          >
            <Navigation size={18} strokeWidth={1.5} />
            <span>Abrir no GPS</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;
