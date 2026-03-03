import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Euro, ArrowRight, X, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Palette, HeartPulse, Flower2, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SERVICES_CONFIG, BUSINESS_INFO } from '../../utils/constants';

interface ServiceDetail {
    id: string;
    title: string;
    desc: string;
    icon: LucideIcon;
    fullDesc: string;
    subServices: string[];
    duration: string;
    price: string;
    aftercare: string[];
    images: { src: string; label: string }[];
}

const services: ServiceDetail[] = [
    {
        id: 'microblading', title: 'Microblading', icon: Sparkles,
        desc: 'Sobrancelhas naturais e definidas, fio a fio.',
        fullDesc: 'Técnica manual de micropigmentação que cria fios hiper-realistas para preencher, corrigir ou redesenhar as sobrancelhas. O resultado é um olhar harmonioso e natural.',
        subServices: ['Microblading Fio a Fio', 'Design de Sobrancelhas', 'Retoque (após 30 dias)'],
        duration: '2h30', price: '250€',
        aftercare: ['Evitar molhar durante 7 dias', 'Não arrancar as crostas', 'Aplicar pomada cicatrizante'],
        images: [{ src: '/assets/resultados/microb1.jpeg', label: 'Microblading Fio a Fio' }, { src: '/assets/resultados/microb2.jpeg', label: 'Design Natural' }]
    },
    {
        id: 'unhas', title: 'Nail Bar', icon: Palette,
        desc: 'Unhas de Gel, Acrílico, Verniz Gel e Nail Art.',
        fullDesc: 'Serviço completo de manicure com materiais de qualidade profissional. Desde o verniz gel clássico até ao design de unhas artístico e exclusivo.',
        subServices: ['Unhas de Gel', 'Verniz Gel', 'Nail Art', 'Manicure Completa', 'Remoção Segura'],
        duration: '45 a 90 min', price: 'Desde 20€',
        aftercare: ['Evitar exposição química nas primeiras 24h', 'Usar luvas para limpeza', 'Hidratar cutículas'],
        images: [{ src: '/assets/resultados/unhas7.jpeg', label: 'Nail Art' }, { src: '/assets/resultados/unhas10.jpeg', label: 'Gel Premium' }]
    },
    {
        id: 'rosto', title: 'Estética Facial', icon: HeartPulse,
        desc: 'Limpeza de pele profunda e tratamentos de rejuvenescimento.',
        fullDesc: 'Tratamentos faciais personalizados utilizando técnicas avançadas e produtos profissionais para revitalizar, limpar em profundidade e devolver o glow natural à sua pele.',
        subServices: ['Limpeza de Pele Profunda', 'Hidratação Intensiva', 'Peeling Enzimático', 'Máscara LED'],
        duration: '1h30', price: '60€',
        aftercare: ['Evitar sol direto 48h', 'Usar protetor solar SPF50', 'Não aplicar maquilhagem no dia'],
        images: [{ src: '/assets/resultados/rosto.jpeg', label: 'Limpeza Profunda' }]
    },
    {
        id: 'corpo', title: 'Corpo & Relax', icon: Flower2,
        desc: 'Massagens terapêuticas, relaxantes e drenagem linfática.',
        fullDesc: 'Sessões de relaxamento e terapia corporal para aliviar tensão, melhorar a circulação e promover o bem-estar geral. Ambiente tranquilo com aromaterapia.',
        subServices: ['Massagem Relaxante', 'Massagem Terapêutica', 'Drenagem Linfática', 'Massagem com Pedras Quentes'],
        duration: '1h', price: '45€',
        aftercare: ['Beber bastante água', 'Evitar atividade física por 2h', 'Descansar'],
        images: []
    },
    {
        id: 'depilacao', title: 'Depilação', icon: Zap,
        desc: 'Laser, cera e linha para uma pele suave e duradoura.',
        fullDesc: 'Soluções completas de depilação com tecnologia de última geração. Desde a depilação a cera tradicional até ao laser de díodo para resultados permanentes.',
        subServices: ['Depilação a Laser', 'Depilação a Cera', 'Depilação a Linha', 'Meia perna', 'Corpo inteiro'],
        duration: '30 min', price: 'Desde 15€',
        aftercare: ['Evitar sol 48h', 'Hidratar diariamente', 'Não esfoliar por 3 dias'],
        images: [{ src: '/assets/resultados/laser_depilacao.png', label: 'Laser: 1ª Sessão' }]
    }
];

