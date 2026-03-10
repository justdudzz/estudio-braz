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
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto px-4">
            {menuItems.map((item, i) => (
                <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ y: -5, transition: { duration: 0.3 } }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ 
                        delay: 1.8 + i * 0.12, 
                        duration: 0.8, 
                        ease: [0.22, 1, 0.36, 1] 
                    }}
                    className="h-full"
                >
                    <Link
                        to={item.path}
                        className={`
                            relative h-full block p-6 rounded-[2rem] text-center overflow-hidden
                            backdrop-blur-2xl border transition-all duration-500 group
                            ${item.accent
                                ? 'bg-[#C5A059]/10 border-[#C5A059]/30 shadow-[0_10px_30px_rgba(197,160,89,0.1)] hover:shadow-[0_15px_40px_rgba(197,160,89,0.2)]'
                                : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05]'
                            }
                        `}
                    >
                        {/* Dynamic Gradient Shine */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border transition-all duration-500
                            group-hover:scale-110 group-active:scale-95
                            ${item.accent
                                ? 'bg-gradient-to-br from-[#C5A059] to-[#e3c178] text-black border-transparent shadow-[0_5px_15px_rgba(197,160,89,0.4)]'
                                : 'bg-white/5 text-[#C5A059] border-white/5 group-hover:border-[#C5A059]/30 group-hover:bg-[#C5A059]/5'
                            }
                        `}>
                            {item.icon}
                        </div>

                        <div className="relative z-10">
                            <p className={`text-sm font-black uppercase tracking-widest ${item.accent ? 'text-white' : 'text-white/90'}`}>
                                {item.label}
                            </p>
                            <p className="text-[9px] text-white/30 mt-1 font-bold uppercase tracking-[0.1em] transition-colors group-hover:text-white/50">{item.desc}</p>
                        </div>

                        {/* Hover Border Glow */}
                        <div className="absolute inset-0 border border-[#C5A059]/0 group-hover:border-[#C5A059]/20 rounded-[2rem] transition-colors duration-500 pointer-events-none" />
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};

export default SuperAppMenu;
