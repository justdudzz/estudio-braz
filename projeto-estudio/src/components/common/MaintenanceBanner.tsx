import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MaintenanceBannerProps {
    message?: string;
    isActive?: boolean;
}

const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ 
    message = "O Studio Braz passará por uma manutenção técnica hoje às 23h. O sistema pode ficar indisponível por 15 min.",
    isActive = false 
}) => {
    const [isVisible, setIsVisible] = React.useState(isActive);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-braz-gold text-black overflow-hidden z-[2000] relative"
            >
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={16} className="shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                            {message}
                        </span>
                    </div>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[1px] bg-black/10 w-full" />
            </motion.div>
        </AnimatePresence>
    );
};

export default MaintenanceBanner;
