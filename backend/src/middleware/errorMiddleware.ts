// backend/src/middleware/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.ts';

// Apanha rotas que não existem
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Não Encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Gestor de erros global
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Regista o erro no seu ficheiro de logs privado
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

  res.status(statusCode).json({
    message: err.message,
    // Em desenvolvimento, mostramos onde o erro ocorreu; em produção escondemos.
    stack: process.env.NODE_ENV === 'production' ? '🔒' : err.stack,
  });
};