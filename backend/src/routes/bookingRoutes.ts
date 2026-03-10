import express from 'express';
import {
  createBooking,
  getBusySlots,
  getAllBookings,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  restoreBooking,
  blockSchedule,
  batchDeleteBlocks,
  getTopClients,
  getAllClients,
  exportClientsCSV,
  updateClient,
  getClientProfile
} from '../controllers/bookingController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { validateIdParam } from '../middleware/validateMiddleware.js';
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
router.get('/clients/export-csv', protect, adminOnly, exportClientsCSV);
router.get('/clients/:id', protect, adminOnly, validateIdParam(), getClientProfile);
router.put('/clients/:id', protect, adminOnly, validateIdParam(), updateClient);

// ==========================================
// 🔒 ROTAS ADMIN — Bookings
// ==========================================
router.get('/top-clients', protect, adminOnly, getTopClients);
router.post('/block', protect, adminOnly, blockSchedule);
router.post('/batch-delete', protect, adminOnly, batchDeleteBlocks);
router.get('/', protect, adminOnly, getAllBookings);
router.patch('/:id/status', protect, adminOnly, validateIdParam(), validate(updateBookingStatusSchema), updateBookingStatus);
router.patch('/:id/restore', protect, adminOnly, validateIdParam(), restoreBooking);
router.put('/:id', protect, adminOnly, validateIdParam(), updateBooking);
router.delete('/:id', protect, adminOnly, validateIdParam(), deleteBooking);

export default router;