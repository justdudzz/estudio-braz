import express from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
const router = express.Router();
// Todas as rotas de despesas são protegidas (Admin only)
router.get('/', protect, adminOnly, getExpenses);
router.post('/', protect, adminOnly, createExpense);
router.delete('/:id', protect, adminOnly, deleteExpense);
export default router;
