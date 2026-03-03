import express from 'express';
import {
  createBooking,
  getBusySlots,
  getAllBookings,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  blockSchedule,
  batchDeleteBlocks,
  getTopClients,
  getAllClients,
  updateClient,
  getClientProfile
} from '../controllers/bookingController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createBookingSchema } from '../schemas/bookingSchema.js';
import { updateBookingStatusSchema } from '../schemas/bookingStatusSchema.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ==========================================
// 🔓 ROTAS PÚBLICAS
// ==========================================
router.get('/check', getBusySlots);
router.post('/', bookingLimiter, validate(createBookingSchema), createBooking);

// ==========================================
// 🔒 ROTAS ADMIN — Clientes (BEFORE /:id routes!)
// ==========================================
router.get('/clients', protect, adminOnly, getAllClients);
router.get('/clients/:id', protect, adminOnly, getClientProfile);
router.put('/clients/:id', protect, adminOnly, updateClient);

// ==========================================
// 🔒 ROTAS ADMIN — Bookings
// ==========================================
router.get('/top-clients', protect, adminOnly, getTopClients);
router.post('/block', protect, adminOnly, blockSchedule);
router.post('/batch-delete', protect, adminOnly, batchDeleteBlocks);
router.get('/', protect, adminOnly, getAllBookings);
router.patch('/:id/status', protect, adminOnly, validate(updateBookingStatusSchema), updateBookingStatus);
router.put('/:id', protect, adminOnly, updateBooking);
router.delete('/:id', protect, adminOnly, deleteBooking);

export default router;