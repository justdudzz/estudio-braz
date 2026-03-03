import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
    onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'drawing' | 'reveal' | 'done'>('drawing');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('reveal'), 3200);
        const t2 = setTimeout(() => { setPhase('done'); onComplete(); }, 4200);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {phase !== 'done' && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="relative flex flex-col items-center">

                        {/* ===== SVG LOGO ANIMATION ===== */}
                        <svg
                            viewBox="0 0 400 280"
                            className="w-72 md:w-96"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* ── Monogram "M" Outer Circle/Oval ── */}
                            <motion.ellipse
                                cx="100" cy="130" rx="65" ry="90"
                                stroke="#2A2A2A"
                                strokeWidth="1.5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* ── Monogram "M" Inner Vertical Line (Left) ── */}
                            <motion.line
                                x1="80" y1="70" x2="80" y2="190"
                                stroke="#2A2A2A"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* ── Monogram "M" Diagonal Down ── */}
                            <motion.path
                                d="M80 70 L110 145"
                                stroke="#2A2A2A"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* ── Monogram "M" Diagonal Up ── */}
                            <motion.path
                                d="M110 145 L140 70"
                                stroke="#2A2A2A"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* ── Monogram "M" Inner Vertical Line (Right) ── */}
                            <motion.line
                                x1="120" y1="70" x2="120" y2="190"
                                stroke="#2A2A2A"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* ── Golden Leaf Petal 1 (Top) ── */}
                            <motion.path
                                d="M140 55 C148 25, 175 30, 172 55 C170 70, 155 65, 150 58 C147 53, 146 42, 140 55 Z"
                                stroke="#C5A059"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.2, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* ── Golden Leaf Petal 2 (Right) ── */}
                            <motion.path
                                d="M150 58 C160 42, 180 48, 175 65 C172 76, 158 72, 155 66 C152 62, 155 50, 150 58 Z"
                                stroke="#C5A059"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.2, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* ── Golden Leaf Petal 3 (Small) ── */}
                            <motion.path
                                d="M145 62 C150 50, 162 52, 160 62 C158 70, 150 68, 148 65 C146 63, 148 56, 145 62 Z"
                                stroke="#C5A059"
                                strokeWidth="1"
                                strokeLinecap="round"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 2.2, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* Golden glow behind leaf (appears after petals) */}
                            <motion.circle
                                cx="158" cy="55" r="25"
                                fill="url(#leafGlow)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.5, duration: 1 }}
                            />

                            {/* ── "MARIANA" Text ── */}
                            <motion.text
                                x="195" y="120"
                                fill="#3A3A3A"
                                fontSize="32"
                                fontFamily="Georgia, serif"
                                fontWeight="400"
                                letterSpacing="3"
                                initial={{ opacity: 0, x: 180 }}
                                animate={{ opacity: 1, x: 195 }}
                                transition={{ delay: 2.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            >
                                MARIANA
                            </motion.text>

                            {/* ── "BRAZ" Text ── */}
                            <motion.text
                                x="195" y="158"
                                fill="#C5A059"
                                fontSize="38"
                                fontFamily="Georgia, serif"
                                fontWeight="700"
                                letterSpacing="4"
                                initial={{ opacity: 0, x: 180 }}
                                animate={{ opacity: 1, x: 195 }}
                                transition={{ delay: 2.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            >
                                BRAZ
                            </motion.text>

                            {/* ── "ESTÉTICA & BEM ESTAR" Subtitle ── */}
                            <motion.text
                                x="197" y="178"
                                fill="#666"
                                fontSize="10"
                                fontFamily="system-ui, sans-serif"
                                letterSpacing="3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.8, duration: 0.8 }}
                            >
                                ESTÉTICA & BEM ESTAR
                            </motion.text>

                            {/* Gold shimmer sweep across the entire logo */}
                            <motion.rect
                                x="0" y="0" width="60" height="280"
                                fill="url(#shimmer)"
                                initial={{ x: -80 }}
                                animate={{ x: 420 }}
                                transition={{ delay: 3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* ── Gradients ── */}
                            <defs>
                                <radialGradient id="leafGlow">
                                    <stop offset="0%" stopColor="#C5A059" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                                </radialGradient>
                                <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                                    <stop offset="50%" stopColor="white" stopOpacity="0.12" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Loading bar below */}
                        <motion.div className="w-20 h-[1px] bg-white/5 mt-8 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#C5A059]/60 to-[#E5C585]/60"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 3.2, ease: 'easeInOut' }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;
