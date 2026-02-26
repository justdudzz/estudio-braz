import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import { scrollToSection } from '../../utils/scroll';
import { BUSINESS_INFO } from '../../utils/constants'; // Importação centralizada

interface VoucherPopupProps {
  onClose: () => void;
}

const VoucherPopup: React.FC<VoucherPopupProps> = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-braz-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-[#171717] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative border border-braz-pink/20"
        >
          {/* Botão de Fechar Refinado */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/50 hover:text-braz-pink transition-colors p-2 rounded-full hover:bg-white/5 z-10 focus:outline-none focus:ring-2 focus:ring-braz-pink"
            aria-label="Fechar oferta especial"
          >
            <X size={24} />
          </button>

          <div className="p-10 md:p-14 text-center">
            <div className="relative inline-block mb-6">
                <Gift className="w-16 h-16 text-braz-pink mx-auto" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-braz-pink rounded-full blur-2xl -z-10"
                />
            </div>

            <h3 className="text-3xl font-montserrat font-bold text-white mb-4 uppercase tracking-tighter">
              Oferta de Boas-Vindas!
            </h3>
            
            <p className="text-white/70 font-montserrat mb-8 leading-relaxed">
              Receba <span className="text-braz-pink font-bold">10% de desconto</span> no seu primeiro tratamento no {BUSINESS_INFO.name} com o código:
            </p>

            {/* Contentor do Código de Desconto */}
            <div className="bg-braz-black border border-dashed border-braz-pink/50 p-4 rounded-lg mb-8 group cursor-pointer hover:border-braz-pink transition-colors">
                <span className="text-2xl font-mono font-black text-braz-pink tracking-[0.3em] uppercase">
                    BRAZ10
                </span>
                <p className="text-[10px] text-white/30 uppercase mt-2 tracking-widest group-hover:text-white/50 transition-colors">
                    Clique para copiar ou use no agendamento
                </p>
            </div>
            
            <button 
                onClick={() => {
                    scrollToSection('agendamento');
                    onClose();
                }}
                className="bg-braz-pink text-braz-black px-8 py-4 text-base font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 w-full shadow-xl shadow-braz-pink/10 active:scale-95"
            >
                Agendar com Desconto
            </button>
            
            <p className="text-[10px] text-white/20 uppercase mt-6 tracking-widest">
                * Válido apenas para novos clientes em serviços selecionados.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoucherPopup;