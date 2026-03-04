import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Componente que garante que a página volta ao topo sempre que mudamos de rota.
 * É exportado como 'default' para ser usado diretamente no App.tsx.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // 🚀 LUXURY SCROLL RESET (Point #13)
    // Instantâneo antes da pintura do browser para evitar lag visual
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [pathname]);

  return null;
};

/**
 * Função utilitária para fazer scroll suave até um elemento pelo ID.
 */
export const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Componente de animação para garantir que o conteúdo aparece suavemente quando visível.
 */
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
  );
};

export default ScrollToTop;