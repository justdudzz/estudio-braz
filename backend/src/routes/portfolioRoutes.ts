import express from 'express';
import { PortfolioController } from '../controllers/portfolioController.js';
import { protect, superAdminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Everyone can see the portfolio
router.get('/', PortfolioController.getAll);

// Protected: Only Mariana (SUPER_ADMIN)
router.post('/', protect, superAdminOnly, PortfolioController.create);
router.delete('/:id', protect, superAdminOnly, PortfolioController.delete);

export default router;
