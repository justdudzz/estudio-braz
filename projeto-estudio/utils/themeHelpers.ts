export const getBookingColorClasses = (status?: string, type: 'calendar' | 'agenda' | 'badge' = 'badge') => {
    switch (status) {
        case 'confirmed':
            return type === 'calendar'
                ? 'border-green-500/30 text-green-400 bg-green-500/5'
                : type === 'agenda'
                    ? 'border-braz-gold/30 bg-braz-gold/5'
                    : 'bg-green-500/10 text-green-500 border border-green-500/20';
        case 'blocked':
            return type === 'calendar'
                ? 'border-orange-500/30 text-orange-400 bg-orange-500/5'
                : type === 'agenda'
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
        case 'cancelled':
            return type === 'calendar'
                ? 'border-red-500/30 text-red-400 bg-red-500/5'
                : type === 'agenda'
                    ? 'border-red-500/20 bg-red-500/5 opacity-50'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20';
        case 'pending':
        default:
            return type === 'calendar'
                ? 'border-braz-gold/30 text-braz-gold bg-braz-gold/5'
                : type === 'agenda'
                    ? 'border-white/10 bg-white/5'
                    : 'bg-braz-gold/10 text-braz-gold border border-braz-gold/20';
    }
};

export const getStatusLabel = (status?: string) => {
    switch (status) {
        case 'confirmed': return 'Confirmado';
        case 'blocked': return 'Bloqueado';
        case 'cancelled': return 'Cancelado';
        case 'pending': return 'Pendente';
        default: return 'Desconhecido';
    }
};
