import prisma from '../config/prisma.js';
/**
 * 🛡️ BLACKLIST PERSISTENTE (SQL)
 * Garante que tokens invalidados (logout) continuam inválidos mesmo
 * que o servidor reinicie.
 */
export const blacklistToken = async (token, expiresAt) => {
    await prisma.tokenBlacklist.upsert({
        where: { token },
        update: { expiresAt },
        create: { token, expiresAt }
    });
};
export const isBlacklisted = async (token) => {
    const found = await prisma.tokenBlacklist.findUnique({
        where: { token }
    });
    return !!found;
};
