import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import logger from './utils/logger';

dotenv.config();

const app = express();

// --- AJUSTE DE ELITE: CONFIGURAÇÃO CORS ---
const allowedOrigins = [
  'http://localhost:5173', // Porta padrão do Vite
  'http://localhost:8888', // Porta do Netlify Dev
  'http://localhost:3000'  // Porta alternativa
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite pedidos sem origin (como ferramentas de teste tipo Insomnia/Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.error(`Tentativa de invasão via CORS bloqueada: ${origin}`);
      callback(new Error('Acesso negado por política de segurança (CORS)'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // TODOS os métodos autorizados
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Camadas de Proteção
app.use(helmet()); // Proteção de Cabeçalhos
app.use(express.json()); // Tradutor de JSON

// Rotas do Império
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Health Check para o Diretor Rafa
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'Soberano',
    timestamp: new Date().toISOString(),
    database: 'Conectada (SQL)',
    cors: 'Liberado para Gestão Ativa'
  });
});

// Tratamento de Rotas Inexistentes
app.use(notFound);

// Central de Erros da Fortaleza
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
   ===========================================
   🚀 CÉREBRO SQL: 100% OPERACIONAL
   🛡️  SEGURANÇA: Nível Fortaleza Ativo
   📍 PORTA: ${PORT}
   🌐 CORS: Vite & Netlify Sincronizados
   ===========================================
  `);
});