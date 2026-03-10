import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumImageProps {
    src: string;
    alt: string;
    className?: string;
}

const PremiumImage: React.FC<PremiumImageProps> = ({ src, alt, className = '' }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Placeholder / Blur effect */}
            <AnimatePresence>
                {!isLoaded && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/5 backdrop-blur-3xl animate-pulse flex items-center justify-center"
                    >
                        <div className="w-8 h-8 rounded-full border-2 border-braz-gold/20 border-t-braz-gold/50 animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.img
                src={src}
                alt={alt}
                initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                animate={isLoaded ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
                onLoad={() => setIsLoaded(true)}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
};

export default PremiumImage;
