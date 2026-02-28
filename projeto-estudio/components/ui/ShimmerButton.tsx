import React from 'react'
import { motion } from 'framer-motion'

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

const ShimmerButton: React.FC<ShimmerButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      // 1. REAÇÃO DE ELITE (Micro-interações)
      whileHover={{ 
        scale: 1.02, 
        // Cria um halo dourado baseado na nossa cor soberana #C5A059
        boxShadow: "0 0 25px rgba(197, 160, 89, 0.3)" 
      }}
      whileTap={{ scale: 0.98 }}
      
      // 2. ESTILO SOBERANO
      // Usamos o bg-gold-gradient e a tipografia de luxo
      className={`
        relative overflow-hidden px-8 py-4 
        text-sm font-luxury uppercase tracking-widest 
        rounded-golden bg-gold-gradient text-black 
        shadow-lg transition-all focus:outline-none 
        ${className}
      `}
      {...props}
    >
      {/* 3. EFEITO SHIMMER (Reflexo Metálico) */}
      <motion.span
        className="absolute inset-0 w-full h-full block"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
          ease: 'linear',
          delay: 0.5,
        }}
        style={{
          // Gradiente branco suave para simular o reflexo da luz no ouro
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        }}
      />

      {/* 4. CONTEÚDO */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}

export default ShimmerButton