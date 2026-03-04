import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-braz-gold'

  const variantStyles = {
    primary: 'bg-braz-gold text-braz-black hover:bg-opacity-90 shadow-subtle',
    secondary: 'bg-braz-charcoal text-white hover:bg-white/5 shadow-subtle',
    outline: 'border-2 border-braz-gold text-braz-gold hover:bg-braz-gold hover:text-braz-black',
    ghost: 'text-white hover:bg-white/5',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}

export default Button
