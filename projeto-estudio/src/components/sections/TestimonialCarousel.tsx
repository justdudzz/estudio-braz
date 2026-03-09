import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
    { quote: 'A limpeza de pele foi espetacular, os produtos são premium. Apenas achei a marquesa um pouco dura, mas recomendo a 100%.', name: 'Margarida C.', service: 'Limpeza de Pele', stars: 4 },
    { quote: 'O microblading ficou incrivelmente natural. A Mariana tem uma mão excelente e percebe exatamente o que o cliente quer.', name: 'Catarina V.', service: 'Microblading', stars: 5 },
    { quote: 'Espaço fantástico e equipa super profissional. O gel nas unhas dura imenso. Só é preciso marcar com bastante antecedência!', name: 'Inês L.', service: 'Unhas de Gel', stars: 4 },
    { quote: 'Fiz lifting de pestanas e adorei o resultado. O ambiente é tão calmo que quase adormeci durante o processo.', name: 'Sofia M.', service: 'Lifting de Pestanas', stars: 5 },
    { quote: 'Excelente atendimento. Senti-me logo confortável, e o tratamento corporal está a dar resultados visíveis após 3 sessões.', name: 'Diana F.', service: 'Tratamento Corporal', stars: 5 },
    { quote: 'O serviço em si é perfeito e o estúdio é luxuoso. Apenas apanhei um pequeno atraso de 10 minutos na minha vez.', name: 'Rita P.', service: 'Design de Sobrancelhas', stars: 4 },
    { quote: 'Nunca fiquei com as unhas tão bem acabadas. Durabilidade extrema sem perder o brilho mesmo após semanas.', name: 'Beatriz S.', service: 'Unhas de Gel', stars: 5 },
    { quote: 'A depilação a laser é muito rápida e as máquinas são excelentes. A técnica foi super atenciosa a explicar tudo.', name: 'Leonor A.', service: 'Depilação a Laser', stars: 5 },
    { quote: 'O tratamento facial deixou-me a pele renovada. Os produtos cheiram maravilhosamente bem. Serviço de luxo merecido.', name: 'Carolina F.', service: 'Tratamento Facial', stars: 5 },
    { quote: 'Adoro o design de sobrancelhas, a linha fica perfeita. Não dou as 5 estrelas apenas pelo facto de ser um pouco longe para mim.', name: 'Matilde N.', service: 'Design de Sobrancelhas', stars: 4 },
    { quote: 'A Mariana é maravilhosa, fez-me umas extensões de pestanas que parecem naturais mas com o volume ideal. Fiquei fã!', name: 'Filipa T.', service: 'Extensão de Pestanas', stars: 5 },
    { quote: 'Unhas elegantes e resistentes como eu procurava. O espaço é muito acolhedor, é de longe o melhor estúdio da região.', name: 'Susana V.', service: 'Unhas de Gelinho', stars: 5 },
    { quote: 'Atendimento imaculado. Fiz a micropigmentação e o cuidado que colocam nos detalhes não se encontra em qualquer lado.', name: 'Joana M.', service: 'Micropigmentação', stars: 5 },
    { quote: 'Adorei a massagem de relaxamento, uma hora inteira de paz. A sala estava com uma temperatura ideal e música suave.', name: 'Ana L.', service: 'Massagem Relaxamento', stars: 5 },
    { quote: 'O resultado final das unhas é 5 estrelas, produtos top. Faltou apenas terem uma maior variedade de chá na sala de espera.', name: 'Marta G.', service: 'Unhas de Gel', stars: 4 },
    { quote: 'Spa day inesquecível. Tratam a cliente com uma exclusividade e atenção aos pormenores que impressiona.', name: 'Mafalda O.', service: 'Spa Day', stars: 5 },
    { quote: 'A limpeza de pele profunda é ótima para o meu acne. Deixou-me a cara um pouco vermelha de início mas o resultado foi incrível.', name: 'Raquel T.', service: 'Limpeza C/ Extração', stars: 4 },
    { quote: 'As instalações não podiam ser melhores. Um ambiente de spa que transmite logo calma, aliado a um serviço de assinatura.', name: 'Sílvia P.', service: 'Facial Anti-aging', stars: 5 },
    { quote: 'Recomendo vivamente o serviço premium, sinto-me sempre impecável após sair do estúdio. Fidelidade garantida!', name: 'Laura B.', service: 'Micropigmentação Labial', stars: 5 },
    { quote: 'As unhas duram intactas semanas a fio. Só não dou cotação máxima por ser um pouco mais caro, embora a qualidade justifique.', name: 'Maria F.', service: 'Unhas de Gel', stars: 4 }
];

const TestimonialCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000); // 6 seconds for better reading time
        return () => clearInterval(interval);
    }, [isHovered]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const currentTestimonial = testimonials[currentIndex];

    // Elite glassmorphism slide variants
    const variants = {
        enter: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
        center: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
    };

    return (
        <section className="py-24 md:py-32 bg-[#050505] relative overflow-hidden">
            {/* Background Elite Glow & Noise */}
            <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-braz-gold/5 blur-[120px] rounded-[100%] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20 text-balance">
                    <p className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.4em] mb-4">A Excelência Reconhecida</p>
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">O Que Dizem de Nós</h2>
                </motion.div>

                <div
                    className="relative max-w-5xl mx-auto flex flex-col items-center justify-center sm:p-4"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Navigation Buttons (Desktop) */}
                    <button
                        onClick={handlePrev}
                        aria-label="Anterior"
                        className="hidden lg:flex absolute -left-8 top-[40%] -translate-y-1/2 z-20 w-16 h-16 items-center justify-center rounded-full bg-black/40 border border-white/10 text-white/50 hover:text-braz-gold hover:border-braz-gold/40 hover:bg-white/5 hover:shadow-elite-glow transition-all duration-500 transform active:scale-90 backdrop-blur-xl"
                    >
                        <ChevronLeft size={28} strokeWidth={1.5} />
                    </button>

                    <button
                        onClick={handleNext}
                        aria-label="Seguinte"
                        className="hidden lg:flex absolute -right-8 top-[40%] -translate-y-1/2 z-20 w-16 h-16 items-center justify-center rounded-full bg-black/40 border border-white/10 text-white/50 hover:text-braz-gold hover:border-braz-gold/40 hover:bg-white/5 hover:shadow-elite-glow transition-all duration-500 transform active:scale-90 backdrop-blur-xl"
                    >
                        <ChevronRight size={28} strokeWidth={1.5} />
                    </button>

                    {/* Carousel Content */}
                    <div className="w-full relative min-h-[460px] md:min-h-[380px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full flex items-center justify-center py-4"
                            >
                                <div className="bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl border border-white/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-lg p-8 sm:p-12 md:p-16 w-full max-w-4xl flex flex-col justify-between relative overflow-hidden group min-h-[380px]">
                                    {/* Giant background quote watermark */}
                                    <Quote className="absolute -top-12 -left-12 text-white/[0.015] w-96 h-96 -rotate-[15deg] pointer-events-none" />

                                    {/* Top subtle glow line on card */}
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-braz-gold/20 to-transparent" />

                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="mb-10">
                                            <div className="flex items-center gap-2 mb-8">
                                                {[...Array(5)].map((_, j) => (
                                                    <Star
                                                        key={j}
                                                        size={16}
                                                        className={j < currentTestimonial.stars ? "text-braz-gold drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]" : "text-white/10"}
                                                        fill="currentColor"
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-white/90 text-2xl md:text-3xl lg:text-4xl leading-relaxed md:leading-[1.4] font-light italic text-left tracking-wide">
                                                "{currentTestimonial.quote}"
                                            </p>
                                        </div>

                                        <div className="flex items-end justify-between border-t border-white/[0.05] pt-8 mt-auto">
                                            <div className="text-left">
                                                <p className="text-white/90 font-bold tracking-[0.25em] uppercase text-sm mb-2">{currentTestimonial.name}</p>
                                                <p className="text-braz-gold/80 text-xs uppercase tracking-[0.3em] font-medium">{currentTestimonial.service}</p>
                                            </div>
                                            <Quote size={40} className="text-braz-gold/20 group-hover:text-braz-gold/40 transition-colors duration-700" strokeWidth={1.5} />
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Elite Animated Progress Bar & Counter */}
                    <div className="mt-20 w-full max-w-xl flex flex-col items-center gap-8">
                        <div className="w-full flex items-center justify-between gap-6">
                            <span className="text-white/40 text-xs font-montserrat tracking-[0.3em] font-medium tabular-nums">
                                {String(currentIndex + 1).padStart(2, '0')}
                            </span>

                            <div className="flex-1 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 6, ease: "linear" }}
                                    className="absolute top-0 left-0 h-full bg-braz-gold shadow-[0_0_15px_rgba(197,160,89,0.8)]"
                                    style={{ transformOrigin: "left" }}
                                />
                            </div>

                            <span className="text-white/20 text-xs font-montserrat tracking-[0.3em] font-medium tabular-nums">
                                {String(testimonials.length).padStart(2, '0')}
                            </span>
                        </div>

                        {/* Mobile Navigation controls under progress bar */}
                        <div className="flex lg:hidden gap-6">
                            <button onClick={handlePrev} aria-label="Anterior" className="p-4 text-white/50 hover:text-braz-gold transition-colors active:scale-90 border border-white/10 rounded-full hover:bg-white/5">
                                <ChevronLeft size={24} strokeWidth={1.5} />
                            </button>
                            <button onClick={handleNext} aria-label="Seguinte" className="p-4 text-white/50 hover:text-braz-gold transition-colors active:scale-90 border border-white/10 rounded-full hover:bg-white/5">
                                <ChevronRight size={24} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default TestimonialCarousel;
