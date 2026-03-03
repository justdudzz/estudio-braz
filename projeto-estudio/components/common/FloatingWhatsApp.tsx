import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';

const FloatingWhatsApp: React.FC = () => {
    const url = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${BUSINESS_INFO.whatsappMsg}`;

    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 active:scale-90 transition-transform"
            aria-label="Contactar via WhatsApp"
        >
            <MessageCircle size={24} className="text-white" />

            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
        </motion.a>
    );
};

export default FloatingWhatsApp;
