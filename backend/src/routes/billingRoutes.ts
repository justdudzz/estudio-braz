import express from 'express';
import { protect, adminOnly, authorize } from '../middleware/authMiddleware.js';
import { downloadSaft, getMonthlyReport } from '../controllers/billingController.js';

const router = express.Router();

// Apenas Mariana ou Contabilistas podem baixar SAFT-T
router.get('/saft', protect, authorize('SUPER_ADMIN', 'ACCOUNTANT'), downloadSaft);

// Relatório mensal para Mariana e Contabilistas
router.get('/report', protect, authorize('SUPER_ADMIN', 'ACCOUNTANT'), getMonthlyReport);

export default router;
