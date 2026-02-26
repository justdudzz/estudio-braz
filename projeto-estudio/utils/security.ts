/**
 * utils/security.ts
 */

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.replace(/[<>]/g, '').trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Adiciona esta função que está a causar o erro:
export const checkRateLimit = (key: string, limit: number): boolean => {
  const now = Date.now();
  const windowMs = 60000; // Janela de 1 minuto
  const storageKey = `rate_limit_${key}`;
  
  const data = JSON.parse(localStorage.getItem(storageKey) || '{"count": 0, "timestamp": 0}');
  
  if (now - data.timestamp > windowMs) {
    localStorage.setItem(storageKey, JSON.stringify({ count: 1, timestamp: now }));
    return true;
  }
  
  if (data.count >= limit) return false;
  
  data.count += 1;
  localStorage.setItem(storageKey, JSON.stringify(data));
  return true;
};