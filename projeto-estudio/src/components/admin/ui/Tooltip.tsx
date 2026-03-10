import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
                        className={`absolute z-[100] px-3 py-1.5 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl pointer-events-none whitespace-nowrap ${positions[position]}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                            {content}
                        </span>
                        {/* Arrow */}
                        <div className={`absolute w-2 h-2 bg-black/90 border-r border-b border-white/10 rotate-45 ${
                            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
                            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 rotate-[225deg]' :
                            position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 rotate-[-45deg]' :
                            'right-full top-1/2 -translate-y-1/2 -mr-1 rotate-[135deg]'
                        }`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
