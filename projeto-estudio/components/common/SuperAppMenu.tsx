import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Camera, MapPin } from 'lucide-react';

const menuItems = [
    {
        icon: <Calendar size={24} />,
        label: 'Agendar',
        desc: 'Marque a sua sessão',
        path: '/agendar',
        accent: true,
    },
    {
        icon: <Sparkles size={24} />,
        label: 'Serviços',
        desc: 'Explore os tratamentos',
        path: '/servicos',
    },
    {
        icon: <Camera size={24} />,
        label: 'Resultados',
        desc: 'Antes & Depois',
        path: '/portfolio',
    },
    {
        icon: <MapPin size={24} />,
        label: 'Estúdio',
        desc: 'Contacto & Mapa',
        path: '/contacto',
    },
];

const SuperAppMenu: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto px-4">
            {menuItems.map((item, i) => (
                <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ delay: 2.0 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Link
                        to={item.path}
                        className={`
              relative block p-5 rounded-2xl text-center overflow-hidden
              backdrop-blur-xl border transition-all
              ${item.accent
                                ? 'bg-[#C5A059]/15 border-[#C5A059]/30 shadow-[0_0_20px_rgba(197,160,89,0.1)]'
                                : 'bg-white/[0.03] border-white/[0.06] hover:border-white/10'
                            }
            `}
                    >
                        {/* Glassmorphism shine */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

                        <div className={`
              w-13 h-13 rounded-2xl flex items-center justify-center mx-auto mb-3 border transition-all
              ${item.accent
                                ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/20'
                                : 'bg-[#1A1A1A] text-[#C5A059]/70 border-white/5'
                            }
            `}>
                            {item.icon}
                        </div>

                        <p className={`text-sm font-bold ${item.accent ? 'text-[#C5A059]' : 'text-white'}`}>
                            {item.label}
                        </p>
                        <p className="text-[9px] text-white/30 mt-0.5 tracking-wide">{item.desc}</p>
                    </Link>
                </motion.div>
            ))
            }
        </div >
    );
};

export default SuperAppMenu;
