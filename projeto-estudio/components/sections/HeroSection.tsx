import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import OptimizedImage from '../common/OptimizedImage';

// --- Partículas de Pó Dourado ---
const GoldDust = () => {
  const particles = Array.from({ length: 35 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2.5 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 18 + 12,
    delay: Math.random() * 6,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#C5A059] blur-[0.5px] mix-blend-screen"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -120 - (Math.random() * 80)],
            x: [0, (Math.random() - 0.5) * 40],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.3, 0.5]
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
};

const HeroSection: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();

  const bgY = useTransform(scrollY, [0, 600], [0, 120]);
  const contentOpacity = useTransform(scrollY, [0, 350], [1, 0]);
  const contentY = useTransform(scrollY, [0, 350], [0, -60]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black -mt-[104px] md:-mt-[130px] pt-[104px] md:pt-[130px]"
    >
      {/* === CAMADA 1: Background com Ken Burns + Parallax === */}
      <motion.div className="absolute inset-0 w-full h-full z-0" style={{ y: bgY }}>
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        >
          <OptimizedImage
            src="/assets/hero-bg.jpg"
            alt="Studio Braz — ambiente de luxo"
            className="w-full h-full object-cover object-center"
            priority={true}
          />
        </motion.div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/55 z-[1]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)] z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0A0A0A] z-[1]" />
      </motion.div>

      {/* === CAMADA 2: Partículas === */}
      <GoldDust />

      {/* === CAMADA 3: Conteúdo — Logo + CTA === */}
      <motion.div
        className="relative z-10 text-center flex flex-col items-center px-6"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Logo da marca — Entrada cinematic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8"
        >
          {/* Glow dourado atrás do logo */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] rounded-full -z-10"
            style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.12) 0%, transparent 70%)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.5, delay: 0.8 }}
          />

          <img
            src="/footerPaginaInicial.png"
            alt="Studio Braz"
            className="h-36 md:h-48 lg:h-56 w-auto object-contain drop-shadow-[0_0_40px_rgba(197,160,89,0.2)]"
          />
        </motion.div>

        {/* Linha decorativa */}
        <motion.div
          className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mb-6"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.4 }}
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm md:text-base lg:text-lg text-white/80 font-medium tracking-[0.2em] uppercase font-montserrat mb-10 max-w-xl"
        >
          Qual é o seu desejo de beleza hoje?
        </motion.p>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-[#C5A059]/15 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
            Especialista Certificada
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-[#C5A059]/15 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
            <span className="text-[#C5A059]">★</span> 5.0 Google
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-[#C5A059]/15 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/60">
            Águeda, Portugal
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            to="/agendar"
            className="relative group bg-[#C5A059] text-[#0A0A0A] px-10 py-4 text-xs md:text-sm font-black font-montserrat uppercase tracking-[0.3em] hover:bg-white transition-all duration-500 shadow-[0_0_40px_rgba(197,160,89,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] active:scale-95 rounded-lg overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">Agendar <ArrowRight size={14} /></span>
            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[45deg] group-hover:left-[200%] transition-all duration-1000" />
          </Link>

          <Link
            to="/servicos"
            className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] hover:text-[#C5A059] transition-colors flex items-center gap-2 px-6 py-4 border border-white/10 rounded-lg hover:border-[#C5A059]/30"
          >
            Explorar
          </Link>
        </motion.div>
      </motion.div>

      {/* === Scroll Indicator === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 1 }}
        className="absolute bottom-8 z-10 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} className="text-white/20" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;