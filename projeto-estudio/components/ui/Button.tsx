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
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pastel-pink'

  const variantStyles = {
    primary: 'bg-pastel-pink text-deep-black hover:bg-opacity-90 shadow-subtle',
    secondary: 'bg-surface-dark text-pure-white hover:bg-border-dark shadow-subtle',
    outline: 'border-2 border-pastel-pink text-pastel-pink hover:bg-pastel-pink hover:text-deep-black',
    ghost: 'text-pure-white hover:bg-surface-dark',
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
