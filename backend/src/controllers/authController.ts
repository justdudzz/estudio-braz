import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma'; // O nosso novo motor SQL
import logger from '../utils/logger';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Procura o Diretor na tabela User do PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais de elite inválidas.' });
    }

    // Verifica a chave mestra encriptada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais de elite inválidas.' });
    }

    // Gera o Token de Acesso Soberano
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'braz_secret_key',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error: any) {
    logger.error(`Erro no Login SQL: ${error.message}`);
    res.status(500).json({ message: 'Erro interno na fortaleza.' });
  }
};
// Login para Clientes VIP
export const clientLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const client = await prisma.client.findUnique({ where: { email } });

    // Se a cliente não tiver password (primeiro acesso), enviamos erro específico
    if (!client || !client.password) {
      return res.status(401).json({ message: 'Acesso VIP não configurado ou cliente inexistente.' });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais VIP incorretas.' });
    }

    const token = jwt.sign(
      { id: client.id, role: 'client' },
      process.env.JWT_SECRET || 'braz_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      client: {
        id: client.id,
        name: client.name,
        tier: client.tier,
        points: client.points
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao aceder ao Salão VIP.' });
  }
};