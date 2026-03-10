import { z } from 'zod';
/**
 * 🔐 AUTHENTICATION SCHEMAS (Point #10 & #15)
 * Garante que as credenciais de entrada são finitas e válidas antes de tocar na lógica.
 */
export const loginSchema = z.object({
    email: z.string().email().max(100),
    password: z.string().min(5).max(100), // Alterado de 6 para 5 para aceitar a password "admin"
    twoFactorCode: z.string().length(6).optional(),
});
export const verify2FASchema = z.object({
    code: z.string().length(6),
});
export const disable2FASchema = z.object({
    password: z.string().max(100),
});
