import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionado
import { Menu, X, Phone, Instagram } from 'lucide-react';
import { scrollToSection } from '../../utils/scroll';
import { BUSINESS_INFO } from '../../utils/constants';

interface NavbarProps {
    onMenuToggle: () => void;
    isMenuOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isMenuOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: 'Serviços', id: 'servicos' },
        { name: 'A Especialista', id: 'especialista' },
        { name: 'Gift Cards', id: 'giftcards' },
    ];

    // Lógica inteligente: Volta à Home se estiver noutra página
    const handleScroll = (id: string) => {
        if (location.pathname !== '/') {
            navigate('/');
            // Pequeno delay para garantir que a página carregou antes de rolar
            setTimeout(() => scrollToSection(id), 100);
        } else {
            scrollToSection(id);
        }
        
        if (isMenuOpen) {
            onMenuToggle();
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-braz-black/95 backdrop-blur-md shadow-lg border-b border-white/10">
            <div className="container mx-auto px-6 h-28 flex items-center justify-between">

                {/* Logo e Nome - Visibilidade Máxima */}
                <button
                    onClick={() => handleScroll('hero')}
                    aria-label={`Voltar ao início de ${BUSINESS_INFO.name}`}
                    className="flex items-center focus-visible:ring-2 focus-visible:ring-braz-pink rounded-md p-1 transition-transform active:scale-95"
                >
                    <img
                        src="/logo.png"
                        alt={`Logótipo ${BUSINESS_INFO.name}`}
                        className="h-20 w-auto object-contain"
                    />
                    <span className="text-2xl font-montserrat font-bold ml-4 text-white uppercase tracking-widest hidden sm:inline">
                        {BUSINESS_INFO.name}
                    </span>
                </button>

                {/* Navegação Desktop */}
                <nav className="hidden lg:flex items-center space-x-10">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleScroll(item.id)}
                            className="text-white/80 font-montserrat uppercase text-sm font-bold tracking-widest hover:text-braz-pink transition-colors relative group outline-none"
                        >
                            {item.name}
                            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-braz-pink transition-all duration-300 group-hover:w-full"></span>
                        </button>
                    ))}

                    <div className="h-8 w-px bg-white/10 mx-2"></div>

                    {/* Instagram Link Corrigido */}
                    <a
                        href={BUSINESS_INFO.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-braz-pink transition-transform hover:scale-110 p-2"
                        aria-label="Instagram Oficial"
                    >
                        <Instagram size={24} />
                    </a>

                    {/* Botão Agendar */}
                    <a
                        href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${BUSINESS_INFO.whatsappMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 bg-braz-pink text-braz-black px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-braz-pink/20"
                    >
                        <Phone className="w-5 h-5" />
                        <span>Agendar</span>
                    </a>
                </nav>

                {/* Botão Menu Mobile */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden text-white p-3 rounded-md hover:bg-white/10 transition-colors"
                >
                    {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>
        </header>
    );
};

export default Navbar;