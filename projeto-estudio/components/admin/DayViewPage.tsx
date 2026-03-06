import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Clock, Euro, CheckCircle2, Check, X, MessageCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminData } from '../../contexts/AdminDataContext';
import { SERVICES_CONFIG } from '../../utils/constants';
import { updateBookingStatus, deleteBooking } from '../../src/services/bookingService';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmContext';

// Componente Cartão (Extraído para fora de DayViewPage para não perder o "focus" no input de preço)
const BookingCard = React.memo(({
    booking,
    type,
    prices,
    processingId,
    getBasePrice,
    handlePriceChange,
    handleWhatsApp,
    handleCancel,
    handleConfirm,
    handleCheckout
}: any) => {
    const basePrice = getBasePrice(booking.service);
    const currentVal = prices[booking.id] !== undefined ? prices[booking.id] : String(basePrice);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-[#121212] border p-5 rounded-2xl relative overflow-hidden group transition-all ${
                type === 'pendente' ? 'border-yellow-500/20 hover:border-yellow-500/50' :
                type === 'confirmado' ? 'border-braz-gold/20 hover:border-braz-gold/50' :
                type === 'pago' ? 'border-emerald-500/20 hover:border-emerald-500/50' :
                'border-red-500/20 hover:border-red-500/50 opacity-60'
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shadow-inner ${
                        type === 'pendente' ? 'bg-yellow-500/10 text-yellow-500' :
                        type === 'confirmado' ? 'bg-braz-gold/10 text-braz-gold' :
                        type === 'pago' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-red-500/10 text-red-500'
                    }`}>
                        {booking.client?.name?.charAt(0).toUpperCase() || <User size={18} />}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-wide truncate max-w-[140px]">
                            {booking.client?.name || 'Sem Nome'}
                        </h3>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">{booking.time} • {booking.client?.phone || 'Sem Nmr'}</p>
                    </div>
                </div>
                {/* Ações Topo Direito */}
                <div className="flex gap-1">
                    {booking.client?.phone && (
                        <button onClick={() => handleWhatsApp(booking.client, booking)} className="p-1.5 text-white/30 hover:text-[#25D366] transition-colors rounded-lg hover:bg-white/5">
                            <MessageCircle size={14} />
                        </button>
                    )}
                    {type === 'confirmado' && (
                        <button onClick={() => handleCancel(booking.id)} title="Cancelar Marcação" className="p-1.5 text-white/30 hover:text-red-500 transition-colors rounded-lg hover:bg-white/5">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white/[0.02] rounded-xl p-3 mb-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40 uppercase font-bold tracking-widest text-[9px]">Serviço</span>
                    <span className="text-white/80 font-medium text-right max-w-[120px] truncate" title={booking.service}>
                        {SERVICES_CONFIG[booking.service as keyof typeof SERVICES_CONFIG]?.label || booking.service}
                    </span>
                </div>
                {booking.notes && (
                    <div className="flex items-start gap-1 text-[10px] text-white/30 bg-white/[0.02] p-2 rounded-lg">
                        <FileText size={10} className="mt-0.5 text-braz-gold/40 flex-shrink-0" />
                        <span className="line-clamp-2 leading-relaxed">{booking.notes}</span>
                    </div>
                )}
            </div>

            {/* Área de Ação Específica da Coluna */}
            {type === 'pendente' && (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleCancel(booking.id)}
                        className="w-1/3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent transition-all py-2.5 rounded-xl font-black uppercase tracking-widest flex justify-center items-center text-xs"
                        title="Rejeitar"
                    >
                        <X size={16} />
                    </button>
                    <button
                        onClick={() => handleConfirm(booking.id)}
                        className="w-2/3 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 hover:border-transparent transition-all py-2.5 rounded-xl font-black uppercase tracking-widest flex justify-center items-center gap-2 text-xs"
                    >
                        <Check size={16} /> Aceitar
                    </button>
                </div>
            )}

            {type === 'confirmado' && (
                <div className="space-y-3">
                    <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                        <input
                            type="number" step="0.01" value={currentVal}
                            onChange={(e) => handlePriceChange(booking.id, e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white font-black focus:outline-none focus:border-braz-gold transition-colors text-right"
                        />
                    </div>
                    <button
                        onClick={() => handleCheckout(booking)}
                        disabled={processingId === booking.id}
                        className="w-full bg-braz-gold/10 hover:bg-braz-gold text-braz-gold hover:text-black border border-braz-gold/20 hover:border-transparent transition-all py-2.5 rounded-xl font-black uppercase tracking-widest flex justify-center items-center gap-2 text-xs"
                    >
                        {processingId === booking.id ? (
                            <div className="w-4 h-4 border-2 border-braz-gold border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>FECHAR CONTA <CheckCircle2 size={16} /></>
                        )}
                    </button>
                </div>
            )}

            {type === 'cancelado' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex justify-center text-sm font-black uppercase tracking-widest">
                    <span>CANCELADO</span>
                </div>
            )}
        </motion.div>
    );
});

const DayViewPage: React.FC = () => {
    const { date } = useParams<{ date: string }>();
    const navigate = useNavigate();
    const { bookings, loading, refreshData } = useAdminData();
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    // Estado para checkout
    const [prices, setPrices] = useState<Record<string, string>>({});
    const [processingId, setProcessingId] = useState<string | null>(null);

    const formattedDate = useMemo(() => {
        if (!date) return '';
        try {
            const d = new Date(`${date}T12:00:00Z`);
            return d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch { return date; }
    }, [date]);

    // Filtra todas as marcações do dia (ignorando bloqueios)
    const dayBookings = useMemo(() => {
        return bookings
            .filter(b => b.date === date && b.status !== 'blocked')
            .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    }, [bookings, date]);

    // Separação em triagem
    const pendentes = dayBookings.filter(b => b.status === 'pending');
    const confirmados = dayBookings.filter(b => b.status === 'confirmed');
    const pagos = dayBookings.filter(b => b.status === 'paid' || b.status === 'completed');
    const cancelados = dayBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected');

    // MÉTODOS DE ACÇÃO passados para o BookingCard
    const handleConfirm = async (id: string) => {
        try {
            await updateBookingStatus(id, 'confirmed');
            showToast('Reserva confirmada!', 'success');
            await refreshData(true);
        } catch { showToast('Erro ao confirmar.', 'error'); }
    };

    const handleCancel = (id: string) => {
        confirm({
            title: 'Cancelar Marcação',
            message: 'Tem a certainty que quer CANCELAR esta marcação? O horário ficará livre para outras pessoas e um email de aviso será enviado se houver endereço registado.',
            type: 'danger',
            confirmText: 'Sim, Cancelar',
            onConfirm: async () => {
                try {
                    await updateBookingStatus(id, 'cancelled');
                    showToast('Marcação cancelada.', 'warning');
                    await refreshData(true);
                } catch { showToast('Erro ao cancelar.', 'error'); }
            }
        });
    };

    const handleWhatsApp = (client: any, booking: any) => {
        if (!client?.phone) { showToast('Sem contacto móvel.', 'warning'); return; }
        let num = client.phone.replace(/\D/g, '');
        if (num.length === 9) num = '351' + num;
        const msg = `Olá ${client.name}! Studio Braz aqui. Resta alguma dúvida sobre a marcação do dia ${booking.date} às ${booking.time}?`;
        window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handlePriceChange = (id: string, value: string) => {
        setPrices(prev => ({ ...prev, [id]: value }));
    };

    const getBasePrice = (service: string) => SERVICES_CONFIG[service as keyof typeof SERVICES_CONFIG]?.price || 0;

    const handleCheckout = async (booking: any) => {
        const inputVal = prices[booking.id];
        const finalPrice = inputVal !== undefined && inputVal !== '' ? parseFloat(inputVal) : getBasePrice(booking.service);

        if (isNaN(finalPrice) || finalPrice < 0) {
            showToast('Por favor, introduza um valor válido.', 'warning');
            return;
        }

        confirm({
            title: 'Confirmar Pagamento',
            message: `Confirmar o pagamento de €${finalPrice} para ${booking.client?.name}?`,
            type: 'success',
            confirmText: 'Pagar',
            onConfirm: async () => {
                setProcessingId(booking.id);
                try {
                    await updateBookingStatus(booking.id, 'paid', finalPrice);
                    showToast(`Pagamento registado no valor de €${finalPrice}`, 'success');
                    await refreshData(true);
                } catch {
                    showToast('Erro ao fechar pagamento.', 'error');
                } finally {
                    setProcessingId(null);
                    setPrices(prev => ({ ...prev, [booking.id]: '' }));
                }
            }
        });
    };

    // Só exibe spinner geral de ecrã inteiro se não houver NENHUM dado em cache (evita ecrã piscar)
    if (loading && bookings.length === 0) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-2 border-braz-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const cardProps = {
        prices, processingId, getBasePrice, handlePriceChange,
        handleWhatsApp, handleCancel, handleConfirm, handleCheckout
    };

    return (
        <div className="font-montserrat pb-12 relative">
            {/* Header / Navegação */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 sticky top-0 md:relative z-20 shadow-xl">
                <div>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/40 hover:text-braz-gold transition-colors text-xs font-bold uppercase tracking-widest mb-3">
                        <ArrowLeft size={14} /> Voltar à Visão Central
                    </button>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Calendar className="text-braz-gold" size={24} /> Triagem do Dia
                        {loading && bookings.length > 0 && (
                            <div className="w-4 h-4 ml-2 border-2 border-braz-gold border-t-transparent rounded-full animate-spin" />
                        )}
                    </h1>
                    <p className="text-white/60 text-sm mt-1 capitalize font-medium">{formattedDate}</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-center bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Faturação do Dia</p>
                        <p className="text-lg font-black text-emerald-400">
                            €{pagos.reduce((acc, b) => acc + (b.totalPrice || getBasePrice(b.service)), 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quadro Kanban / Triagem */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* COLUNA 1: PENDENTES */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                        <h2 className="text-xs font-black uppercase tracking-widest text-yellow-500 flex items-center gap-2">
                            <Clock size={16} /> Pendentes
                        </h2>
                        <span className="bg-yellow-500 text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full">
                            {pendentes.length}
                        </span>
                    </div>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {pendentes.map(b => <BookingCard key={b.id} booking={b} type="pendente" {...cardProps} />)}
                        </AnimatePresence>
                        {pendentes.length === 0 && (
                            <div className="text-center p-8 border border-white/5 border-dashed rounded-2xl text-white/20 text-xs uppercase tracking-widest font-bold">
                                Sem pendentes
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUNA 2: CONFIRMADOS / EM CURSO */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-braz-gold/10 border border-braz-gold/20 p-4 rounded-xl shadow-[0_0_15px_rgba(197,160,89,0.1)]">
                        <h2 className="text-xs font-black uppercase tracking-widest text-braz-gold flex items-center gap-2">
                            <User size={16} /> Hoje no Estúdio
                        </h2>
                        <span className="bg-braz-gold text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full">
                            {confirmados.length}
                        </span>
                    </div>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {confirmados.map(b => <BookingCard key={b.id} booking={b} type="confirmado" {...cardProps} />)}
                        </AnimatePresence>
                        {confirmados.length === 0 && (
                            <div className="text-center p-8 border border-white/5 border-dashed rounded-2xl text-white/20 text-xs uppercase tracking-widest font-bold">
                                Sem clientes para faturar
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUNA 3: PAGOS / CONCLUÍDOS */}
                <div className="flex flex-col gap-4 opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                        <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 size={16} /> Finalizados & Pagos
                        </h2>
                        <span className="bg-emerald-500 text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full">
                            {pagos.length}
                        </span>
                    </div>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {pagos.map(b => <BookingCard key={b.id} booking={b} type="pago" {...cardProps} />)}
                        </AnimatePresence>
                        {pagos.length === 0 && (
                            <div className="text-center p-8 border border-white/5 border-dashed rounded-2xl text-white/20 text-xs uppercase tracking-widest font-bold">
                                Sem serviços concluídos
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUNA 4: CANCELADOS */}
                <div className="flex flex-col gap-4 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                        <h2 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                            <X size={16} /> Cancelados
                        </h2>
                        <span className="bg-red-500 text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full">
                            {cancelados.length}
                        </span>
                    </div>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {cancelados.map(b => <BookingCard key={b.id} booking={b} type="cancelado" {...cardProps} />)}
                        </AnimatePresence>
                        {cancelados.length === 0 && (
                            <div className="text-center p-8 border border-white/5 border-dashed rounded-2xl text-white/20 text-xs uppercase tracking-widest font-bold">
                                Sem cancelamentos
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DayViewPage;
