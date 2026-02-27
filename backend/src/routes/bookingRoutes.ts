import express from 'express';
import { createBooking, getBusySlots, getAllBookings } from '../controllers/bookingController';
import { protect } from '../middleware/authMiddleware';
import validate from '../middleware/validateResource';
import { createBookingSchema } from '../schemas/bookingSchema';

const router = express.Router();

// Pública: Consultar horários
router.get('/check', getBusySlots);

// Pública: Criar agendamento (Agora com INSPECÇÃO DE CARGA)
router.post('/', validate(createBookingSchema), createBooking);

// Privada: Ver agenda total (Protegida pelo Diretor)
router.get('/', protect, getAllBookings);

export default router;