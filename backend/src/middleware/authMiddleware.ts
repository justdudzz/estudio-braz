// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.ts';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verifica a validade da chave configurada no seu .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta_reserva');
      
      // Se chegar aqui, o acesso é permitido
      (req as any).user = decoded;
      next();
    } catch (error) {
      logger.error('Tentativa de acesso não autorizado detectada.');
      res.status(401).json({ message: 'Acesso negado: Token inválido.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Acesso negado: Sem autorização.' });
  }
};