import express from 'express';
import { createBooking, getBusySlots, getAllBookings } from '../controllers/bookingController.ts';
import { protect } from '../middleware/authMiddleware.ts'; // O nosso segurança

const router = express.Router();

// Pública: Calendário precisa de saber o que está ocupado
router.get('/check', getBusySlots);

// Pública: Clientes precisam de marcar
router.post('/', createBooking);

// PRIVADA: Só o Diretor (com Token) pode ver a lista completa
router.get('/', protect, getAllBookings);

export default router;