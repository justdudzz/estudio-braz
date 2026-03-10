import logger from '../utils/logger.js';
export const sendNotification = async (to, name, message, type) => {
    // Aqui é onde ligaríamos a API do Twilio ou SendGrid
    // Por agora, o Cérebro regista a intenção no log de segurança
    logger.info(`[NOTIFICAÇÃO ${type.toUpperCase()}] Enviada para ${name} (${to}): ${message}`);
    // Simulação de sucesso
    return true;
};
