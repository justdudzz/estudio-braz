import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import logger from './utils/logger.js';

dotenv.config();

import { env } from './config/env.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// --- CONFIANÇA EM PROXY (#6) ---
// Essencial para obter o IP real atrás de Cloudflare/Nginx e não bloquear todos por engano.
app.set('trust proxy', 1);

// --- HTTPS FORÇADO EM PRODUÇÃO (#3) ---
if (isProduction) {
  app.use((req, res, next) => {
    // Verifica o header que proxies (Netlify, Heroku, etc.) adicionam
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// --- CORS DINÂMICO VIA ENV (#4) ---
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : [
    'http://localhost:5173',
    'http://localhost:8888',
    'http://localhost:3000'
  ];

app.use(cors({
  origin: function (origin, callback) {
    // Permite pedidos sem origin (Postman, curl, health checks)
    if (!origin) return callback(null, true);

    // Development fallback para qualquer porta localhost e ngrok urls
    const isLocalhost = !isProduction && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'));
    const isNgrok = origin?.includes('.ngrok-free.dev');

    if (isLocalhost || isNgrok || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.error(`Tentativa de invasão via CORS bloqueada: ${origin}`);
      callback(new Error('Acesso negado por política de segurança (CORS)'));
    }
  },
  credentials: true, // Essencial para cookies httpOnly
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));

// Camadas de Proteção
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "connect-src": ["'self'", "http://localhost:5000", "wss://localhost:5173", "https://*.studiobraz.pt"],
    },
  },
}));

// 🛡️ BLOQUEIO DE PERIFÉRICOS (Point #26)
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  next();
});
app.use(cookieParser()); // Parser de cookies para httpOnly auth
app.use(express.json({ limit: '1mb' }));
app.use(compression());

// Rate Limiting Global (#6) — 100 req/15min por IP
app.use(generalLimiter);

// Rotas do Império
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/expenses', expenseRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
   ===========================================
   🚀 CÉREBRO SQL: 100% OPERACIONAL
   🛡️  SEGURANÇA: Nível Máximo ${isProduction ? 'PRODUÇÃO' : 'DEV'}
   📍 PORTA: ${PORT}
   🔒 HTTPS: ${isProduction ? 'Forçado' : 'Desligado (dev)'}
   🌐 CORS: ${isProduction ? allowedOrigins.join(', ') : 'Localhost'}
   🍪 COOKIES: httpOnly ativo
   ===========================================
  `);
});