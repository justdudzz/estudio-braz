import prisma from '../config/prisma.js';
import logger from './logger.js';
/**
 * 🧹 MOTOR DE MANUTENÇÃO AUTOMÁTICA
 * Responsável por garantir que a base de dados não cresce infinitamente
 * com lixo ou registos eliminados há muito tempo.
 */
export const runMaintenance = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // 1. Hard Delete de registos na lixeira há mais de 30 dias
        const deletedBookings = await prisma.booking.deleteMany({
            where: {
                deletedAt: {
                    lt: thirtyDaysAgo,
                },
            },
        });
        if (deletedBookings.count > 0) {
            logger.info(`🧹 MANUTENÇÃO: ${deletedBookings.count} agendamentos antigos eliminados permanentemente.`);
        }
        // 2. Limpeza do Blacklist de Tokens (Tokens já expirados fisicamente)
        const deletedTokens = await prisma.tokenBlacklist.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        if (deletedTokens.count > 0) {
            logger.info(`🧹 MANUTENÇÃO: ${deletedTokens.count} tokens expirados removidos do blacklist.`);
        }
    }
    catch (error) {
        logger.error('❌ ERRO NA MANUTENÇÃO AUTOMÁTICA:', error);
    }
};
// Executa a cada 24 horas
setInterval(runMaintenance, 24 * 60 * 60 * 1000);
