import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import logger from '../utils/logger';

// --- 1. LOGIN DO DIRETOR (ADMIN) ---
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Busca o utilizador real no PostgreSQL (Tabela User)
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais de elite inválidas.' });
    }

    // Compara a password encriptada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais de elite inválidas.' });
    }

    // Gera o Token com o ID e ROLE reais da DB
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'braz_secret_key_2026',
      { expiresIn: '30d' } // Admin fica logado 30 dias
    );

    // Resposta limpa
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

    logger.info(`Diretor autenticado: ${user.email}`);

  } catch (error: any) {
    logger.error(`Erro no Login Admin: ${error.message}`);
    res.status(500).json({ message: 'Erro interno na fortaleza.' });
  }
};

// --- 2. LOGIN PARA CLIENTES VIP ---
export const clientLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Passo A: Procurar a cliente na tabela Client
    const client = await prisma.client.findUnique({ 
      where: { email } 
    });

    // Passo B: Verificar se a cliente existe e se já tem uma password definida
    if (!client || !client.password) {
      return res.status(401).json({ message: 'Acesso VIP não configurado ou cliente inexistente.' });
    }

    // Passo C: Comparar a password digitada com a encriptada na Base de Dados
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais VIP incorretas.' });
    }

    // Passo D: Criar o Token VIP. 
    // AJUSTE DE ELITE: O Client não tem 'role' na DB, por isso definimos manualmente como 'client' aqui
    const token = jwt.sign(
      { id: client.id, role: 'client' }, 
      process.env.JWT_SECRET || 'braz_secret_key_2026',
      { expiresIn: '7d' } // Cliente fica logada menos tempo por segurança, mas o suficiente para conveniência
    );

    // Passo E: Devolver os dados ao Frontend
    res.json({
      token,
      user: { // Padronizado como 'user' para o teu AuthContext (Frontend) entender mais facilmente
        id: client.id,
        name: client.name,
        email: client.email,
        role: 'client',
        tier: client.tier,
        points: client.points
      }
    });

    logger.info(`Cliente VIP online: ${client.email}`);

  } catch (error: any) {
    logger.error(`Erro no Login VIP: ${error.message}`);
    res.status(500).json({ message: 'Erro ao aceder ao Salão VIP.' });
  }
};