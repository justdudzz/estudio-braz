import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Se true, carrega instantaneamente (Hero)
  srcSet?: string;
  sizes?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  srcSet,
  sizes
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reinicia o estado se o src mudar
  useEffect(() => {
    setIsLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-braz-black ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        aspectRatio: width && height ? `${width}/${height}` : 'auto'
      }}
    >
      {/* SKELETON ANIMADO (Shimmer) */}
      <AnimatePresence>
        {!isLoaded && !error && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-[#121212]"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-braz-gold/5 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <img
        src={src}
        alt={alt}
        srcSet={srcSet}
        sizes={sizes}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        
        // --- AS CHAVES DA PERFORMANCE ---
        loading={priority ? "eager" : "lazy"}
        // @ts-ignore - fetchPriority é suportado pelos browsers modernos mas às vezes falta nos tipos do React
        fetchpriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        
        className={`object-cover w-full h-full transition-opacity duration-700 ease-out 
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      />
      
      {/* Caso a imagem falhe, mostramos um fundo sólido elegante */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-braz-black border border-white/5">
          <span className="text-[10px] font-luxury text-white/20 uppercase tracking-widest">{alt}</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
