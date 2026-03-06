import React, { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES_CONFIG } from '../../utils/constants';
import { getBookingColorClasses } from '../../utils/themeHelpers';
import { useToast } from '../common/Toast';
interface CalendarViewProps {
    bookings: any[];
    isLoading?: boolean;
    onConfirm: (id: string) => void;
    onDelete: (id: string) => void;
    onWhatsApp: (client: any, booking: any) => void;
    onMarkPaid?: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, isLoading, onConfirm, onDelete, onWhatsApp, onMarkPaid }) => {
    const { showToast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const navigate = useNavigate();
    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        const days: ({ day: number; dateStr: string } | null)[] = [];
        for (let i = 0; i < offset; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            days.push({
                day: d,
                dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            });
        }
        return days;
    }, [currentDate]);

    // Render Skeletons for Loading State
    if (isLoading) {
        return (
            <div className="bg-[#121212] rounded-2xl border border-white/5 p-4 md:p-6 shadow-2xl mb-8 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-48 mb-8"></div>
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="min-h-[80px] md:min-h-[100px] bg-white/[0.02] rounded-xl border border-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Calendar Grid */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-4 md:p-6 shadow-2xl mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-braz-gold uppercase tracking-wider text-sm">Agenda</h3>
                            <div className="flex items-center gap-3">
                                <button onClick={goToToday} className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                                    Hoje
                                </button>
                                <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                                    <button onClick={() => changeMonth(-1)} className="p-2 hover:text-braz-gold transition-colors">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="px-4 text-[11px] font-semibold uppercase tracking-tight min-w-[140px] text-center">
                                        {currentDate.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button onClick={() => changeMonth(1)} className="p-2 hover:text-braz-gold transition-colors">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Week headers */}
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {weekDays.map(d => (
                            <div key={d} className="text-center text-[9px] font-semibold text-white/20 uppercase pb-3">{d}</div>
                        ))}

                        {calendarDays.map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} className="min-h-[80px] md:min-h-[100px] opacity-0" />;

                            const dayBookings = bookings.filter(b => b.date === day.dateStr);
                            const isToday = new Date().toISOString().split('T')[0] === day.dateStr;
                            const isBlockedDay = dayBookings.filter(b => b.status === 'blocked').length >= 15;

                            return (
                                <div
                                    key={day.dateStr}
                                    onClick={() => navigate(`/dashboard/dia/${day.dateStr}`)}
                                    className={`min-h-[80px] md:min-h-[100px] bg-white/[0.02] rounded-xl p-2 md:p-3 border transition-all cursor-pointer hover:bg-white/[0.06] hover:scale-[1.02] ${isToday ? 'border-braz-gold/50 bg-braz-gold/5' : isBlockedDay ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'
                                        }`}
                                >
                                    <span className={`text-[10px] font-semibold ${isToday ? 'text-braz-gold' : 'text-white/20'}`}>
                                        {day.day}
                                    </span>

                                    <div className="mt-2 space-y-1">
                                        {isBlockedDay ? (
                                            <div className="p-1 rounded text-[7px] md:text-[8px] font-black uppercase text-center border border-red-500/20 text-red-400 bg-red-500/10 py-2">
                                                Bloqueado
                                            </div>
                                        ) : (
                                            <>
                                                {dayBookings.slice(0, 3).map(b => (
                                                    <div
                                                        key={b.id}
                                                        className={`p-1 rounded text-[7px] md:text-[8px] font-bold uppercase truncate border ${getBookingColorClasses(b.status, 'calendar')}`}
                                                    >
                                                        {b.time} {b.client?.name?.split(' ')[0] || 'ADMIN'}
                                                    </div>
                                                ))}
                                                {dayBookings.length > 3 && (
                                                    <p className="text-[8px] text-center text-white/20 font-bold">+{dayBookings.length - 3}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CalendarView;
