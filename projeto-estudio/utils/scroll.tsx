import { motion } from 'framer-motion'

/**
 * Utility function to perform smooth scrolling to an element ID.
 * @param id The ID of the target element.
 */
export const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// Componente de animação para garantir que o conteúdo aparece suavemente
export const FadeInWhenVisible = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: delay }}
    >
      {children}
    </motion.div>
  )
}
