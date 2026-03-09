import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Award, Heart, Sparkles } from 'lucide-react';
import OptimizedImage from '../common/OptimizedImage';
import { BUSINESS_INFO } from '../../utils/constants';

// Certificações reais da Mariana (a confirmar nomes exatos)
const certifications = [
    'Esteticista — Formação Profissional Certificada',
    'Cosmetologista — Formação Especializada',
    'Auxiliar de Fisioterapia — Certificação Profissional',
    '12 Cursos na Área de Beleza e Estética',
    '8 Anos de Experiência Profissional',
];

const values = [
    { icon: <Sparkles size={20} strokeWidth={1.5} />, title: 'Excelência', desc: 'Cada detalhe importa. Usamos apenas produtos premium de referência internacional.' },
    { icon: <Heart size={20} strokeWidth={1.5} />, title: 'Cuidado', desc: 'Tratamento personalizado e humanizado. Cada cliente é única.' },
    { icon: <Award size={20} strokeWidth={1.5} />, title: 'Formação', desc: 'Atualização constante com as melhores técnicas e tendências do mercado.' },
];

const AboutPage: React.FC = () => {
    useEffect(() => { document.title = `Sobre Nós | ${BUSINESS_INFO.name}`; }, []);

    return (
        <>
            {/* Hero */}
            <section className="pt-24 pb-20 bg-gradient-to-b from-braz-black to-[#050505]">
                <div className="container mx-auto px-6 text-center">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-braz-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">A Nossa História</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-montserrat font-black text-white uppercase tracking-tighter mb-8">O Estúdio</motion.h1>
                    <div className="w-12 h-1 bg-braz-gold mx-auto mb-8 rounded-full" />
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/50 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
                        Muito mais do que um espaço de estética. Um refúgio dedicado à revelação da sua beleza mais autêntica e confiante.
                    </motion.p>
                </div>
            </section>

            {/* Specialist Section */}
            <section className="py-24 bg-[#050505] relative overflow-hidden">
                {/* Subtle light leak */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-braz-gold/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2 flex justify-center">
                            <div className="relative rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(197,160,89,0.15)] border border-white/5 w-full max-w-lg mx-auto group">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
                                <OptimizedImage src="/mariana-specialist.jpg" alt={BUSINESS_INFO.owner} className="w-full h-auto object-cover block grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent h-32 z-20" />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2 space-y-8">
                            <div>
                                <p className="text-braz-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">A Especialista</p>
                                <h2 className="text-4xl md:text-5xl font-montserrat font-black text-white uppercase tracking-tighter mb-6">Mariana Braz</h2>
                                <div className="w-16 h-1 bg-gradient-to-r from-braz-gold to-transparent" />
                            </div>

                            <div className="space-y-6 text-white/60 text-sm md:text-base leading-loose font-medium">
                                <p>
                                    Sou a Mariana, tenho 27 anos e já trabalho no mundo da beleza há 8 anos. Com 12 cursos realizados em estética, cosmetologia e auxiliar de fisioterapia, o meu compromisso é elevar a sua confiança com excelência.
                                </p>
                                <p>
                                    No Studio Braz, cada tratamento é pensado para cuidar da sua autoestima — por dentro e por fora. Gosto de fazer com que cada cliente saia daqui a sentir-se a melhor versão de si.
                                </p>
                                <p className="text-white/40 italic">
                                    "A beleza começa no momento em que decides ser tu mesma. Eu estou aqui para realçar o que já és."
                                </p>
                            </div>

                            <motion.div whileTap={{ scale: 0.98 }} className="pt-4">
                                <Link to="/agendar" className="inline-flex items-center gap-4 bg-gradient-to-r from-braz-gold to-[#e3c178] text-black px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-[0_0_40px_rgba(197,160,89,0.3)] hover:scale-105">
                                    <span>Agendar com a Mariana</span>
                                    <ArrowRight size={16} strokeWidth={1.5} />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-32 bg-gradient-to-b from-[#050505] to-[#0A0A0A] border-y border-white/5 relative">
                <div className="container mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
                        <p className="text-braz-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">A Nossa Essência</p>
                        <h2 className="text-4xl font-montserrat font-black text-white uppercase tracking-tighter">A Filosofia Studio Braz</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((v, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                                className="bg-[#121212]/80 backdrop-blur-xl p-10 md:p-12 rounded-[2rem] border border-white/5 text-center group hover:border-braz-gold/20 hover:bg-[#151515] transition-all duration-500 shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-braz-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="w-16 h-16 bg-gradient-to-br from-braz-gold/20 to-transparent shadow-[0_0_20px_rgba(197,160,89,0.1)] rounded-2xl flex items-center justify-center text-braz-gold mx-auto mb-8 relative z-10 border border-braz-gold/30 group-hover:scale-110 transition-transform duration-500">
                                    {v.icon}
                                </div>
                                <h3 className="text-xl font-montserrat font-black text-white mb-4 uppercase tracking-widest relative z-10">{v.title}</h3>
                                <p className="text-white/50 text-sm leading-loose font-medium relative z-10 group-hover:text-white/70 transition-colors">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="py-24 bg-[#0A0A0A] relative">
                <div className="container mx-auto px-6 max-w-3xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <h2 className="text-3xl font-montserrat font-black text-white uppercase tracking-tighter mb-4">Certificações e Formação</h2>
                        <p className="text-braz-gold text-[10px] uppercase font-black tracking-[0.3em]">Garantia de Qualidade</p>
                    </motion.div>

                    <div className="space-y-4">
                        {certifications.map((cert, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                whileTap={{ scale: 0.98, x: 5 }}
                                className="flex items-center gap-6 bg-[#121212]/50 p-6 md:p-8 rounded-[1.5rem] border border-white/5 hover:border-braz-gold/20 hover:bg-[#151515] transition-all duration-300 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-braz-gold/10 to-transparent flex items-center justify-center text-braz-gold shrink-0 border border-braz-gold/20 shadow-md">
                                    <CheckCircle2 size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-sm md:text-base text-white/80 font-medium tracking-wide group-hover:text-white transition-colors">{cert}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default AboutPage;
