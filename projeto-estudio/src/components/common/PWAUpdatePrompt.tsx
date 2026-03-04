import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🔄 PWA UPDATE PROMPT (Point #24)
 * Garante que o cliente nunca vê uma versão obsoleta do site.
 * Mostra uma notificação elegante quando há uma nova versão disponível.
 */
const PWAUpdatePrompt = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW();

    return (
        <AnimatePresence>
            {needRefresh && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-sm z-[10000]"
                >
                    <div className="bg-[#0A0A0A] border border-[#D4AF37] p-6 rounded-2xl shadow-2xl shadow-[#D4AF37]/20 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#D4AF37]/10 p-2 rounded-full">
                                    <RefreshCw className="w-5 h-5 text-[#D4AF37] animate-spin-slow" />
                                </div>
                                <h3 className="font-bold text-[#D4AF37] tracking-wide">Atualização Disponível</h3>
                            </div>
                            <button
                                onClick={() => setNeedRefresh(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed">
                            Uma nova versão do Estúdio Braz está pronta. Atualize para aceder às últimas melhorias de elite.
                        </p>

                        <button
                            onClick={() => updateServiceWorker(true)}
                            className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-[#B8962E] transition-all transform active:scale-[0.98] shadow-lg shadow-[#D4AF37]/10"
                        >
                            Atualizar Agora
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PWAUpdatePrompt;
