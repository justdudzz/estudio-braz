import rateLimit from 'express-rate-limit';
// Limitador Geral: Protege o servidor contra excesso de tráfego
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de 15 minutos
    max: 100, // Limite de 100 pedidos por IP
    message: {
        message: 'Demasiados pedidos vindos deste IP. Por favor, tente mais tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Limitador de Login: Proteção máxima contra brute-force
export const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // Janela de 1 hora
    max: 5, // Apenas 5 tentativas de login por hora
    message: {
        message: 'Demasiadas tentativas de login. Acesso bloqueado por 1 hora por segurança.'
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
