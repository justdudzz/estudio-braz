import { z } from 'zod';

// Schema para validação do status de booking
export const updateBookingStatusSchema = z.object({
    body: z.object({
        status: z.enum(['confirmed', 'cancelled', 'completed', 'no-show', 'paid', 'pending', 'blocked', 'rejected'], {
            message: 'Status inválido. Valores permitidos: confirmed, cancelled, completed, no-show, paid, pending, blocked, rejected.'
        }),
        totalPrice: z.number().optional()
    })
});
