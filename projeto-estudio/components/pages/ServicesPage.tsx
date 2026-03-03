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
                                className="bg-[#121212] rounded-2xl border border-white/5 p-8 cursor-pointer hover:border-[#C5A059]/30 hover:shadow-[0_0_30px_rgba(197,160,89,0.05)] transition-all group"
                            >
                                <div className="w-14 h-14 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mb-5 border border-white/5 group-hover:border-[#C5A059]/30 group-hover:bg-[#C5A059]/10 transition-all">
                                    <s.icon size={26} className="text-[#C5A059]" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#C5A059] transition-colors">{s.title}</h3>
                                <p className="text-white/40 text-sm mb-6 leading-relaxed">{s.desc}</p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {s.subServices.slice(0, 3).map((sub, j) => (
                                        <span key={j} className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white/5 text-white/40 rounded-full">{sub}</span>
                                    ))}
                                    {s.subServices.length > 3 && <span className="text-[9px] font-bold text-[#C5A059]/60">+{s.subServices.length - 3}</span>}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-4 text-[10px] text-white/30 uppercase font-bold tracking-wider">
                                        <span className="flex items-center gap-1"><Clock size={10} /> {s.duration}</span>
                                        <span className="flex items-center gap-1"><Euro size={10} /> {s.price}</span>
                                    </div>
                                    <ArrowRight size={16} className="text-white/10 group-hover:text-[#C5A059] transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <Link to="/agendar" className="inline-flex items-center gap-3 bg-[#C5A059] text-black px-10 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-lg shadow-[#C5A059]/20">
                            Agendar Agora <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Service Detail Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()} className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#1A1A1A] rounded-2xl flex items-center justify-center border border-[#C5A059]/20 shrink-0">
                                        <selected.icon size={22} className="text-[#C5A059]" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="text-2xl font-black text-white uppercase">{selected.title}</h2>
                                </div>
                                <button onClick={() => setSelected(null)} className="p-2 text-white/30 hover:text-white"><X size={20} /></button>
                            </div>

                            <p className="text-white/60 text-sm mb-6 leading-relaxed">{selected.fullDesc}</p>

                            <div className="flex gap-4 mb-6 text-xs text-white/40 font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg"><Clock size={12} /> {selected.duration}</span>
                                <span className="flex items-center gap-1.5 bg-[#C5A059]/10 text-[#C5A059] px-3 py-1.5 rounded-lg"><Euro size={12} /> {selected.price}</span>
                            </div>

                            {/* Sub-services */}
                            <div className="mb-6">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Inclui</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {selected.subServices.map((sub, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-white/60"><CheckCircle2 size={12} className="text-[#C5A059] shrink-0" /> {sub}</div>
                                    ))}
                                </div>
                            </div>

                            {/* Aftercare */}
                            {selected.aftercare.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Cuidados Pós-Tratamento</h4>
                                    <ul className="space-y-1.5">
                                        {selected.aftercare.map((tip, i) => (
                                            <li key={i} className="text-sm text-white/40 flex items-start gap-2"><span className="text-[#C5A059] mt-1">•</span> {tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Results Gallery */}
                            {selected.images.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Resultados</h4>
                                    <div className="relative rounded-xl overflow-hidden">
                                        <img src={selected.images[imgIdx]?.src} alt={selected.images[imgIdx]?.label} className="w-full h-64 object-cover" />
                                        <p className="absolute bottom-0 inset-x-0 bg-black/60 text-center text-xs text-white/70 py-2">{selected.images[imgIdx]?.label}</p>
                                        {selected.images.length > 1 && (
                                            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2">
                                                <button onClick={() => setImgIdx(p => (p - 1 + selected.images.length) % selected.images.length)} className="p-2 bg-black/40 rounded-full text-white"><ChevronLeft size={16} /></button>
                                                <button onClick={() => setImgIdx(p => (p + 1) % selected.images.length)} className="p-2 bg-black/40 rounded-full text-white"><ChevronRight size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Link to="/agendar" className="block text-center bg-[#C5A059] text-black py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all">
                                Agendar Este Serviço
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ServicesPage;
