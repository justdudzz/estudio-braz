import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Início', path: '/' },
  { name: 'Serviços', path: '/servicos' },
  { name: 'Portfólio', path: '/portfolio' },
  { name: 'Sobre', path: '/sobre' },
  { name: 'Contacto', path: '/contacto' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Cartões Presente', path: '/cartoes-presente' },
];

const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

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
            className="fixed top-0 right-0 h-full w-72 bg-[#171717] shadow-2xl p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <span className="text-xl font-bold text-braz-pink uppercase tracking-widest font-montserrat">Menu</span>
              <button onClick={onClose} aria-label="Fechar Menu" className="text-white hover:text-braz-pink transition-colors">
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col space-y-1 flex-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`text-lg font-montserrat text-left transition-all p-3 rounded-xl uppercase tracking-wider ${isActive
                        ? 'text-braz-pink bg-braz-pink/10 font-bold'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Agendar CTA */}
            <Link
              to="/agendar"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-braz-pink text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-white transition-all mt-4"
            >
              Agendar <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuDrawer;