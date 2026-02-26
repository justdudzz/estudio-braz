import { Handler } from '@netlify/functions';
import crypto from 'crypto';

/**
 * CONFIGURAÇÕES DE SOBERANIA
 * O uso de 'throw' garante que a função não inicie sem a chave mestre.
 */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET_NOT_FOUND. A soberania da rede foi comprometida.');
}

const COOKIE_NAME = 'braz_session_token';
const SESSION_DURATION = 14400; // 4 Horas - Equilíbrio entre luxo e segurança

// --- UTILITÁRIOS CRIPTOGRÁFICOS ---

const signJWT = (payload: object): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ 
    ...payload, 
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION 
  })).toString('base64url');
  
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
};

const verifyJWT = (token: string): any | null => {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    
    return payload;
  } catch {
    return null;
  }
};

// --- HANDLER PRINCIPAL ---

export const handler: Handler = async (event) => {
  const method = event.httpMethod;
  const isProd = process.env.NODE_ENV === 'production';

  // Cabeçalhos de Segurança Reforçados (Fusão de ambas as versões)
  const securityHeaders = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
  };

  try {
    // 1. POST: Login / Emissão de Sessão
    if (method === 'POST') {
      const { email } = JSON.parse(event.body || '{}');

      // Tabela da Verdade (Simulação de DB)
      let identity = null;
      if (email === process.env.ADMIN_EMAIL || email === 'admin@estudiobraz.pt') {
        identity = { id: '000', email, name: 'Mariana Braz', role: 'admin' };
      } else if (email === 'maria.antunes@example.com') {
        identity = { id: '101', email, name: 'Maria Antunes', role: 'client' };
      }

      if (!identity) {
        // Mitigação de Timing Attacks
        await new Promise(resolve => setTimeout(resolve, 500));
        return { 
          statusCode: 401, 
          headers: securityHeaders, 
          body: JSON.stringify({ error: 'AUTH_REJECTED' }) 
        };
      }

      const token = signJWT(identity);
      const cookieHeader = `${COOKIE_NAME}=${token}; HttpOnly; ${isProd ? 'Secure;' : ''} Path=/; SameSite=Strict; Max-Age=${SESSION_DURATION}`;

      return {
        statusCode: 200,
        headers: { ...securityHeaders, 'Set-Cookie': cookieHeader },
        body: JSON.stringify({ 
          user: { name: identity.name, role: identity.role } // Nonce: Não expõe IDs sensíveis no JSON
        })
      };
    }

    // 2. GET: Validação de Estado
    if (method === 'GET') {
      const cookieHeader = event.headers.cookie || '';
      const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      const token = match ? match[1] : null;

      if (!token) {
        return { 
          statusCode: 401, 
          headers: securityHeaders, 
          body: JSON.stringify({ error: 'VACUUM_STATE' }) 
        };
      }

      const decodedIdentity = verifyJWT(token);
      if (!decodedIdentity) {
        return { 
          statusCode: 401, 
          headers: { 
            ...securityHeaders, 
            'Set-Cookie': `${COOKIE_NAME}=; HttpOnly; ${isProd ? 'Secure;' : ''} Path=/; SameSite=Strict; Max-Age=0` 
          }, 
          body: JSON.stringify({ error: 'SESSION_EXPIRED_OR_CORRUPTED' }) 
        };
      }

      return { 
        statusCode: 200, 
        headers: securityHeaders, 
        body: JSON.stringify({ user: decodedIdentity }) 
      };
    }

    // 3. DELETE: Logout (Aniquilação)
    if (method === 'DELETE') {
      return {
        statusCode: 200,
        headers: { 
          ...securityHeaders, 
          'Set-Cookie': `${COOKIE_NAME}=; HttpOnly; ${isProd ? 'Secure;' : ''} Path=/; SameSite=Strict; Max-Age=0` 
        },
        body: JSON.stringify({ status: 'ANNIHILATED' })
      };
    }

    return { statusCode: 405, headers: securityHeaders, body: JSON.stringify({ error: 'METHOD_VOID' }) };

  } catch (error) {
    return { 
      statusCode: 500, 
      headers: securityHeaders, 
      body: JSON.stringify({ error: 'INTERNAL_CRITICAL_ERROR' }) 
    };
  }
};