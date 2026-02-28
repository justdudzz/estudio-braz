import express from 'express';
import {
  createBooking,
  getBusySlots,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  blockSchedule,
  getTopClients // <-- A Inteligência VIP aqui
} from '../controllers/bookingController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import validate from '../middleware/validateResource';
import { createBookingSchema } from '../schemas/bookingSchema';

const router = express.Router();

// ==========================================
// 🔓 ROTAS PÚBLICAS (Acesso das Clientes)
// ==========================================

// Consultar horários ocupados (A Trituradora)
router.get('/check', getBusySlots);

// Criar agendamento (Validado pelo esquema Zod para não entrarem dados falsos)
router.post('/', validate(createBookingSchema), createBooking);


// ==========================================
// 🔒 ROTAS PRIVADAS (Sala de Comando - Diretor)
// ==========================================

// A PORTA VIP ABERTA! (Ranking de Elite)
router.get('/top-clients', protect, adminOnly, getTopClients);

// Bloqueio Manual da Fortaleza (Trancar Agenda)
router.post('/block', protect, adminOnly, blockSchedule);

// Ver a agenda mestre com todas as reservas
router.get('/', protect, adminOnly, getAllBookings);

// Alterar status (Confirmar reserva / Dar pontos VIP)
router.patch('/:id/status', protect, adminOnly, updateBookingStatus);

// Eliminação Definitiva (A "Trituradora" do SQL)
router.delete('/:id', protect, adminOnly, deleteBooking);

export default router;