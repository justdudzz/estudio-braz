// backend/src/utils/tokenBlacklist.ts
// In-memory token blacklist para suportar logout no servidor
// Para produção com múltiplas instâncias, substituir por Redis

const blacklistedTokens = new Set<string>();

export const blacklistToken = (tokenId: string): void => {
    blacklistedTokens.add(tokenId);
};

export const isBlacklisted = (tokenId: string): boolean => {
    return blacklistedTokens.has(tokenId);
};

// Limpeza automática a cada hora (evita memory leak em long-running servers)
setInterval(() => {
    blacklistedTokens.clear();
}, 60 * 60 * 1000); // 1 hora — tokens expirados já não passam no jwt.verify()
