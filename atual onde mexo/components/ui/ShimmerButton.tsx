import React from 'react'
import { motion } from 'framer-motion'

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

const ShimmerButton: React.FC<ShimmerButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden px-8 py-4 text-lg font-semibold rounded-xl bg-pastel-pink text-deep-black shadow-lg-subtle transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pastel-pink ${className}`}
      {...props}
    >
      <motion.span
        className="absolute inset-0 w-full h-full block"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'linear',
          delay: 0.5,
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

export default ShimmerButton
