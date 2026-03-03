import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

const isProduction = process.env.NODE_ENV === 'production';

// Configuração de cookies segura
const COOKIE_OPTIONS = {
  httpOnly: true,                    // Inacessível via JavaScript (#1)
  secure: isProduction,              // Apenas HTTPS em produção
  sameSite: 'strict' as const,       // Proteção CSRF nativa
  path: '/',
};

// Gerar CSRF token (#5)
const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Configuração JWT (#12)
const JWT_OPTIONS = {
  issuer: 'studio-braz-api',
  audience: 'studio-braz-client',
};

// --- 1. LOGIN DO DIRETOR (ADMIN) ---
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Log de tentativa falhada com IP (#10)
      logger.warn(`Login admin falhado — email inexistente: ${email} | IP: ${clientIp}`);
      return res.status(401).json({ message: 'Credenciais de elite inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login admin falhado — password errada: ${email} | IP: ${clientIp}`);
      return res.status(401).json({ message: 'Credenciais de elite inválidas.' });
    }

    // Gera o Token com claims de segurança (#12)
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      {
        expiresIn: '30d',
        ...JWT_OPTIONS
      }
    );

    // Calcula expiresAt para o frontend (#2)
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 dias em ms

    // Gera token CSRF (#5)
    const csrfToken = generateCsrfToken();

    // Define o JWT como httpOnly cookie (#1)
    res.cookie('braz_token', token, {
      ...COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    });

    // Define o CSRF token como cookie legível pelo frontend (#5)
    res.cookie('braz_csrf', csrfToken, {
      httpOnly: false,  // O frontend PRECISA de ler este
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Resposta SEM o token no body (#1)
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      expiresAt, // Para o frontend saber quando expira (#2)
    });

    logger.info(`Diretor autenticado: ${user.email} | IP: ${clientIp}`);

  } catch (error: any) {
    logger.error(`Erro no Login Admin: ${error.message}`);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// --- 2. LOGIN PARA CLIENTES VIP ---
export const clientLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const client = await prisma.client.findUnique({
      where: { email }
    });

    if (!client || !client.password) {
      logger.warn(`Login VIP falhado — cliente inexistente: ${email} | IP: ${clientIp}`);
      return res.status(401).json({ message: 'Acesso VIP não configurado ou cliente inexistente.' });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      logger.warn(`Login VIP falhado — password errada: ${email} | IP: ${clientIp}`);
      return res.status(401).json({ message: 'Credenciais VIP incorretas.' });
    }

    const token = jwt.sign(
      { id: client.id, role: 'client', email: client.email },
      process.env.JWT_SECRET!,
      {
        expiresIn: '7d',
        ...JWT_OPTIONS
      }
    );

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 dias

    const csrfToken = generateCsrfToken();

    // Cookie httpOnly para o token (#1)
    res.cookie('braz_token', token, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Cookie CSRF legível (#5)
    res.cookie('braz_csrf', csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: client.id,
        name: client.name,
        email: client.email,
        role: 'client',
        tier: client.tier,
        points: client.points
      },
      expiresAt,
    });

    logger.info(`Cliente VIP online: ${client.email} | IP: ${clientIp}`);

  } catch (error: any) {
    logger.error(`Erro no Login VIP: ${error.message}`);
    res.status(500).json({ message: 'Erro ao aceder ao Salão VIP.' });
  }
};

// --- 3. LOGOUT (Limpar cookies + blacklist) ---
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('braz_token', { path: '/' });
  res.clearCookie('braz_csrf', { path: '/' });

  logger.info('Sessão terminada com sucesso.');
  res.json({ message: 'Sessão encerrada com segurança.' });
};