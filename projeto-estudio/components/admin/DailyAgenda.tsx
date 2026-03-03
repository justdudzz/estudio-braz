import React, { useMemo } from 'react';
import { Calendar, X, Check, MessageCircle } from 'lucide-react';
import { SERVICES_CONFIG, OPENING_HOURS } from '../../utils/constants';

interface DailyAgendaProps {
    date: string;
    bookings: any[];
    onClose: () => void;
    onConfirm: (id: string) => void;
    onDelete: (id: string) => void;
    onWhatsApp: (client: any, booking: any) => void;
}


const DailyAgenda: React.FC<DailyAgendaProps> = ({ date, bookings, onClose, onConfirm, onDelete, onWhatsApp }) => {
    // Generate working hours dynamically from OPENING_HOURS
    const workingHours = useMemo(() => {
        const dayOfWeek = new Date(`${date}T12:00:00Z`).getDay();
        const isWeekend = dayOfWeek === 6;
        const start = isWeekend ? OPENING_HOURS.weekendStart : OPENING_HOURS.start;
        const end = isWeekend ? OPENING_HOURS.weekendEnd : OPENING_HOURS.end;
        const hours: string[] = [];
        for (let mins = start * 60; mins < end * 60; mins += 30) {
            const h = Math.floor(mins / 60).toString().padStart(2, '0');
            const m = (mins % 60).toString().padStart(2, '0');
            hours.push(`${h}:${m}`);
        }
        return hours;
    }, [date]);

    const formattedDate = (() => {
        try {
            const d = new Date(`${date}T12:00:00Z`);
            return d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch { return date; }
    })();
    return (
        <div className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden shadow-2xl max-w-3xl w-full mx-auto">
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Calendar className="text-braz-gold" size={20} />
                    <h3 className="font-bold text-braz-gold uppercase tracking-wider text-sm">Agenda do Dia</h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">{formattedDate}</span>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-white/[0.03]">
                {workingHours.map((hour) => {
                    const appointment = bookings.find(b => b.time === hour);

                    return (
                        <div key={hour} className="group flex items-center min-h-[70px] hover:bg-white/[0.01] transition-all">
                            {/* Time Column */}
                            <div className="w-20 py-3 px-4 border-r border-white/5 flex items-center">
                                <span className="text-[11px] font-mono text-white/20 group-hover:text-braz-gold transition-colors">
                                    {hour}
                                </span>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 px-4 py-2">
                                {appointment ? (
                                    <div className={`p-3 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${appointment.status === 'confirmed' ? 'border-braz-gold/30 bg-braz-gold/5' :
                                        appointment.status === 'blocked' ? 'border-red-500/20 bg-red-500/5' :
                                            appointment.status === 'cancelled' ? 'border-red-500/20 bg-red-500/5 opacity-50' :
                                                'border-white/10 bg-white/5'
                                        }`}>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-bold uppercase tracking-wider ${appointment.status === 'confirmed' ? 'text-braz-gold' : 'text-white'
                                                    }`}>
                                                    {appointment.client?.name || 'Horário Trancado'}
                                                </p>
                                                {appointment.client?.phone && (
                                                    <span className="text-[8px] font-bold text-braz-gold/60 border border-braz-gold/20 px-2 py-0.5 rounded-full uppercase">
                                                        {appointment.client.phone}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">
                                                {SERVICES_CONFIG[appointment.service as keyof typeof SERVICES_CONFIG]?.label || appointment.service || appointment.reason || 'Reserva'}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            {appointment.status !== 'confirmed' && appointment.status !== 'blocked' && (
                                                <button onClick={() => onConfirm(appointment.id)} title="Confirmar" className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all">
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            {appointment.client?.phone && (
                                                <button onClick={() => onWhatsApp(appointment.client, appointment)} title="WhatsApp" className="p-2 bg-white/5 text-white/60 rounded-lg hover:bg-green-500 hover:text-white transition-all">
                                                    <MessageCircle size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => onDelete(appointment.id)} title="Eliminar" className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-[9px] text-white/10 uppercase tracking-widest group-hover:text-white/20 transition-all">
                                        — Livre —
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DailyAgenda;
