import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface CopyableProps {
    value: string;
    label?: string;
    className?: string;
}

const Copyable: React.FC<CopyableProps> = ({ value, label, className }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div 
            onClick={handleCopy}
            className={`group cursor-pointer flex items-center gap-2 transition-all ${className}`}
            title={`Copiar: ${value}`}
        >
            <div className="flex-1 min-w-0">
                {label && <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-0.5">{label}</p>}
                <p className="text-white truncate font-medium group-hover:text-braz-gold transition-colors">{value}</p>
            </div>
            
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 border border-white/5 text-white/20 group-hover:text-braz-gold group-hover:border-braz-gold/20'
            }`}>
                <AnimatePresence mode="wait">
                    {copied ? (
                        <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <Check size={14} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="copy"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Copy size={12} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Copyable;