const ServicesPage: React.FC = () => {
    useEffect(() => { document.title = `Serviços | ${BUSINESS_INFO.name}`; }, []);
    const [selected, setSelected] = useState<ServiceDetail | null>(null);
    const [imgIdx, setImgIdx] = useState(0);

    return (
        <>
            {/* Hero */}
            <section className="pt-12 pb-16 bg-gradient-to-b from-[#0A0A0A] to-[#080808]">
                <div className="container mx-auto px-6 text-center">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] mb-3">O Que Fazemos</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Os Nossos Serviços</motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/40 text-sm max-w-lg mx-auto">
                        Cada tratamento é uma experiência personalizada, com produtos premium e atenção ao detalhe.
                    </motion.p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="pb-24 bg-[#080808]">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((s, i) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                onClick={() => { setSelected(s); setImgIdx(0); }}
                                className="group relative bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md rounded-3xl border border-white/5 p-8 cursor-pointer hover:border-braz-gold/40 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(197,160,89,0.1)] transition-all duration-700 overflow-hidden"
                            >
                                {/* Subtle Glow Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-braz-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="relative z-10">
                                    <div className="bg-gradient-to-br from-white/10 to-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-braz-gold/50 group-hover:bg-braz-gold group-hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all duration-500 group-hover:scale-110">
                                        <s.icon size={26} className="text-white/80 group-hover:text-black transition-colors duration-500" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-bold font-montserrat tracking-tight text-white mb-3 group-hover:text-braz-gold transition-colors duration-500 uppercase">{s.title}</h3>
                                    <p className="text-white/50 text-sm mb-6 leading-relaxed font-medium">{s.desc}</p>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {s.subServices.slice(0, 3).map((sub, j) => (
                                            <span key={j} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-white/5 text-white/50 border border-white/5 rounded-full">{sub}</span>
                                        ))}
                                        {s.subServices.length > 3 && <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-braz-gold/5 text-braz-gold border border-braz-gold/20 rounded-full">+{s.subServices.length - 3}</span>}
                                    </div>

                                    <div className="flex items-center justify-between pt-5 border-t border-white/10">
                                        <div className="flex items-center gap-4 text-[11px] text-white/40 uppercase font-black tracking-widest">
                                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-braz-gold" /> {s.duration}</span>
                                            <span className="flex items-center gap-1.5"><Euro size={12} className="text-braz-gold" /> {s.price}</span>
                                        </div>
                                        <ArrowRight size={18} className="text-white/20 group-hover:text-braz-gold group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-20">
                        <Link to="/agendar" className="inline-flex items-center gap-3 bg-braz-gold text-black px-12 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-xl shadow-braz-gold/20">
                            Agendar Agora <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Service Detail Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                        <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()} className="relative bg-[#121212] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 md:p-10 shadow-2xl">

                            <button onClick={() => setSelected(null)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-white bg-white/5 rounded-full backdrop-blur-sm transition-all hover:bg-white/10 z-10"><X size={20} /></button>

                            <div className="flex flex-col md:flex-row items-start gap-6 mb-8 relative z-0">
                                <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center border border-white/5 shrink-0 shadow-lg">
                                    <selected.icon size={30} className="text-braz-gold" strokeWidth={1.5} />
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <h2 className="text-3xl font-black font-montserrat text-white uppercase tracking-tighter mb-2">{selected.title}</h2>
                                    <div className="flex gap-4 text-[11px] text-braz-gold font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="opacity-70" /> {selected.duration}</span>
                                        <span className="flex items-center gap-1.5"><Euro size={14} className="opacity-70" /> {selected.price}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-white/60 text-sm mb-8 leading-relaxed font-medium">{selected.fullDesc}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Sub-services */}
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2"><Sparkles size={12} /> O que inclui</h4>
                                    <div className="flex flex-col gap-3">
                                        {selected.subServices.map((sub, i) => (
                                            <div key={i} className="flex items-start gap-3 text-sm text-white/70 font-medium"><CheckCircle2 size={16} className="text-braz-gold shrink-0 mt-0.5" /> {sub}</div>
                                        ))}
                                    </div>
                                </div>

                                {/* Aftercare */}
                                {selected.aftercare.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2"><Flower2 size={12} /> Cuidados Pós-Tratamento</h4>
                                        <ul className="flex flex-col gap-3">
                                            {selected.aftercare.map((tip, i) => (
                                                <li key={i} className="text-sm text-white/50 flex items-start gap-3 font-medium"><span className="text-braz-gold shrink-0 scale-75 mt-1">•</span> {tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Results Gallery */}
                            {selected.images.length > 0 && (
                                <div className="mb-10">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Galeria de Resultados</h4>
                                    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/5">
                                        <img src={selected.images[imgIdx]?.src} alt={selected.images[imgIdx]?.label} className="w-full h-80 object-cover" />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                                        <p className="absolute bottom-6 left-6 font-bold text-sm tracking-wide text-white drop-shadow-md">{selected.images[imgIdx]?.label}</p>

                                        {selected.images.length > 1 && (
                                            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
                                                <button onClick={(e) => { e.stopPropagation(); setImgIdx(p => (p - 1 + selected.images.length) % selected.images.length); }} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-braz-gold hover:text-black transition-colors border border-white/10"><ChevronLeft size={20} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); setImgIdx(p => (p + 1) % selected.images.length); }} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-braz-gold hover:text-black transition-colors border border-white/10"><ChevronRight size={20} /></button>
                                            </div>
                                        )}
                                        {selected.images.length > 1 && (
                                            <div className="absolute bottom-6 right-6 flex gap-1.5">
                                                {selected.images.map((_, idx) => (
                                                    <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === imgIdx ? 'w-6 bg-braz-gold' : 'w-1.5 bg-white/40'}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Link to="/agendar" className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-braz-gold to-[#e3c178] text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                                <span>Agendar Serviço</span>
                                <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ServicesPage;
