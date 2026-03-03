import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Search, Check, X, MessageCircle, ChevronLeft, ChevronRight, Edit2, Euro } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { updateBookingStatus, deleteBooking } from '../../src/services/bookingService';
import { useToast } from '../common/Toast';
import { useAdminData } from '../../contexts/AdminDataContext';
import { StatusBadge } from './ui/Badges';
import { TableSkeleton } from './ui/Skeletons';
import { SERVICES_CONFIG } from '../../utils/constants';
import BookingFormModal from './BookingFormModal';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos', color: 'text-white/60' },
    { value: 'pending', label: 'Pendentes', color: 'text-yellow-400' },
    { value: 'confirmed', label: 'Confirmados', color: 'text-green-400' },
    { value: 'paid', label: 'Pagos', color: 'text-braz-gold' },
    { value: 'cancelled', label: 'Cancelados', color: 'text-red-400' },
    { value: 'blocked', label: 'Bloqueados', color: 'text-orange-400' },
];

const ITEMS_PER_PAGE = 15;

const BookingsTable: React.FC = () => {
    const { bookings, loading, refreshData } = useAdminData();
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingBooking, setEditingBooking] = useState<any>(null);
    const { showToast } = useToast();

    // Filters
    const filtered = bookings
        .filter(b => statusFilter === 'all' || b.status === statusFilter)
        .filter(b => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (
                b.client?.name?.toLowerCase().includes(term) ||
                b.client?.email?.toLowerCase().includes(term) ||
                b.service?.toLowerCase().includes(term) ||
                b.date?.includes(term)
            );
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleConfirm = async (id: string) => {
        try {
            await updateBookingStatus(id, 'confirmed');
            showToast('Confirmado!', 'success');
            await refreshData();
        } catch { showToast('Erro.', 'error'); }
    };

    const handleMarkAsPaid = async (id: string, currentStatus: string) => {
        if (currentStatus === 'paid') return;
        try {
            await updateBookingStatus(id, 'paid');
            showToast('Marcado como Pago!', 'success');
            await refreshData();
        } catch { showToast('Erro.', 'error'); }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Tem certeza que quer eliminar este booking?');
        if (!confirmed) return;
        try {
            await deleteBooking(id);
            showToast('Eliminado.', 'success');
            await refreshData();
        } catch { showToast('Erro.', 'error'); }
    };

    const openWhatsApp = (client: any, booking: any) => {
        if (!client?.phone) { showToast('Sem contacto.', 'warning'); return; }
        let num = client.phone.replace(/\D/g, '');
        if (num.length === 9) num = '351' + num;
        const label = SERVICES_CONFIG[booking.service as keyof typeof SERVICES_CONFIG]?.label || booking.service;
        window.open(`https://wa.me/${num}?text=${encodeURIComponent(`Olá ${client.name}! Studio Braz — Confirmação: ${label} dia ${booking.date} às ${booking.time}`)}`, '_blank');
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Agenda Completa</h1>
                <span className="text-xs text-white/30 font-semibold">{filtered.length} bookings</span>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                        type="text"
                        placeholder="Pesquisar cliente, serviço, data..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-braz-gold/50 transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${statusFilter === opt.value
                                ? 'bg-braz-gold/10 border-braz-gold/30 text-braz-gold'
                                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-widest text-white/30 bg-white/[0.03]">
                                <th className="p-4 font-semibold">Cliente</th>
                                <th className="p-4 font-semibold">Serviço</th>
                                <th className="p-4 font-semibold">Data</th>
                                <th className="p-4 font-semibold">Hora</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-0">
                                        <div className="animate-pulse space-y-4 p-4">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="w-48 h-4 bg-white/5 rounded-full" />
                                                    <div className="w-32 h-4 bg-white/5 rounded-full" />
                                                    <div className="w-24 h-4 bg-white/5 rounded-full" />
                                                    <div className="w-12 h-4 bg-white/5 rounded-full" />
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-white/20 text-sm">
                                        Nenhum booking encontrado.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map(b => (
                                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div>
                                                <p className="text-sm font-bold text-white">{b.client?.name || '—'}</p>
                                                <p className="text-[10px] text-white/30">{b.client?.email || ''}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-white/70">
                                            {SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.label || b.service}
                                        </td>
                                        <td className="p-4 text-sm text-white/50 font-mono">{b.date}</td>
                                        <td className="p-4 text-sm text-white/50 font-mono">{b.time}</td>
                                        <td className="p-4"><StatusBadge status={b.status as any} /></td>
                                        <td className="p-4">
                                            <div className="flex gap-1.5 justify-end">
                                                {b.status === 'pending' && (
                                                    <button onClick={() => handleConfirm(b.id)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-sm" title="Confirmar">
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                                {b.status === 'confirmed' && (
                                                    <button onClick={() => handleMarkAsPaid(b.id, b.status)} className="p-2 bg-braz-gold/10 text-braz-gold rounded-lg hover:bg-braz-gold hover:text-black transition-all shadow-[0_0_10px_rgba(197,160,89,0.2)]" title="Marcar como Pago">
                                                        <Euro size={14} />
                                                    </button>
                                                )}
                                                <button onClick={() => setEditingBooking(b)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Editar">
                                                    <Edit2 size={14} />
                                                </button>
                                                {b.client?.phone && (
                                                    <button onClick={() => openWhatsApp(b.client, b)} className="p-2 bg-white/5 text-white/40 rounded-lg hover:bg-[#25D366] hover:text-white transition-all shadow-sm" title="WhatsApp">
                                                        <MessageCircle size={14} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(b.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Eliminar">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-white/5">
                        <span className="text-[10px] text-white/20 uppercase tracking-wider">
                            Página {currentPage} de {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all disabled:opacity-20"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all disabled:opacity-20"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingBooking && (
                    <BookingFormModal
                        booking={editingBooking}
                        onClose={() => setEditingBooking(null)}
                        onSaved={refreshData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookingsTable;
