import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../src/services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import api from '../../src/services/api';
import { SERVICES_CONFIG } from '../../utils/constants';

// Sub-components
import DashboardMetrics from './DashboardMetrics';
import CalendarView from './CalendarView';

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();
  const diretorNome = user?.email ? user.email.split('@')[0] : 'Diretor';

  // --- LOAD DATA ---
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [bookingsRes] = await Promise.all([
        getAllBookings(),
      ]);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.data || []);
    } catch (err) {
      showToast('Erro ao carregar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- METRICS ---
  const metrics = (() => {
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const pending = bookings.filter(b => b.status === 'pending');
    const totalRevenue = confirmed.reduce((acc, b) => {
      const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
      return acc + (config?.price || 0);
    }, 0);
    return {
      revenue: totalRevenue,
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      totalBookings: bookings.filter(b => b.status !== 'blocked').length
    };
  })();

  // --- ACTIONS ---
  const handleConfirm = async (id: string) => {
    try {
      await updateBookingStatus(id, 'confirmed');
      showToast('Booking confirmado com sucesso!', 'success');
      await fetchAllData();
    } catch (err) {
      showToast('Erro ao confirmar booking.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Tem certeza que quer eliminar este booking?');
    if (!confirmed) return;
    try {
      await deleteBooking(id);
      showToast('Booking eliminado.', 'success');
      await fetchAllData();
    } catch (err) {
      showToast('Erro ao eliminar booking.', 'error');
    }
  };



  const openWhatsApp = (client: any, booking: any) => {
    if (!client?.phone) { showToast('Cliente sem contacto.', 'warning'); return; }
    let cleanNumber = client.phone.replace(/\D/g, '');
    if (cleanNumber.length === 9) cleanNumber = '351' + cleanNumber;
    const config = SERVICES_CONFIG[booking.service as keyof typeof SERVICES_CONFIG];
    const msg = `Olá ${client.name}! ✨ Studio Braz aqui. Confirmamos para ${config?.label || booking.service} dia ${booking.date} às ${booking.time}?`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Sala de Comando</h1>
          <p className="text-braz-pink text-xs font-bold uppercase tracking-widest mt-1">
            Diretor <span className="text-white capitalize">{diretorNome}</span>
          </p>
        </div>
        <button
          onClick={fetchAllData}
          className="p-3 bg-white/5 rounded-xl hover:text-braz-pink border border-white/5 transition-all"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Metrics */}
      <DashboardMetrics metrics={metrics} />

      {/* Calendar */}
      <CalendarView
        bookings={bookings}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
        onWhatsApp={openWhatsApp}
      />
    </div>
  );
};

export default AdminDashboard;