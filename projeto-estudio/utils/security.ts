/**
 * Soberania Ontológica: Limpeza de dependências e falsos estados no frontend.
 * O Rate Limiting foi migrado na totalidade para as Edge Functions.
 */

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.replace(/[<>]/g, '').trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};