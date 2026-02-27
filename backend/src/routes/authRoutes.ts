import express from 'express';
import { login } from '../controllers/authController'; // Nome corrigido e sem .ts
import { loginLimiter } from '../middleware/rateLimiter'; // A nossa nova blindagem

const router = express.Router();

// Rota de Login protegida por limite de tentativas (Força Bruta bloqueada)
router.post('/login', loginLimiter, login);

export default router;