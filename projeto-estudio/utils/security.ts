/**
 * Utilitários de Segurança para o Estúdio Braz
 */
export const sanitizeInput = (input: string) => input.replace(/[<>]/g, '');

export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const checkRateLimit = (key: string, limit: number) => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rate_${key}`) || '[]');
  const validAttempts = attempts.filter((timestamp: number) => now - timestamp < 60000);
  
  if (validAttempts.length >= limit) return false;
  
  validAttempts.push(now);
  localStorage.setItem(`rate_${key}`, JSON.stringify(validAttempts));
  return true;
};