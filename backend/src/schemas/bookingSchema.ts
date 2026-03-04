// backend/src/schemas/bookingSchema.ts
import { z } from 'zod';

// Define exatamente o que é um agendamento válido para o Guardião do Servidor
export const createBookingSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, 'Nome demasiado curto')
      .max(100, 'Nome demasiado longo (máximo 100 caracteres)'),

    // 🌟 A MAGIA: Aceita um email válido, string vazia, nulo ou nem sequer ser enviado
    email: z.string()
      .email('Formato de email inválido')
      .max(255, 'Email demasiado longo')
      .optional()
      .nullable()
      .or(z.literal('')),

    // 🌟 Mesma lógica flexível para o telemóvel, protegendo a Regex
    phone: z.string()
      .regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, "Formato de telemóvel inválido")
      .max(20, 'Telemóvel demasiado longo')
      .optional()
      .nullable()
      .or(z.literal('')),

    service: z.string()
      .min(1, 'O serviço deve ser selecionado')
      .max(50, 'Serviço inválido'),

    date: z.string()
      .regex(/^\d{4}-\ d{2}-\d{2}$/, 'Formato de data deve ser YYYY-MM-DD'),

    time: z.string()
      .regex(/^\d{2}:\d{2}$/, 'Formato de hora deve ser HH:mm')
      .refine((t) => {
        const [hour, minute] = t.split(':').map(Number);
        // Regra: 09:00 às 20:00 (Geral) — Sábados e Domingo tratamos noutro nível se necessário, 
        // mas aqui trancamos a porta física contra bots.
        return hour >= 9 && hour < 20;
      }, { message: "O Estúdio Braz apenas opera entre as 09:00 e as 20:00." }),

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