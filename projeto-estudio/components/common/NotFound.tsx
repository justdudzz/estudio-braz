import React from 'react';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-braz-black flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md"
      >
        <div className="relative inline-block mb-8">
          <Compass className="text-braz-gold w-24 h-24 animate-pulse" strokeWidth={1.5} />
          <div className="absolute inset-0 bg-braz-gold/20 blur-3xl -z-10" />
        </div>

        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">404</h1>
        <h2 className="text-xl font-bold text-white/80 uppercase tracking-widest mb-6">
          Momento Perdido no Tempo
        </h2>
        <p className="text-white/40 text-sm mb-10 leading-relaxed">
          Parece que este caminho não leva à beleza. Vamos voltar ao início para recomeçar a sua transformação?
        </p>

        <Link
          to="/"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-braz-gold hover:text-black transition-all shadow-xl active:scale-95"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Voltar ao Estúdio
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
