import { z } from 'zod';

// Define exatamente o que é um agendamento válido
export const createBookingSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'O nome é obrigatório' }).min(3, 'Nome demasiado curto'),
    email: z.string({ required_error: 'Email obrigatório' }).email('Formato de email inválido'),
    phone: z.string({ required_error: 'Telefone obrigatório' }).min(9, 'Telefone inválido'),
    service: z.string({ required_error: 'O serviço deve ser selecionado' }),
    date: z.string({ required_error: 'Data obrigatória' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data deve ser YYYY-MM-DD'),
    time: z.string({ required_error: 'Hora obrigatória' }).regex(/^\d{2}:\d{2}$/, 'Formato de hora deve ser HH:mm'),
  }),
});