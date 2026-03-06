import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, X, Info } from 'lucide-react';

type ConfirmType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmOptions {
    title: string;
    message: string;
    type?: ConfirmType;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
}

interface ConfirmContextData {
    confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextData | undefined>(undefined);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error('useConfirm deve ser usado dentro de um ConfirmProvider');
    return context;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const confirm = (newOptions: ConfirmOptions) => {
        setOptions(newOptions);
    };

    const handleConfirm = async () => {
        if (!options) return;
        setIsLoading(true);
        try {
            await options.onConfirm();
        } finally {
            setIsLoading(false);
            setOptions(null);
        }
    };

    const handleCancel = () => {
        setOptions(null);
    };

    const getIcon = (type: ConfirmType) => {
        switch (type) {
            case 'danger': return <AlertTriangle className="text-red-500" size={32} />;
            case 'warning': return <AlertTriangle className="text-yellow-500" size={32} />;
            case 'info': return <Info className="text-blue-500" size={32} />;
            case 'success': return <Check className="text-green-500" size={32} />;
        }
    };

    const getPrimaryButtonSyles = (type: ConfirmType) => {
        switch (type) {
            case 'danger': return 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
            case 'warning': return 'bg-yellow-500 text-black hover:bg-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
            case 'info': return 'bg-blue-500 text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
            case 'success': return 'bg-braz-gold text-black hover:bg-white shadow-[0_0_15px_rgba(202,176,128,0.3)]';
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            <AnimatePresence>
                {options && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={handleCancel}
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -20 }}
                            className="relative bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Efeito Glow de Fundo */}
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 pointer-events-none ${
                                options.type === 'danger' ? 'bg-red-500' :
                                options.type === 'warning' ? 'bg-yellow-500' :
                                options.type === 'info' ? 'bg-blue-500' : 'bg-braz-gold'
                            }`} />

                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-inner ${
                                    options.type === 'danger' ? 'bg-red-500/10 border border-red-500/20' :
                                    options.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                                    options.type === 'info' ? 'bg-blue-500/10 border border-blue-500/20' :
                                    'bg-braz-gold/10 border border-braz-gold/20'
                                }`}>
                                    {getIcon(options.type || 'success')}
                                </div>

                                <h3 className="text-xl font-bold uppercase tracking-wider text-white mb-2">
                                    {options.title}
                                </h3>
                                
                                <p className="text-xs text-white/50 leading-relaxed mb-8">
                                    {options.message}
                                </p>

                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <button
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="py-3 px-4 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 text-white/60 transition-all disabled:opacity-50"
                                    >
                                        {options.cancelText || 'Cancelar'}
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={isLoading}
                                        className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center ${getPrimaryButtonSyles(options.type || 'success')}`}
                                    >
                                        {isLoading ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            options.confirmText || 'Confirmar'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
};
