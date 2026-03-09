import React, { useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// --- Gold Dust Particles ---
const GoldDust = () => {
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 0.8,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 14,
        delay: Math.random() * 8,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-[#C5A059] blur-[0.5px] mix-blend-screen"
                    style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                    animate={{
                        y: [0, -100 - Math.random() * 60],
                        x: [0, (Math.random() - 0.5) * 30],
                        opacity: [0, 0.5, 0],
                        scale: [0.5, 1.2, 0.3]
                    }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
                />
            ))}
        </div>
    );
};

const ImmersiveHero: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    const bgY = useTransform(scrollY, [0, 600], [0, 100]);
    const contentOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const contentY = useTransform(scrollY, [0, 300], [0, -50]);

    // Desktop: Spotlight follows mouse
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!spotlightRef.current || window.innerWidth < 1024) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(197,160,89,0.06), transparent 60%)`;
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('mousemove', handleMouseMove);
        return () => container.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    return (
        <section
            ref={containerRef}
            className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] -mt-[104px] md:-mt-[130px] pt-[104px] md:pt-[130px]"
        >
            {/* === Layer 1: Deep texture background + parallax + Image === */}
            <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
                {/* Animated Image Background */}
                <motion.div
                    className="absolute inset-0 w-full h-full origin-center"
                    animate={{
                        scale: [1, 1.05, 1],
                        x: [0, -10, 0],
                        y: [0, -5, 0]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                >
                    <img
                        src="/footerPaginaInicial.png"
                        alt="Background Studio Braz"
                        className="w-full h-full object-cover object-center md:object-top opacity-75"
                    />
                </motion.div>
                {/* Subtle noise texture */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '128px' }}
                />
                {/* Gradient depth */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.05)_0%,transparent_80%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#050505]" />
            </motion.div>

            {/* === Layer 2: Spotlight that follows cursor (Desktop only) === */}
            <div ref={spotlightRef} className="absolute inset-0 z-[1] hidden lg:block transition-all duration-75 pointer-events-none" />

            {/* === Layer 3: Gold Dust === */}
            <GoldDust />

            {/* === Layer 4: Content === */}
            <motion.div
                className="relative z-10 w-full"
                style={{ opacity: contentOpacity, y: contentY }}
            >
                {children}
            </motion.div>

            {/* === Scroll Indicator === */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1 }}
                className="absolute bottom-6 z-10 flex flex-col items-center"
            >
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-5 h-8 border border-white/10 rounded-full flex items-start justify-center p-1"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-1 h-1.5 bg-[#C5A059]/60 rounded-full"
                    />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default ImmersiveHero;
