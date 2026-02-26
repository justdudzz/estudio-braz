import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BUSINESS_INFO } from '../../utils/constants'; // Importação centralizada

const WhatsAppButton: React.FC = () => {
  /**
   * 1. Centralização de Dados: 
   * Removido o número fixo (hardcoded) para utilizar a fonte da verdade em constants.ts.
   */
  const handleClick = () => {
    // Utilizamos a mensagem padrão definida nas configurações
    const url = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${BUSINESS_INFO.whatsappMsg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 1.5 // Atraso ligeiro para não distrair do Hero inicial
      }}
      aria-label="Contactar via WhatsApp"
      className="fixed bottom-6 right-6 z-40 p-4 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50"
    >
      <MessageCircle size={32} />
    </motion.button>
  );
};

export default WhatsAppButton;