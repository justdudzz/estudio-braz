import React, { useState } from 'react';
import { RefreshCw, Search, Plus, Filter } from 'lucide-react';
import { updateBookingStatus, deleteBooking, restoreBooking } from '../../src/services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import { useAdminData } from '../../contexts/AdminDataContext';
import { SERVICES_CONFIG } from '../../utils/constants';
import { openWhatsApp } from '../../utils/whatsapp';

// Sub-components
import DashboardMetrics from './DashboardMetrics';
import CalendarView from './CalendarView';
import BookingFormModal from './BookingFormModal';


const AdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();
  const { bookings, loading, refreshData } = useAdminData();
  const diretorNome = user?.email ? user.email.split('@')[0] : 'Diretor';

  // --- FILTER LOGIC ---
  const filteredBookings = React.useMemo(() => {
    return bookings.filter(b => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = b.client?.name?.toLowerCase().includes(term) ||
        b.client?.phone?.includes(searchTerm) ||
        b.client?.email?.toLowerCase().includes(term);
      const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [bookings, searchTerm, filterStatus]);

  // --- METRICS ---
  const metrics = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'blocked' && b.status !== 'cancelled');
    const pending = bookings.filter(b => b.status === 'pending');

    const todayRevenue = todayBookings
      .filter(b => b.status === 'confirmed' || b.status === 'paid')
      .reduce((acc, b) => {
        if (b.totalPrice) return acc + b.totalPrice;
        const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
        return acc + (config?.price || 0);
      }, 0);

    return {
      revenue: todayRevenue,
      todayCount: todayBookings.length,
      pendingCount: pending.length,
    };
  }, [bookings]);

  // --- ACTIONS ---
  const handleConfirm = async (id: string) => {
    try {
      await updateBookingStatus(id, 'confirmed');
      showToast('Booking confirmado com sucesso!', 'success');
      await refreshData(true);
    } catch (err) {
      showToast('Erro ao confirmar booking.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Tem certeza que quer eliminar este booking?');
    if (!confirmed) return;
    try {
      await deleteBooking(id);
      showToast('Booking eliminado.', 'warning', {
        label: 'Desfazer',
        onClick: async () => {
          try {
            await restoreBooking(id);
            showToast('Booking restaurado.', 'success');
            await refreshData(true);
          } catch {
            showToast('Erro ao restaurar.', 'error');
          }
        }
      });
      await refreshData(true);
    } catch (err) {
      showToast('Erro ao eliminar booking.', 'error');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await updateBookingStatus(id, 'paid');
      showToast('Booking marcado como pago!', 'success');
      await refreshData(true);
    } catch (err) {
      showToast('Erro ao marcar como pago.', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Sala de Comando</h1>
          <p className="text-braz-gold text-xs font-bold uppercase tracking-widest mt-1">
            Diretor <span className="text-white capitalize">{diretorNome}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-braz-gold text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white transition-all shadow-lg shadow-braz-gold/20"
          >
            <Plus size={16} /> Nova Marcação
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Pesquisar cliente ou telemóvel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121212] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-braz-gold/50 transition-colors"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-[#121212] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-braz-gold/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">Todos os Estados</option>
            <option value="pending">Aguardam Decisão</option>
            <option value="confirmed">Confirmados</option>
            <option value="paid">Pagos</option>
            <option value="blocked">Bloqueados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Metrics */}
      <DashboardMetrics metrics={metrics} isLoading={loading} />

      {/* Calendar */}
      <CalendarView
        bookings={filteredBookings}
        isLoading={loading}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
        onWhatsApp={openWhatsApp}
        onMarkPaid={handleMarkPaid}
      />

      {/* Modals */}
      {isModalOpen && (
        <BookingFormModal
          onClose={() => setIsModalOpen(false)}
          onSaved={() => { setIsModalOpen(false); refreshData(true); }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
