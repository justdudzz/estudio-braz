import express from 'express';
import { login, clientLogin, logout, generate2FA, verify2FA, disable2FA, getAllUsers, registerStaff, updateUser, getUserProfile } from '../controllers/authController.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota de Login do Diretor (protegida por limite de tentativas)
router.post('/login', loginLimiter, login);

// Rota de Login VIP para Clientes (protegida por limite de tentativas)
router.post('/client-login', loginLimiter, clientLogin);

// Rota de Logout — limpa cookies e invalida sessão (#13)
router.post('/logout', protect, logout);

// --- ROTAS DE SEGURANÇA EXTREMA (2FA) ---
router.post('/2fa/generate', protect, adminOnly, generate2FA);
router.post('/2fa/verify', protect, adminOnly, loginLimiter, verify2FA);
router.post('/2fa/disable', protect, adminOnly, disable2FA);

router.get('/users', protect, adminOnly, getAllUsers);
router.post('/register-staff', protect, adminOnly, registerStaff);
router.patch('/users/:id', protect, updateUser);
router.get('/profile/:id', getUserProfile);

export default router;