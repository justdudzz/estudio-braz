import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Instagram } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';
import MobileMenuDrawer from './MobileMenuDrawer';

interface NavbarProps {
    onMenuToggle?: () => void;
    isMenuOpen?: boolean;
}

const navItems = [
    { name: 'Serviços', path: '/servicos' },
    { name: 'Portfólio', path: '/portfolio' },
    { name: 'Boutique', path: '/boutique' },
    { name: 'Sobre', path: '/sobre' },
    { name: 'Contacto', path: '/contacto' },
];

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isMenuOpen: externalIsMenuOpen }) => {
    const location = useLocation();

    const [internalMenuOpen, setInternalMenuOpen] = useState(false);
    const isMenuOpen = externalIsMenuOpen ?? internalMenuOpen;
    const toggleMenu = onMenuToggle ?? (() => setInternalMenuOpen(prev => !prev));

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 bg-braz-black/80 backdrop-blur-xl shadow-lg border-b border-white/5 transition-all duration-300">
                <div className="container mx-auto px-6 h-28 flex items-center justify-between">

                    {/* Logo acts as a clear Home Button */}
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Link
                            to="/"
                            aria-label={`Voltar ao início de ${BUSINESS_INFO.name}`}
                            className="flex items-center gap-4 focus-visible:ring-1 focus-visible:ring-braz-gold rounded-xl p-2.5 transition-all duration-500 group hover:bg-white/[0.03] border border-transparent hover:border-white/5 hover:shadow-elite-glow cursor-pointer"
                            title="Ir para a Página Inicial"
                        >
                            <img
                                src="/iconelogo.png"
                                alt={`Logótipo ${BUSINESS_INFO.name}`}
                                className="h-16 md:h-20 w-auto object-contain transition-all duration-700 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                            />
                            <span className="text-xl md:text-2xl font-montserrat font-luxury text-white/90 uppercase tracking-[0.2em] hidden sm:block transition-colors duration-500 group-hover:text-braz-gold-light drop-shadow-md">
                                {BUSINESS_INFO.name}
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-10">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <motion.div key={item.path} whileTap={{ scale: 0.9 }}>
                                    <Link
                                        to={item.path}
                                        className={`font-montserrat uppercase text-xs font-bold tracking-[0.2em] transition-all duration-300 relative group outline-none ${isActive ? 'text-braz-gold' : 'text-white/60 hover:text-braz-gold-light'
                                            }`}
                                    >
                                        {item.name}
                                        <span className={`absolute -bottom-2 left-0 h-[1px] bg-braz-gold transition-all duration-500 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                            }`}></span>
                                    </Link>
                                </motion.div>
                            );
                        })}

                        <div className="h-8 w-px bg-white/10 mx-2"></div>

                        <motion.a
                            whileTap={{ scale: 0.9 }}
                            href={BUSINESS_INFO.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-braz-gold transition-all duration-300 p-2"
                            aria-label="Instagram Oficial"
                        >
                            <Instagram size={22} strokeWidth={1.5} />
                        </motion.a>

                        <Link
                            to="/agendar"
                            className={`flex items-center space-x-3 bg-gold-gradient text-braz-black px-8 py-3.5 rounded-sm text-xs font-bold uppercase tracking-[0.25em] hover:brightness-110 hover:shadow-elite-glow transition-all duration-500 ${location.pathname === '/agendar' ? 'bg-white text-black' : ''
                                }`}
                        >
                            <motion.span whileTap={{ scale: 0.98 }}>Agendar</motion.span>
                        </Link>
                    </nav>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? "Fechar Menu" : "Abrir Menu"}
                        className="lg:hidden text-white p-3 rounded-md hover:bg-white/10 transition-colors"
                    >
                        {isMenuOpen ? <X className="w-8 h-8" strokeWidth={1.5} /> : <Menu className="w-8 h-8" strokeWidth={1.5} />}
                    </motion.button>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            <MobileMenuDrawer isOpen={isMenuOpen} onClose={toggleMenu} />
        </>
    );
};

export default Navbar;
