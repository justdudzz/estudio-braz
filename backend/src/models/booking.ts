import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  service: { 
    type: String, 
    required: true,
    enum: ['Microblading', 'Limpeza de Pele', 'Unhas de Gel', 'Verniz Gel', 'Massagem', 'Depilacao'] 
  },
  date: { type: String, required: true }, // Formato YYYY-MM-DD
  time: { type: String, required: true }, // Formato HH:mm
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'confirmed' 
  },
  createdAt: { type: Date, default: Date.now }
});

// Índice para evitar agendamentos duplicados no mesmo horário (Segurança de Baixo Nível)
bookingSchema.index({ date: 1, time: 1 }, { unique: true });

export default mongoose.model('Booking', bookingSchema);