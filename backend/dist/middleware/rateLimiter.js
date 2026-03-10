import rateLimit from 'express-rate-limit';
// Limitador Geral: Protege o servidor contra excesso de tráfego
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de 15 minutos
    max: 1000, // Aumentado para suportar o auto-refresh do dashboard a cada 30s
    message: {
        message: 'Demasiados pedidos vindos deste IP. Por favor, tente mais tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Limitador de Login: Proteção máxima contra brute-force
const isDev = process.env.NODE_ENV !== 'production';
export const loginLimiter = rateLimit({
    windowMs: isDev ? 1 * 60 * 1000 : 60 * 60 * 1000, // 1 min em dev, 1 hora em prod
    max: isDev ? 100 : 5, // 100 em dev, 5 em prod
    message: {
        message: isDev
            ? 'Demasiadas tentativas (Dev Mode). Aguarde 1 minuto.'
            : 'Demasiadas tentativas de login. Acesso bloqueado por 1 hora por segurança.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Limitador de Bookings: Impede spam de agendamentos (#6)
export const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // Máximo 10 agendamentos por hora por IP
    message: {
        message: 'Demasiados agendamentos de este IP. Aguarde 1 hora antes de tentar novamente.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
