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
            <section className="pt-12 pb-16 bg-gradient-to-b from-[#0A0A0A] to-[#080808]">
                <div className="container mx-auto px-6 text-center">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] mb-3">Resultados Reais</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Portfólio</motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/40 text-sm max-w-lg mx-auto">
                        Cada imagem reflete o nosso compromisso com a excelência. Veja os resultados reais dos nossos tratamentos.
                    </motion.p>
                </div>
            </section>

            {/* Filter + Gallery */}
            <section className="pb-24 bg-[#080808]">
                <div className="container mx-auto px-6">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                        <Filter size={14} className="text-white/20 mr-2" />
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${filter === cat ? 'border-[#C5A059]/50 bg-[#C5A059]/10 text-[#C5A059]' : 'border-white/5 text-white/30 hover:text-white/60'
                                    }`}>{cat}</button>
                        ))}
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((item, i) => (
                                <motion.div
                                    key={item.src}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setLightbox(item)}
                                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                                >
                                    <img src={item.src} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <div>
                                            <p className="text-white text-xs font-bold">{item.label}</p>
                                            <p className="text-[#C5A059] text-[9px] uppercase tracking-wider">{item.category}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filtered.length === 0 && (
                        <p className="text-center text-white/20 py-16">Nenhum resultado nesta categoria.</p>
                    )}
                </div>
            </section>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
                        <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-white z-10"><X size={24} /></button>
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={e => e.stopPropagation()} className="max-w-3xl w-full">
                            <img src={lightbox.src} alt={lightbox.label} className="w-full rounded-2xl shadow-2xl" />
                            <div className="text-center mt-4">
                                <p className="text-white font-bold">{lightbox.label}</p>
                                <p className="text-[#C5A059] text-xs uppercase tracking-widest">{lightbox.category}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PortfolioPage;
