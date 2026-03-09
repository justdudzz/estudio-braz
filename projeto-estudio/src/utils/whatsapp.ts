import { SERVICES_CONFIG } from './constants';

export const openWhatsApp = (client: any, booking: any, toastNotifier?: (msg: string, type: string) => void) => {
    if (!client?.phone) {
        if (toastNotifier) toastNotifier('Cliente sem contacto telefónico.', 'warning');
        return;
    }

    let cleanNumber = client.phone.replace(/\D/g, '');

    // Add PT prefix if not present (simple naive check for 9 digits)
    if (cleanNumber.length === 9) {
        cleanNumber = '351' + cleanNumber;
    }

    const config = SERVICES_CONFIG[booking.service as keyof typeof SERVICES_CONFIG];
    const serviceName = config?.label || booking.service || 'Serviço';

    const msg = `Olá ${client.name}! ✨ Studio Braz aqui. Confirmamos para ${serviceName} dia ${booking.date} às ${booking.time}?`;

    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
};
