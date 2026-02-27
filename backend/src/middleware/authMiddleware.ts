import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import logger from '../utils/logger';

// Extensão da interface Request para o TypeScript reconhecer o "user"
interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // 1. Verifica se o token vem no cabeçalho Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrai o token (Bearer XXXXX...)
      token = req.headers.authorization.split(' ')[1];

      // 2. Descodifica o token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'braz_secret_key');

      // 3. Procura o Diretor no PostgreSQL (SQL)
      // Usamos o select para não trazer a password, por segurança
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true }
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Acesso negado. Utilizador não encontrado na fortaleza.' });
      }

      next(); // Porta aberta: Pode prosseguir para a rota
    } catch (error) {
      logger.error('Erro de Autenticação JWT');
      res.status(401).json({ message: 'Token de acesso inválido ou expirado.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Acesso bloqueado. Sem chave de entrada.' });
  }
};

// Middleware para restringir apenas ao cargo de Admin (Diretor)
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado. Apenas o Diretor tem autoridade aqui.' });
  }
};