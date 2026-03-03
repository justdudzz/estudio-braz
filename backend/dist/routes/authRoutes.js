import express from 'express';
import { login, clientLogin, logout } from '../controllers/authController.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
// Rota de Login do Diretor (protegida por limite de tentativas)
router.post('/login', loginLimiter, login);
// Rota de Login VIP para Clientes (protegida por limite de tentativas)
router.post('/client-login', loginLimiter, clientLogin);
// Rota de Logout — limpa cookies e invalida sessão (#13)
router.post('/logout', protect, logout);
export default router;
