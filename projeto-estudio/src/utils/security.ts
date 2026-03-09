/**
 * utils/security.ts — Segurança de Elite
 */

// 🛡️ Sanitização Completa contra XSS (#14)
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  return input
    // Remove tags HTML
    .replace(/<[^>]*>/g, '')
    // Remove javascript: protocol
    .replace(/javascript\s*:/gi, '')
    // Remove data: protocol (pode conter scripts)
    .replace(/data\s*:/gi, '')
    // Remove event handlers inline (onclick, onerror, onload, etc.)
    .replace(/\bon\w+\s*=/gi, '')
    // Remove expressões CSS (expression())
    .replace(/expression\s*\(/gi, '')
    // Remove url() em CSS que pode conter javascript
    .replace(/url\s*\(/gi, '')
    // Remove caracteres de controlo unicode
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove encoded variants (&lt; &gt; &#x3C; etc.)
    .replace(/&(lt|gt|amp|quot|#x?[0-9a-fA-F]+);?/gi, '')
    .trim();
};

// 📧 Validação de Email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 🔑 Política de Password para Clientes VIP (#11)
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password deve ter no mínimo 8 caracteres.' };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: 'Password deve conter pelo menos uma letra.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password deve conter pelo menos um número.' };
  }
  return { valid: true, message: '' };
};

// ⏱️ Rate Limiting no Frontend (mantido, mas com melhores defaults)
export const checkRateLimit = (key: string, limit: number): boolean => {
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
  const storageKey = `rate_limit_${key}`;

  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{"count": 0, "timestamp": 0}');

    if (now - data.timestamp > windowMs) {
      localStorage.setItem(storageKey, JSON.stringify({ count: 1, timestamp: now }));
      return true;
    }

    if (data.count >= limit) return false;

    data.count += 1;
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch {
    return true; // Em caso de erro no storage, não bloquear o utilizador
  }
};