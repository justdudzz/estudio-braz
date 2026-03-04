import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
// @ts-ignore
import { generateSecret, verify, generateURI } from 'otplib';
import qrcode from 'qrcode';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';
import { loginSchema, verify2FASchema, disable2FASchema } from '../schemas/authSchema.js';

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
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Dados de acesso inválidos.', errors: result.error.format() });
  }
  const { email, password } = result.data;
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

    // --- NOVA CAMADA: 2FA ---
    if (user.isTwoFactorEnabled) {
      const { twoFactorCode } = req.body;
      if (!twoFactorCode) {
        // Se a password está certa, mas falta o código 2FA, respondemos com 206 Partial Content
        return res.status(206).json({ message: 'Autenticação em 2 Passos necessária.', requires2FA: true });
      }

      // Verificação com tolerância temporal (2 janelas de 30s) para evitar erros de relógio
      const isValid = await verify({
        token: twoFactorCode,
        secret: user.twoFactorSecret!,
        epochTolerance: 2
      });

      logger.info(`Validando 2FA - UID: ${user.id} | Result: ${JSON.stringify(isValid)}`);

      if (!isValid || !isValid.valid) {
        logger.warn(`Login admin 2FA falhado — código inválido: ${email} | IP: ${clientIp}`);
        return res.status(401).json({ message: 'Código de Segurança (2FA) inválido.' });
      }
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
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled
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
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Dados VIP inválidos.', errors: result.error.format() });
  }
  const { email, password } = result.data;
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

// --- 4. GERAR QR CODE PARA 2FA (ADMIN ONLY) ---
export const generate2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ message: 'Admin não encontrado.' });
    if (user.isTwoFactorEnabled) {
      return res.status(400).json({ message: 'A Autenticação Avançada (2FA) já está protegida e ativada.' });
    }

    // Gera Segredo Master
    const secret = generateSecret();

    // Salva o segredo (Ainda desativado até verificação)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, isTwoFactorEnabled: false }
    });

    // Gera Link para APP (Google Authenticator)
    const otpauth = generateURI({
      issuer: 'Studio Braz',
      label: user.email,
      secret
    });

    // Gera Imagem Base64 QR
    const qrCodeImage = await qrcode.toDataURL(otpauth);
    res.json({ secret, qrCodeImage });
  } catch (err: any) {
    logger.error(`Erro ao gerar 2FA: ${err.message}`);
    res.status(500).json({ message: 'Erro ao gerar infraestrutura 2FA.' });
  }
};

// --- 5. ATIVAR 2FA (ADMIN ONLY) ---
export const verify2FA = async (req: Request, res: Response) => {
  const result = verify2FASchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Código de verificação inválido.' });
  }
  const { code } = result.data;
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: 'Pedido inválido ou 2FA já ativado.' });
    }

    // Verificação inicial com tolerância temporal
    const isValid = await verify({
      token: code,
      secret: user.twoFactorSecret,
      epochTolerance: 2
    });

    logger.info(`Ativação 2FA - UID: ${userId} | Result: ${JSON.stringify(isValid)}`);

    if (!isValid || !isValid.valid) {
      return res.status(400).json({ message: 'Código inválido. Tente novamente.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true }
    });

    res.json({ message: 'Autenticação de Dois Fatores (2FA) selada e ativada com sucesso militar.' });
  } catch (err: any) {
    logger.error(`Erro ao validar 2FA: ${err.message}`);
    res.status(500).json({ message: 'Erro interno ao validar o 2FA.' });
  }
};

// --- 6. DESATIVAR 2FA (ADMIN ONLY) ---
export const disable2FA = async (req: Request, res: Response) => {
  const result = disable2FASchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Password necessária para desativar segurança.' });
  }
  const { password } = result.data;
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ message: 'Admin não encontrado.' });
    if (!user.isTwoFactorEnabled) {
      return res.status(400).json({ message: '2FA já está desativado.' });
    }

    // Verificar password para segurança
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password incorreta. Não é possível desativar o 2FA.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null }
    });

    logger.info(`2FA desativado para UID: ${userId}`);
    res.json({ message: 'Autenticação de Dois Fatores (2FA) desativada com sucesso.' });
  } catch (err: any) {
    logger.error(`Erro ao desativar 2FA: ${err.message}`);
    res.status(500).json({ message: 'Erro interno ao desativar o 2FA.' });
  }
};