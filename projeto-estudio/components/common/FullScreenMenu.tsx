import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const navItems = [
    { label: 'Agendar', path: '/agendar', image: '/assets/hero-bg.jpg' },
    { label: 'Serviços', path: '/servicos', image: '/assets/resultados/unhas7.jpeg' },
    { label: 'Portfólio', path: '/portfolio', image: '/assets/resultados/microb1.jpeg' },
    { label: 'Sobre', path: '/sobre', image: '/mariana-specialist.jpg' },
    { label: 'Contacto', path: '/contacto', image: '/assets/resultados/rosto.jpeg' },
    { label: 'FAQ', path: '/faq', image: '/assets/hero-bg.jpg' },
];

interface FullScreenMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const FullScreenMenu: React.FC<FullScreenMenuProps> = ({ isOpen, onClose }) => {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const bgImage = hoveredIdx !== null ? navItems[hoveredIdx].image : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                >
                    {/* Background — changes image on hover */}
                    <div className="absolute inset-0 bg-[#050505]">
                        <AnimatePresence mode="wait">
                            {bgImage && (
                                <motion.img
                                    key={bgImage}
                                    src={bgImage}
                                    alt=""
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 0.15, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    </div>

                    {/* Close Button */}
                    <motion.button
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={onClose}
                        className="absolute top-8 right-8 z-10 p-3 text-white/40 hover:text-[#C5A059] transition-colors"
                    >
                        <X size={28} />
                    </motion.button>

                    {/* Navigation Links */}
                    <nav className="relative z-10 flex flex-col items-center gap-2">
                        {navItems.map((item, i) => (
                            <motion.div
                                key={item.path}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                onMouseEnter={() => setHoveredIdx(i)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            >
                                <Link
                                    to={item.path}
                                    onClick={onClose}
                                    className={`
                    block text-4xl md:text-6xl lg:text-7xl font-black font-montserrat uppercase
                    tracking-tight py-2 transition-all duration-300
                    ${hoveredIdx === i
                                            ? 'text-[#C5A059] translate-x-4'
                                            : hoveredIdx !== null
                                                ? 'text-white/15'
                                                : 'text-white/70 hover:text-[#C5A059]'
                                        }
                  `}
                                >
                                    {item.label}
                                </Link>
                            </motion.div>
                        ))}
                    </nav>

                    {/* Bottom info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute bottom-8 text-center"
                    >
                        <p className="text-white/15 text-[10px] uppercase tracking-[0.4em]">
                            Mariana Braz · Estética & Bem Estar · Águeda
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullScreenMenu;
