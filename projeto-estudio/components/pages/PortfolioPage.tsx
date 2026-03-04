import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';

interface PortfolioItem {
    src: string;
    label: string;
    category: string;
}

const portfolioItems: PortfolioItem[] = [
    { src: '/assets/resultados/microb1.jpeg', label: 'Microblading Fio a Fio', category: 'Sobrancelhas' },
    { src: '/assets/resultados/microb2.jpeg', label: 'Design Natural', category: 'Sobrancelhas' },
    { src: '/assets/resultados/unhas7.jpeg', label: 'Nail Art Exclusiva', category: 'Unhas' },
    { src: '/assets/resultados/unhas10.jpeg', label: 'Gel Premium', category: 'Unhas' },
    { src: '/assets/resultados/unhas11.jpeg', label: 'Verniz Gel Clássico', category: 'Unhas' },
    { src: '/assets/resultados/rosto.jpeg', label: 'Limpeza Profunda', category: 'Rosto' },
    { src: '/assets/resultados/laser_depilacao.png', label: 'Laser: 1ª Sessão', category: 'Depilação' },
    { src: '/assets/resultados/smooth_legs.png', label: 'Pele Suave', category: 'Depilação' },
];

const categories = ['Todos', ...Array.from(new Set(portfolioItems.map(i => i.category)))];

const PortfolioPage: React.FC = () => {
    useEffect(() => { document.title = `Portfólio | ${BUSINESS_INFO.name}`; }, []);
    const [filter, setFilter] = useState('Todos');
    const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);

    const filtered = filter === 'Todos' ? portfolioItems : portfolioItems.filter(i => i.category === filter);

    return (
        <>
            {/* Hero */}
            <section className="pt-20 pb-20 bg-gradient-to-b from-braz-black to-[#050505]">
                <div className="container mx-auto px-6 text-center">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-braz-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">A Nossa Arte</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-montserrat font-black text-white uppercase tracking-tighter mb-6">Portfólio</motion.h1>
                    <div className="w-12 h-1 bg-braz-gold mx-auto mb-8 rounded-full" />
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/50 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
                        Cada imagem reflete o nosso compromisso com a excelência técnica e a beleza autêntica. Veja os resultados reais das nossas transformações.
                    </motion.p>
                </div>
            </section>

            {/* Filter + Gallery */}
            <section className="pb-32 bg-[#050505] min-h-[50vh]">
                <div className="container mx-auto px-6">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
                        <Filter size={16} strokeWidth={1.5} className="text-braz-gold mr-2 opacity-50 hidden sm:block" />
                        {categories.map(cat => (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 overflow-hidden relative group`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r from-braz-gold/20 to-transparent transition-opacity duration-500 ${filter === cat ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                <span className={`relative z-10 ${filter === cat ? 'text-braz-gold drop-shadow-md' : 'text-white/40 group-hover:text-white'}`}>{cat}</span>
                                <div className={`absolute inset-0 border rounded-xl transition-colors duration-500 ${filter === cat ? 'border-braz-gold/50 shadow-[0_0_15px_rgba(197,160,89,0.15)]' : 'border-white/5 group-hover:border-white/20'}`} />
                            </motion.button>
                        ))}
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((item, i) => (
                                <motion.div
                                    key={item.src}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                    onClick={() => setLightbox(item)}
                                    className="relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-white/5"
                                    style={{ transform: 'translateZ(0)' }}
                                >
                                    {/* Black and white to color effect on hover */}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none" />
                                    <img src={item.src} alt={item.label} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out" />

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700 z-20" />

                                    {/* Content */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-30">
                                        <div className="overflow-hidden mb-2">
                                            <p className="text-braz-gold text-[9px] font-black uppercase tracking-[0.2em] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">{item.category}</p>
                                        </div>
                                        <p className="text-white text-lg font-bold font-montserrat tracking-tight opacity-90 group-hover:opacity-100">{item.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filtered.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
                            <Filter size={48} className="text-white/10 mb-6" />
                            <p className="text-center text-white/30 font-medium tracking-wide">Nenhum resultado nesta categoria de obra de arte.</p>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8" onClick={() => setLightbox(null)}>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setLightbox(null)}
                            className="absolute top-6 right-6 md:top-10 md:right-10 p-4 text-white/50 hover:text-white bg-white/5 rounded-full backdrop-blur-md transition-all hover:bg-white/10 hover:scale-110 z-10 border border-white/10 flex items-center justify-center min-w-[48px] min-h-[48px]"
                        >
                            <X size={24} strokeWidth={1.5} />
                        </motion.button>

                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", damping: 25 }} onClick={e => e.stopPropagation()} className="max-w-5xl w-full mx-auto relative group">
                            <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10">
                                <img src={lightbox.src} alt={lightbox.label} className="w-full max-h-[80vh] object-contain bg-[#050505]" />

                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-8 md:p-12 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div>
                                            <p className="text-braz-gold text-[10px] uppercase font-black tracking-[0.3em] mb-2">{lightbox.category}</p>
                                            <p className="text-white text-2xl md:text-3xl font-montserrat font-black uppercase tracking-tight">{lightbox.label}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PortfolioPage;
