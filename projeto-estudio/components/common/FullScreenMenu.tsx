import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface NavItem {
    label: string;
    path: string;
    image: string;
}

const navItems: NavItem[] = [
    { label: 'Agendar', path: '/agendar', image: '/menu-bg-agendar.png' },
    { label: 'Serviços', path: '/servicos', image: '/menu-bg-servicos.png' },
    { label: 'Portfólio', path: '/portfolio', image: '/menu-bg-portfolio.png' },
    { label: 'Sobre', path: '/sobre', image: '/menu-bg-sobre.png' },
    { label: 'Contacto', path: '/contacto', image: '/menu-bg-contacto.png' },
    { label: 'FAQ', path: '/faq', image: '/menu-bg-faq.png' },
];

interface FullScreenMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const FullScreenMenu: React.FC<FullScreenMenuProps> = ({ isOpen, onClose }) => {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const menuContent = (
        <div
            id="fullscreen-menu-root"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 999990,
                backgroundColor: '#050505',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'none'
            }}
        >
            {/* Background Images — all preloaded, controlled by opacity */}
            {navItems.map((item, i) => (
                <div
                    key={item.path}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        pointerEvents: 'none',
                        opacity: hoveredIdx === i ? 0.15 : 0,
                        transition: 'opacity 0.6s ease',
                    }}
                >
                    <img
                        src={item.image}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px)' }}
                    />
                </div>
            ))}

            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '40px',
                    right: '40px',
                    zIndex: 999992,
                    padding: '16px',
                    color: 'rgba(255,255,255,0.5)',
                    background: 'none',
                    border: 'none',
                    cursor: 'none',
                    outline: 'none',
                    transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C5A059')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                aria-label="Fechar menu"
            >
                <X size={36} />
            </button>

            {/* Navigation Links */}
            <nav style={{
                position: 'relative',
                zIndex: 999991,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '0 24px',
            }}>
                {navItems.map((item, i) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'center',
                            color: hoveredIdx === i ? '#C5A059' : hoveredIdx !== null ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.85)',
                            fontSize: 'clamp(2.2rem, 8vw, 5.5rem)',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                            transform: hoveredIdx === i ? 'scale(1.05) translateX(8px)' : 'scale(1)',
                            letterSpacing: '-0.03em',
                            fontFamily: 'Montserrat, sans-serif',
                            lineHeight: 1.15,
                            cursor: 'none',
                        }}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Branding */}
            <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center', zIndex: 999991 }}>
                <p style={{
                    color: hoveredIdx !== null ? 'rgba(197, 160, 89, 0.3)' : 'rgba(255,255,255,0.15)',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6em',
                    fontWeight: 'bold',
                    transition: 'color 0.4s ease',
                }}>
                    {hoveredIdx !== null ? `Explorar ${navItems[hoveredIdx].label}` : 'Mariana Braz · Estética & Bem Estar'}
                </p>
            </div>
        </div>
    );

    return createPortal(menuContent, document.body);
};

export default FullScreenMenu;
