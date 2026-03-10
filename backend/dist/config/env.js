import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.string().default('5000'),
    DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres para segurança de elite'),
    CORS_ORIGINS: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    ADMIN_SEED_PASSWORD: z.string().optional(),
});
export const validateEnv = () => {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('❌ ERRO DE CONFIGURAÇÃO: Variáveis de ambiente inválidas:');
        console.error(JSON.stringify(parsed.error.format(), null, 2));
        process.exit(1);
    }
    return parsed.data;
};
export const env = validateEnv();
