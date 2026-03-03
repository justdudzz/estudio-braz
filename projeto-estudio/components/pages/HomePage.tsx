import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Euro, Star, Quote, Sparkles, Palette, HeartPulse } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LocationMap from '../sections/LocationMap';
import ImmersiveHero from '../sections/ImmersiveHero';
import SuperAppMenu from '../common/SuperAppMenu';
import FullScreenMenu from '../common/FullScreenMenu';
import StatsBar from '../sections/StatsBar';
import TestimonialCarousel from '../sections/TestimonialCarousel';
import { SERVICES_CONFIG, BUSINESS_INFO } from '../../utils/constants';

const serviceHighlights: { key: string; icon: LucideIcon; desc: string }[] = [
    { key: 'Microblading', icon: Sparkles, desc: 'Sobrancelhas naturais e definidas, fio a fio.' },
    { key: 'Limpeza de Pele', icon: HeartPulse, desc: 'Pele radiante, limpa e rejuvenescida.' },
    { key: 'Unhas de Gel', icon: Palette, desc: 'Design exclusivo com durabilidade premium.' },
];

const HomePage: React.FC = () => {
    useEffect(() => { document.title = `${BUSINESS_INFO.name} | Estética Avançada em Águeda`; }, []);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            {/* ===== IMMERSIVE HERO ===== */}
            <ImmersiveHero>
                <div className="flex flex-col items-center text-center px-6">

                    {/* Logo — simple entrance */}
                    <motion.img
                        src="/iconelogo.png"
                        alt="Mariana Braz — Estética & Bem Estar"
                        initial={{ opacity: 0, scale: 0.6, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="h-28 md:h-44 lg:h-52 w-auto object-contain mb-6 drop-shadow-[0_0_50px_rgba(197,160,89,0.15)]"
                    />

                    {/* Gold line */}
                    <motion.div
                        className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mb-5"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                    />

                    {/* Central Question */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-sm md:text-lg text-white/50 font-light tracking-[0.25em] uppercase font-montserrat mb-10 max-w-lg"
                    >
                        Qual é o seu{' '}
                        <span className="text-[#C5A059] font-medium">desejo de beleza</span>{' '}
                        hoje?
                    </motion.p>

                    {/* ===== MOBILE: Super-App Grid ===== */}
                    <div className="lg:hidden w-full">
                        <SuperAppMenu />
                    </div>

                    {/* ===== DESKTOP: Dual CTA + Menu Trigger ===== */}
                    <div className="hidden lg:flex flex-col items-center gap-6">
                        {/* Primary CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center gap-6"
                        >
                            <Link
                                to="/agendar"
                                className="relative group bg-gold-gradient text-braz-black h-14 w-52 flex items-center justify-center text-sm font-bold font-montserrat uppercase tracking-[0.25em] overflow-hidden rounded-sm transition-all duration-500 shadow-elite-glow hover:shadow-elite-glow-hover active:scale-95"
                            >
                                <span className="relative z-10 flex items-center gap-3">Agendar <ArrowRight size={14} /></span>
                                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[45deg] group-hover:left-[200%] transition-all duration-1000" />
                            </Link>

                            <button
                                onClick={() => setMenuOpen(true)}
                                className="relative overflow-hidden text-white/50 text-sm font-bold uppercase tracking-[0.25em] hover:text-braz-gold transition-colors block h-14 w-52 border border-white/10 rounded-sm hover:border-braz-gold/40 hover:bg-white/[0.02] active:scale-95 duration-500 flex items-center justify-center"
                            >
                                Explorar
                            </button>
                        </motion.div>

                        {/* Trust badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            className="flex items-center gap-3"
                        >
                            <span className="text-[9px] text-white/20 uppercase tracking-widest flex items-center gap-1.5 h-full">
                                <span className="w-1 h-1 rounded-full bg-[#C5A059] animate-pulse" /> Certificada
                            </span>
                            <span className="text-white/10 flex items-center h-full">·</span>
                            <span className="text-[9px] text-white/20 uppercase tracking-widest flex items-center gap-1.5 h-full">
                                <span className="text-[#C5A059]">★</span> 4.8 estrelas GOOGLE
                            </span>
                            <span className="text-white/10 flex items-center h-full">·</span>
                            <span className="text-[9px] text-white/20 uppercase tracking-widest flex items-center h-full">Águeda</span>
                        </motion.div>
                    </div>
                </div>
            </ImmersiveHero>

            {/* Desktop Full-Screen Menu */}
            <FullScreenMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

            {/* ===== STATS ===== */}
            <StatsBar />

            {/* ===== SERVICES PREVIEW ===== */}
            <section className="py-20 bg-[#080808]">
                <div className="container mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                        <p className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] mb-3">Experiências</p>
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Os Nossos Serviços</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {serviceHighlights.map((s, i) => {
                            const config = SERVICES_CONFIG[s.key as keyof typeof SERVICES_CONFIG];
                            return (
                                <Link to="/servicos" key={s.key}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                        className="bg-black/40 backdrop-blur-md rounded-md border border-white/5 p-10 hover:border-braz-gold/30 hover:shadow-elite-glow hover:-translate-y-2 transition-all duration-500 group h-full relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" />
                                        <div className="w-14 h-14 bg-white/[0.02] rounded-sm flex items-center justify-center mb-6 border border-white/5 group-hover:border-braz-gold/40 group-hover:bg-braz-gold/10 transition-all duration-500">
                                            <s.icon size={26} className="text-braz-gold-light" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#C5A059] transition-colors">{config.label}</h3>
                                        <p className="text-white/40 text-sm mb-6 leading-relaxed">{s.desc}</p>
                                        <div className="flex items-center gap-4 text-[10px] text-white/30 uppercase font-bold tracking-wider">
                                            <span className="flex items-center gap-1"><Clock size={10} /> {config.duration} min</span>
                                            <span className="flex items-center gap-1"><Euro size={10} /> {config.price}€</span>
                                        </div>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="text-center">
                        <Link to="/servicos" className="inline-flex items-center gap-2 text-[#C5A059] text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">
                            Ver Todos os Serviços <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== SPECIALIST PREVIEW ===== */}
            <section className="py-20 bg-[#0A0A0A]">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl mx-auto">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="w-full md:w-1/3">
                            <div className="rounded-sm overflow-hidden border border-white/10 shadow-2xl relative group">
                                <div className="absolute inset-0 bg-gold-gradient mix-blend-overlay opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />
                                <img src="/mariana-specialist.jpg" alt={BUSINESS_INFO.owner} className="w-full h-auto object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-2/3 text-center md:text-left">
                            <p className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] mb-3">A Especialista</p>
                            <h2 className="text-2xl font-black text-white uppercase mb-4">{BUSINESS_INFO.owner}</h2>
                            <p className="text-white/40 text-sm leading-relaxed mb-6">
                                Com anos de dedicação à estética avançada, a Mariana criou no Studio Braz um espaço onde cada tratamento é uma experiência personalizada, com produtos premium e atenção a cada detalhe.
                            </p>
                            <Link to="/sobre" className="inline-flex items-center gap-2 text-[#C5A059] text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">
                                Conhecer o Estúdio <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS CAROUSEL ===== */}
            <TestimonialCarousel />

            {/* ===== GOOGLE MAPS ===== */}
            <LocationMap />
        </>
    );
};

export default HomePage;
