import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './utils/logger';

// Middlewares e Rotas (Importações limpas sem .ts)
import { notFound, errorHandler } from './middleware/errorMiddleware';
import bookingRoutes from './routes/bookingRoutes';
import authRoutes from './routes/authRoutes';
import prisma from './config/prisma'; // O novo motor soberano

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Segurança e Parsing (Nível Fortaleza)
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());

// 2. Rotas da API
// Health Check atualizado para validar a ligação com o PostgreSQL
app.get('/api/v1/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // Teste rápido de batimento cardíaco da DB
    res.status(200).json({ 
      status: 'Soberano', 
      database: 'Conectada (SQL)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'Instável', database: 'Erro de Ligação' });
  }
});

app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/auth', authRoutes);

// 3. Gestão de Erros (Resiliência de Elite)
app.use(notFound);
app.use(errorHandler);

// 4. Arranque e Monitorização
const server = app.listen(PORT, () => {
  logger.info(`Fronteira Digital Studio Braz ativa na porta ${PORT}`);
  console.log(`
  ===========================================
  🚀 CÉREBRO SQL: 100% OPERACIONAL
  🛡️  SEGURANÇA: Nível Fortaleza
  📍 PORTA: ${PORT}
  📂 MEMÓRIA: PostgreSQL + Prisma
  ===========================================
  `);
});

// 5. Encerramento Gracioso (Soberania Técnica)
// Garante que a ligação à DB fecha corretamente se o servidor for desligado
process.on('SIGTERM', async () => {
  logger.info('Sinal SIGTERM recebido. Fechando Fortaleza...');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Servidor encerrado com segurança.');
    process.exit(0);
  });
});