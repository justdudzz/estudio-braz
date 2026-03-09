import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllBookings } from '../../services/bookingService';
import { SERVICES_CONFIG } from '../../utils/constants';

const NotificationBell: React.FC = () => {
    const [pending, setPending] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const fetchPending = async () => {
        try {
            const data = await getAllBookings();
            const bookings = Array.isArray(data) ? data : data?.data || [];
            setPending(bookings.filter((b: any) => b.status === 'pending'));
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        fetchPending();
        const interval = setInterval(fetchPending, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors relative"
            >
                <Bell size={18} className="text-white/40" strokeWidth={1.5} />
                {pending.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                        {pending.length > 9 ? '9+' : pending.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 top-12 w-72 bg-[#151515] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                        <div className="p-3 border-b border-white/5">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                {pending.length} Pendente{pending.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                            {pending.length === 0 ? (
                                <p className="p-6 text-center text-white/20 text-xs">Tudo em dia! 🎉</p>
                            ) : (
                                pending.slice(0, 8).map(b => (
                                    <div key={b.id} className="p-3 hover:bg-white/[0.02] transition-colors">
                                        <p className="text-xs font-bold text-white">{b.client?.name || 'Sem nome'}</p>
                                        <p className="text-[10px] text-white/30 mt-0.5">
                                            {SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.label || b.service} • {b.date} {b.time}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
