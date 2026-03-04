import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * 🎨 LUXURY 404 PAGE (Point #20)
 * Substitui o erro 404 genérico por uma experiência de marca premium.
 */
const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#D4AF37]/3 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center z-10"
            >
                <h1 className="text-[12rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] to-[#8A6D19] mb-4">
                    404
                </h1>

                <div className="w-20 h-1 bg-[#D4AF37] mx-auto mb-8" />

                <h2 className="text-3xl font-light tracking-[0.2em] uppercase mb-6">
                    Página não encontrada
                </h2>

                <p className="text-gray-400 max-w-md mx-auto mb-12 text-lg font-light leading-relaxed">
                    O serviço solicitado não está disponível ou foi movido para uma nova morada de elite.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 px-8 py-4 border border-[#D4AF37]/30 rounded-full hover:bg-[#D4AF37]/10 transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-medium tracking-wide">Voltar atrás</span>
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-black rounded-full hover:scale-105 transition-all shadow-xl shadow-[#D4AF37]/20 active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        <span className="font-bold tracking-wide">Ir para o Início</span>
                    </button>
                </div>
            </motion.div>

            <div className="mt-24 text-[#D4AF37]/30 text-xs tracking-[0.3em] uppercase">
                Studio Braz • Estética de Elite
            </div>
        </div>
    );
};

export default NotFoundPage;
