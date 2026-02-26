import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionado
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToSection } from '../../utils/scroll';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Serviços', id: 'servicos' },
    { name: 'A Especialista', id: 'especialista' },
    { name: 'Gift Cards', id: 'giftcards' },
    { name: 'Contacto', id: 'agendamento' },
  ];

  const handleScroll = (id: string) => {
    if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => scrollToSection(id), 100);
    } else {
        scrollToSection(id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-64 bg-[#171717] shadow-2xl p-6"
          >
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <span className="text-xl font-bold text-braz-pink uppercase tracking-widest font-montserrat">Menu</span>
              <button onClick={onClose} aria-label="Fechar Menu" className="text-white hover:text-braz-pink transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScroll(item.id)}
                  className="text-white text-lg font-montserrat hover:text-braz-pink text-left transition-colors focus:outline-none focus:ring-2 focus:ring-braz-pink rounded-md p-1 uppercase tracking-wider"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuDrawer;