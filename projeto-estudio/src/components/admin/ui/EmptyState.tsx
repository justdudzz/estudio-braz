import React from 'react';
import { SearchX, Inbox, CalendarX, FileX } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    title: string;
    description: string;
    type?: 'search' | 'inbox' | 'calendar' | 'file';
    action?: { label: string; onClick: () => void };
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, type = 'search', action }) => {
    const icons = {
        search: <SearchX size={32} className="text-white/20" />,
        inbox: <Inbox size={32} className="text-white/20" />,
        calendar: <CalendarX size={32} className="text-white/20" />,
        file: <FileX size={32} className="text-white/20" />
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-20 text-center space-y-4 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/5"
        >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 ring-1 ring-white/10 ring-offset-4 ring-offset-transparent">
                {icons[type]}
            </div>
            <div className="space-y-1">
                <h4 className="text-base font-bold text-white/80">{title}</h4>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em] max-w-xs mx-auto">
                    {description}
                </p>
            </div>
            {action && (
                <button 
                    onClick={action.onClick}
                    className="mt-6 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    );
};

export default EmptyState;
