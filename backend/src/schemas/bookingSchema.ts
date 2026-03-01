// backend/src/schemas/bookingSchema.ts
import { z } from 'zod';

// Define exatamente o que é um agendamento válido para o Guardião do Servidor
export const createBookingSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'O nome é obrigatório' })
         .min(3, 'Nome demasiado curto'),
         
    // 🌟 A MAGIA: Aceita um email válido, string vazia, nulo ou nem sequer ser enviado
    email: z.string()
          .email('Formato de email inválido')
          .optional()
          .nullable()
          .or(z.literal('')),
          
    // 🌟 Mesma lógica flexível para o telemóvel, protegendo a Regex
    phone: z.string()
          .regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, "Formato de telemóvel inválido")
          .optional()
          .nullable()
          .or(z.literal('')),
          
    service: z.string({ required_error: 'O serviço deve ser selecionado' }),
    
    date: z.string({ required_error: 'Data obrigatória' })
         .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data deve ser YYYY-MM-DD'),
         
    time: z.string({ required_error: 'Hora obrigatória' })
         .regex(/^\d{2}:\d{2}$/, 'Formato de hora deve ser HH:mm'),
         
  }).refine((data) => {
    // ⚖️ O JUIZ FINAL (AGORA PROTEGIDO CONTRA NULL/UNDEFINED)
    // Só faz o .trim() se tiver a certeza absoluta que é um texto (string)
    const hasEmail = typeof data.email === 'string' && data.email.trim().length > 0;
    const hasPhone = typeof data.phone === 'string' && data.phone.trim().length > 0;
    
    // Tem de ter pelo menos um verdadeiro para a marcação avançar
    return hasEmail || hasPhone;
  }, {
    message: "Para garantir a sua marcação, por favor forneça o E-mail ou o Telemóvel.",
    path: ["phone"] // O erro será associado ao campo 'phone' na resposta do erro
  })
});