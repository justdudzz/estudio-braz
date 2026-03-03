import { z } from 'zod';
// Schema para validação do status de booking
export const updateBookingStatusSchema = z.object({
    body: z.object({
        status: z.enum(['confirmed', 'cancelled', 'completed', 'no-show'], {
            message: 'Status inválido. Valores permitidos: confirmed, cancelled, completed, no-show.'
        })
    })
});
