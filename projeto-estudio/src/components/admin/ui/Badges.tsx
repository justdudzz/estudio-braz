import React from 'react';
import { BookingStatus } from '../../../types';

const STATUS_STYLES: Record<BookingStatus, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
    paid: 'bg-braz-gold/10 text-braz-gold border-braz-gold/30 shadow-[0_0_10px_rgba(197,160,89,0.2)]',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    blocked: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
    pending: 'Aguardar Decisão',
    confirmed: 'Confirmado',
    paid: 'Pago',
    cancelled: 'Cancelado',
    blocked: 'Bloqueio',
    rejected: 'Rejeitado',
    completed: 'Concluído',
};

export const StatusBadge = ({ status, className = '' }: { status: BookingStatus, className?: string }) => {
    const style = STATUS_STYLES[status] || 'bg-white/5 text-white/40 border-white/10';
    const label = STATUS_LABELS[status] || status;

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${style} ${className}`}>
            {label}
        </span>
    );
};
