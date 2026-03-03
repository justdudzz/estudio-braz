import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isBlacklisted } from '../utils/tokenBlacklist.js';

// Configuração JWT (#12)
const JWT_VERIFY_OPTIONS = {
  issuer: 'studio-braz-api',
  audience: 'studio-braz-client',
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. PRIORIDADE: Ler token do cookie httpOnly (#1)
  if (req.cookies && req.cookies.braz_token) {
    token = req.cookies.braz_token;
  }
  // 2. FALLBACK: Authorization header (para Postman / desenvolvimento)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Nenhuma chave mestre fornecida.' });
  }

  try {
    // 3. Verificar a assinatura + claims do token (#12)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, JWT_VERIFY_OPTIONS) as any;

    // 4. Verificar se o token foi revogado (logout) (#13)
    if (decoded.jti && isBlacklisted(decoded.jti)) {
      return res.status(401).json({ message: 'Sessão terminada. Faça login novamente.' });
    }

    // 5. Verificar CSRF para requests que modificam dados (#5)
    const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (unsafeMethods.includes(req.method)) {
      const csrfCookie = req.cookies?.braz_csrf;
      const csrfHeader = req.headers['x-csrf-token'];

      if (csrfCookie && csrfHeader && csrfCookie === csrfHeader) {
        // CSRF válido
      } else if (!csrfCookie && !csrfHeader) {
        // Sem CSRF configurado (fallback para Authorization header / desenvolvimento)
      } else {
        return res.status(403).json({ message: 'Proteção CSRF ativa. Pedido rejeitado.' });
      }
    }

    // 6. Adiciona os dados do utilizador ao pedido
    (req as any).user = decoded;

    return next();
  } catch (error) {
    console.error('Falha na validação do Token:', error);
    return res.status(401).json({ message: 'Acesso negado. Chave mestre inválida ou expirada.' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user && user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: 'Acesso negado. Apenas o Diretor pode entrar aqui.' });
};