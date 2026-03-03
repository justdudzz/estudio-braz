import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Award, Heart, Sparkles } from 'lucide-react';
import OptimizedImage from '../common/OptimizedImage';
import { BUSINESS_INFO } from '../../utils/constants';

const certifications = [
    'Micropigmentação Estética — Certificação Internacional',
    'Design de Sobrancelhas — Phibrows Academy',
    'Estética Facial Avançada — Formação Contínua',
    'Nail Design Profissional — Certificação Nacional',
    'Massagem Terapêutica e Relaxante',
];

const values = [
    { icon: <Sparkles size={20} />, title: 'Excelência', desc: 'Cada detalhe importa. Usamos apenas produtos premium de referência internacional.' },
    { icon: <Heart size={20} />, title: 'Cuidado', desc: 'Tratamento personalizado e humanizado. Cada cliente é única.' },
    { icon: <Award size={20} />, title: 'Formação', desc: 'Atualização constante com as melhores técnicas e tendências do mercado.' },
];

const AboutPage: React.FC = () => {
    useEffect(() => { document.title = `Sobre Nós | ${BUSINESS_INFO.name}`; }, []);

    return (
        <>
            {/* Hero */}
            <section className="pt-12 pb-16 bg-gradient-to-b from-[#0A0A0A] to-[#080808]">
                <div className="container mx-auto px-6 text-center">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] mb-3">Conheça-nos</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">O Estúdio</motion.h1>
                </div>
            </section>

            {/* Specialist Section */}
            <section className="py-20 bg-[#080808]">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-1/2 flex justify-center">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C5A059]/20 w-full max-w-md mx-auto">
                                <OptimizedImage src="/mariana-specialist.jpg" alt={BUSINESS_INFO.owner} className="w-full h-auto object-cover block" />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-1/2 space-y-6">
                            <p className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em]">A Especialista</p>
                            <h2 className="text-3xl font-black text-white uppercase">{BUSINESS_INFO.owner}</h2>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Com anos de experiência dedicados à estética avançada, a Mariana transformou o Studio Braz num dos espaços de referência em Águeda.
                                A sua paixão pelo detalhe e o compromisso com resultados naturais e duradouros fazem do Studio Braz uma experiência que vai além de um simples tratamento.
                            </p>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Cada sessão é pensada individualmente, respeitando as características únicas de cada cliente. A filosofia é clara: beleza autêntica, conforto total, e excelência em cada gesto.
                            </p>
                            <Link to="/agendar" className="inline-flex items-center gap-2 text-[#C5A059] text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">
                                Agendar com a Mariana <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-[#0A0A0A]">
                <div className="container mx-auto px-6">
                    <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl font-black text-white uppercase tracking-tight text-center mb-12">A Nossa Filosofia</motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {values.map((v, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="bg-[#121212] p-8 rounded-2xl border border-white/5 text-center">
                                <div className="w-12 h-12 bg-[#C5A059]/10 rounded-xl flex items-center justify-center text-[#C5A059] mx-auto mb-4">{v.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="py-20 bg-[#080808]">
                <div className="container mx-auto px-6 max-w-2xl">
                    <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl font-black text-white uppercase tracking-tight text-center mb-10">Certificações & Formação</motion.h2>
                    <div className="space-y-3">
                        {certifications.map((cert, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                className="flex items-center gap-3 bg-[#121212] p-4 rounded-xl border border-white/5">
                                <CheckCircle2 size={16} className="text-[#C5A059] shrink-0" />
                                <span className="text-sm text-white/70">{cert}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default AboutPage;
