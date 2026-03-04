import prisma from '../config/prisma.js';

/**
 * 🛡️ BLACKLIST PERSISTENTE (SQL)
 * Garante que tokens invalidados (logout) continuam inválidos mesmo
 * que o servidor reinicie.
 */
export const blacklistToken = async (token: string, expiresAt: Date): Promise<void> => {
    await prisma.tokenBlacklist.upsert({
        where: { token },
        update: { expiresAt },
        create: { token, expiresAt }
    });
};

export const isBlacklisted = async (token: string): Promise<boolean> => {
    const found = await prisma.tokenBlacklist.findUnique({
        where: { token }
    });
    return !!found;
};
