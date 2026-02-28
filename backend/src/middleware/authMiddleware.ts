import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1. Verifica se o token vem no cabeçalho Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extrai o token (remove a palavra 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // 3. Verifica a assinatura do token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'braz_secret_key_2026');

      // 4. Adiciona os dados do utilizador ao pedido
      (req as any).user = decoded;
      
      next();
    } catch (error) {
      console.error('Falha na validação do Token:', error);
      res.status(401).json({ message: 'Acesso negado. Chave mestre inválida.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Acesso negado. Nenhuma chave mestre fornecida.' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado. Apenas o Diretor pode entrar aqui.' });
  }
};