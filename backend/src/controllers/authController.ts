import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
// @ts-ignore
import { authenticator } from '@otplib/preset-default';
import qrcode from 'qrcode';
import { sendSecurityAuditEmail } from '../services/emailService.js';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';
import { isValidNIF } from '../utils/nifValidator.js';
import { loginSchema, verify2FASchema, disable2FASchema } from '../schemas/authSchema.js';
import { blacklistToken } from '../utils/tokenBlacklist.js';

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
    // Logging de auditoria via Logger centralizado
    logger.info(`🔑 Tentativa de login iniciada para: ${email} | IP: ${clientIp}`);
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ [Login] Utilizador não encontrado: ${email}`);
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

      // Verificação com tolerância temporal
      const isValid = authenticator.verify({
        token: twoFactorCode,
        secret: user.twoFactorSecret!
      });

      logger.info(`Validando 2FA - UID: ${user.id} | Result: ${isValid}`);

      if (!isValid) {
        logger.warn(`Login admin 2FA falhado — código inválido: ${email} | IP: ${clientIp}`);
        return res.status(401).json({ message: 'Código de Segurança (2FA) inválido.' });
      }
    }

    // Gera o Token com claims de segurança (#12)
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        jti: crypto.randomUUID() // ID Único da Sessão para revogação (#4)
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '7d', // Reduzido de 30 para 7 dias para maior segurança
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
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        legalName: (user as any).legalName,
        nif: (user as any).nif
      },
      expiresAt, // Para o frontend saber quando expira (#2)
    });

    logger.info(`Utilizador autenticado (${user.role}): ${user.email} | IP: ${clientIp}`);

  } catch (error: any) {
    logger.error(`Erro no Login: ${error.message}`);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// --- NOVA ROTA: OBTER DADOS DO UTILIZADOR ATUAL (VALIDAÇÃO DE SESSÃO) ---
export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        displayName: true,
        photoUrl: true,
        lastName: true,
        isTwoFactorEnabled: true,
        nif: true,
        legalName: true,
        clientId: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    res.json({ user });
  } catch (error: any) {
    logger.error(`Erro no GetMe: ${error.message}`);
    res.status(500).json({ message: 'Erro interno ao validar sessão.' });
  }
};

// --- 2. LOGIN PARA CLIENTES COM CONTA ---
export const clientLogin = async (req: Request, res: Response) => {
  // Chamamos a mesma lógica de login, pois agora o User é unificado.
  return login(req, res);
};

// --- 3. LOGOUT ---
export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.braz_token;
  
  if (token) {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.jti) {
        // Blacklist o token até ele expirar naturalmente
        const expiresAt = new Date((decoded.exp || 0) * 1000);
        await blacklistToken(decoded.jti, expiresAt);
        logger.info(`Token jti:${decoded.jti} revogado (Logout).`);
      }
    } catch (err) {
      logger.warn('Falha ao processar blacklist no logout.');
    }
  }

  res.clearCookie('braz_token', COOKIE_OPTIONS);
  res.clearCookie('braz_csrf', COOKIE_OPTIONS);
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
    const secret = authenticator.generateSecret();

    // Salva o segredo (Ainda desativado até verificação)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, isTwoFactorEnabled: false }
    });

    // Gera Link para APP (Google Authenticator)
    const otpauth = authenticator.keyuri(user.email, 'Studio Braz', secret);

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

    // Verificação inicial
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    logger.info(`Ativação 2FA - UID: ${userId} | Result: ${isValid}`);

    if (!isValid) {
      return res.status(400).json({ message: 'Código inválido. Tente novamente.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true }
    });

    // 🛡️ SECURITY AUDIT (#19)
    await sendSecurityAuditEmail('ATIVAÇÃO DE 2FA', user.email, 'Autenticação de Segundo Fator ativada com sucesso pelo utilizador.');

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

    // 🛡️ SECURITY AUDIT (#19)
    await sendSecurityAuditEmail('DESATIVAÇÃO DE 2FA', user.email, 'CUIDADO: Autenticação de Segundo Fator foi DESATIVADA após confirmação de password.');

    logger.info(`2FA desativado para UID: ${userId}`);
    res.json({ message: 'Autenticação de Dois Fatores (2FA) desativada com sucesso.' });
  } catch (err: any) {
    logger.error(`Erro ao desativar 2FA: ${err.message}`);
    res.status(500).json({ message: 'Erro interno ao desativar o 2FA.' });
  }
};

// --- 7. LISTAR UTILIZADORES (SUPER ADMIN ONLY) ---
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao listar utilizadores.' });
  }
};

// --- 8. REGISTAR STAFF/ADMIN (SUPER ADMIN ONLY) ---
export const registerStaff = async (req: Request, res: Response) => {
  const { email, password, role, legalName, nif } = req.body;
  
  if (nif && !isValidNIF(nif)) {
    return res.status(400).json({ message: 'O NIF fornecido é matematicamente inválido.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await (prisma.user as any).create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'ADMIN_STAFF',
        legalName,
        nif
      }
    });
    res.status(201).json({ message: 'Utilizador criado com sucesso.', id: user.id });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao criar utilizador.' });
  }
};

// --- 9. ATUALIZAR UTILIZADOR (SUPER ADMIN ONLY ou Próprio Utilizador) ---
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { displayName, photoUrl, bio, role, legalName, nif, phone, address, services } = req.body;
  const requester = (req as any).user;

  if (nif && !isValidNIF(nif)) {
    return res.status(400).json({ message: 'O NIF fornecido é matematicamente inválido.' });
  }

  try {
    // Apenas Super Admin pode mudar Role ou editar outros utilizadores
    if (requester.role !== 'SUPER_ADMIN' && requester.id !== id) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const data: any = {
      displayName,
      photoUrl,
      bio,
      legalName,
      nif,
      phone,
      address
    };

    if (requester.role === 'SUPER_ADMIN' && role) {
      data.role = role;
    }

    // Gestão de Serviços (Muitos-para-Muitos)
    if (services && Array.isArray(services)) {
      data.providedServices = {
        set: services.map((sId: string) => ({ id: sId }))
      };
    }

    const updatedUser = await (prisma.user as any).update({
      where: { id },
      data,
      include: { providedServices: true }
    });

    res.json({ message: 'Utilizador atualizado com sucesso.', user: updatedUser });
  } catch (error: any) {
    logger.error(`Erro ao atualizar utilizador: ${error.message}`);
    res.status(500).json({ message: 'Erro ao atualizar dados do utilizador.' });
  }
};

// --- 10. OBTER PERFIL (Público ou Privado) ---
export const getUserProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await (prisma.user as any).findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        photoUrl: true,
        bio: true,
        role: true,
        providedServices: true
      }
    });

    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao obter perfil.' });
  }
};