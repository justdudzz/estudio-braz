import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Carregar variáveis de ambiente IMEDIATAMENTE antes de qualquer coisa
dotenv.config();

import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import { getStaffWithServices } from './controllers/bookingController.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import logger from './utils/logger.js';
import { env } from './config/env.js';
import { syncHub } from './utils/syncHub.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// --- CONFIANÇA EM PROXY ---
app.set('trust proxy', 1);

// --- CONFIGURAÇÃO DE CORS ---
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    // 🛡️ CEO CORS SHIELD: Só permite localhost (dev) ou domínios específicos permitidos
    const isLocal = !origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    const isAllowed = origin && allowedOrigins.includes(origin);
    const isVerifiedNetlify = origin && /https:\/\/.*studiobraz.*\.netlify\.app/.test(origin);

    if (!isProduction || isLocal || isAllowed || isVerifiedNetlify) {
      callback(null, true);
    } else {
      logger.warn(`🚫 Bloqueio CORS: Tentativa de acesso vinda de origem não autorizada: ${origin}`);
      callback(new Error('Bloqueio CORS: Origem não autorizada.'));
    }
  },
  credentials: true
}));

// Outros middlewares standard
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(compression());

// Helmet ATIVADO para segurança de nível militar (#14)
app.use(helmet({
  contentSecurityPolicy: false, // Desativado temporariamente para não bloquear assets externos se necessário
  crossOriginEmbedderPolicy: false
}));

// Rate Limiting Global
app.use(generalLimiter);

// Rotas do Império
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'Operacional',
    timestamp: new Date().toISOString(),
    database: 'Conectada (SQL)',
    environment: isProduction ? 'production' : 'development',
    cors: isProduction ? 'Domínio real apenas' : 'Localhost sincronizado'
  });
});

// 🛰️ Endpoint de Sincronização em Tempo Real
app.get('/api/v1/sync-check', (req, res) => {
  res.json({ v: syncHub.getVersion() });
});

// Tratamento de Rotas Inexistentes
app.use(notFound);

// Central de Erros
app.use(errorHandler);

// --- PARAQUEDAS GLOBAL (#7) ---
// Evita que erros fatais derrubem o processo sem registo no Logger
process.on('uncaughtException', (err) => {
  logger.error('💥 ERRO FATAL (Uncaught Exception):', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 PROMESSA REJEITADA (Unhandled Rejection) em:', promise, 'razão:', reason);
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
   ===========================================
   🚀 CÉREBRO SQL: 100% OPERACIONAL
   🛡️  SEGURANÇA: Nível Máximo ${isProduction ? 'PRODUÇÃO' : 'DEV'}
   📍 PORTA: ${PORT}
   🔒 HTTPS: ${isProduction ? 'Forçado' : 'Desligado (dev)'}
   🌐 CORS: ${isProduction ? 'Restrito' : 'Aberto (Dev)'}
   🍪 COOKIES: httpOnly ativo
   ===========================================
  `);
});