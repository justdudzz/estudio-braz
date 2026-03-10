import { Router } from 'express';
import { StaffController } from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
const router = Router();
/**
 * 👩‍💼 Rotas de Gestão de Equipa
 * Apenas Mariana (SUPER_ADMIN) pode criar/apagar/editar.
 */
// Listar todas as funcionárias (pode ser usado para ver quem atende)
router.get('/', protect, StaffController.getAll);
// Criar ou Atualizar funcionária (Só Mariana)
router.post('/upsert', protect, authorize('SUPER_ADMIN'), StaffController.upsert);
// Remover funcionária (Só Mariana)
router.delete('/:id', protect, authorize('SUPER_ADMIN'), StaffController.delete);
export default router;
