import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    action?: { label: string; onClick: () => void };
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, action?: { label: string; onClick: () => void }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast deve ser usado dentro de ToastProvider');
    return context;
};

const TOAST_ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
};

const TOAST_COLORS = {
    success: 'border-green-500/30 bg-green-500/10 text-green-400',
    error: 'border-red-500/30 bg-red-500/10 text-red-400',
    warning: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success', action?: { label: string; onClick: () => void }) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type, action }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, action ? 8000 : 4000); // 8 segundos para dar tempo de clicar no Undo
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[9999990] flex flex-col gap-3 max-w-sm">
                <AnimatePresence>
                    {toasts.map(toast => {
                        const Icon = TOAST_ICONS[toast.type];
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                                className={`flex items-center gap-3 px-5 py-4 rounded-xl border backdrop-blur-xl shadow-2xl ${TOAST_COLORS[toast.type]}`}
                            >
                                <Icon size={18} className="flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{toast.message}</p>
                                    {toast.action && (
                                        <button
                                            onClick={() => { toast.action?.onClick(); removeToast(toast.id); }}
                                            className="mt-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors active:scale-95"
                                        >
                                            {toast.action.label}
                                        </button>
                                    )}
                                </div>
                                <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                                    <X size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
