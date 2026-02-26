import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';

const LocationMap: React.FC = () => {
  // Query precisa para o mapa
  const mapQuery = encodeURIComponent("Studio Braz, Águeda");
  
  return (
    <section id="localizacao" className="relative w-full h-[500px] bg-[#0A0A0A] overflow-hidden border-t border-white/5 group">
      
      {/* LINK GIGANTE DE FUNDO (Invisível)
          Cobre o mapa, mas fica ATRÁS do botão principal para não bloquear o clique do botão.
      */}
      <a 
        href={BUSINESS_INFO.addressUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10 cursor-pointer"
        aria-label="Ver no Google Maps"
      />

      {/* MAPA VISUAL */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none transition-all duration-700 group-hover:grayscale group-hover:invert group-hover:contrast-[0.9] group-hover:brightness-[0.7]">
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          title="Mapa Localização Studio Braz"
          src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          className="w-full h-full opacity-100 group-hover:opacity-60 transition-opacity duration-700"
        ></iframe>
      </div>

      {/* CARTÃO DE INFORMAÇÃO */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out translate-y-4 group-hover:translate-y-0">
        <div className="bg-[#0A0A0A]/95 backdrop-blur-xl p-8 rounded-2xl border border-braz-pink/30 shadow-2xl text-center relative pointer-events-auto">
          
          {/* Marcador Decorativo */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-braz-pink text-braz-black p-3 rounded-full shadow-lg border-4 border-[#0A0A0A]">
            <MapPin size={24} />
          </div>
          
          <h3 className="text-xl font-montserrat font-bold text-white uppercase tracking-widest mt-4 mb-2">
            Studio Braz
          </h3>
          
          <p className="text-white/70 mb-6 font-light text-sm leading-relaxed">
            {BUSINESS_INFO.address}
          </p>

          {/* BOTÃO REAL DE REDIRECIONAMENTO 
              O 'z-40' e 'pointer-events-auto' garantem que este link funcione perfeitamente.
          */}
          <a 
            href={BUSINESS_INFO.addressUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-40 inline-flex items-center space-x-2 bg-braz-pink hover:bg-white text-braz-black px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300"
          >
            <Navigation size={16} />
            <span>Abrir no GPS</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;