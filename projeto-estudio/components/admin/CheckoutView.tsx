import React, { useState } from 'react';
import { Calendar, Clock, Euro, CheckCircle2, User, Search, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateBookingStatus } from '../../src/services/bookingService';
import { useToast } from '../common/Toast';
import { useAdminData } from '../../contexts/AdminDataContext';
import { SERVICES_CONFIG } from '../../utils/constants';

const CheckoutView: React.FC = () => {
    const { bookings, loading, refreshData } = useAdminData();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Estado local para os preços faturados que a Mariana introduzir
    const [prices, setPrices] = useState<Record<string, string>>({});

    // Apenas marcações "Confirmadas" prontas para pagamento
    const confirmedBookings = bookings
        .filter(b => b.status === 'confirmed')
        .filter(b => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (
                b.client?.name?.toLowerCase().includes(term) ||
                b.service?.toLowerCase().includes(term) ||
                b.date?.includes(term)
            );
        })
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    // Obter o preço base recomendado
    const getBasePrice = (service: string) => {
        return SERVICES_CONFIG[service as keyof typeof SERVICES_CONFIG]?.price || 0;
    };

    const handlePriceChange = (id: string, value: string) => {
        setPrices(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckout = async (booking: any) => {
        // Preço final (Se a Mariana não digitou nada, usa o preço base)
        const inputVal = prices[booking.id];
        const finalPrice = inputVal !== undefined && inputVal !== ''
            ? parseFloat(inputVal)
            : getBasePrice(booking.service);

        if (isNaN(finalPrice) || finalPrice < 0) {
            showToast('Por favor, introduza um valor válido.', 'warning');
            return;
        }

        const confirmed = window.confirm(`Confirmar o pagamento de €${finalPrice} para ${booking.client?.name}?`);
        if (!confirmed) return;

        setProcessingId(booking.id);
        try {
            await updateBookingStatus(booking.id, 'paid', finalPrice);
            showToast(`Pagamento de €${finalPrice} registado com sucesso!`, 'success');
            await refreshData(true);
        } catch (error) {
            showToast('Erro ao validar pagamento.', 'error');
            console.error(error);
        } finally {
            setProcessingId(null);
            setPrices(prev => ({ ...prev, [booking.id]: '' }));
        }
    };

    return (
        <div className="font-montserrat">
            {/* Cabecalho */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Store className="text-braz-gold" size={24} /> Última Verificação (Fecho)
                    </h1>
                    <p className="text-white/40 text-sm mt-1">
                        Verifique os agendamentos confirmados, ajuste o valor final se necessário e valide os pagamentos.
                    </p>
                </div>
            </div>

            {/* Barra de Pesquisa */}
            <div className="relative max-w-md mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                    type="text"
                    placeholder="Pesquisar cliente ou data (ex: 2026-03-05)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-braz-gold/50 transition-colors"
                />
            </div>

            {/* Loading State */}
            {loading && confirmedBookings.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-2 border-braz-gold border-t-transparent rounded-full animate-spin" />
                </div>
            ) : confirmedBookings.length === 0 ? (
                <div className="bg-[#121212] border border-white/5 rounded-3xl p-12 text-center">
                    <CheckCircle2 size={48} className="text-white/10 mx-auto mb-4" />
                    <h3 className="text-white font-black uppercase tracking-widest text-lg mb-2">Tudo em dia!</h3>
                    <p className="text-white/40 text-sm">Não há marcações "Confirmadas" pendentes de pagamento no momento.</p>
                </div>
            ) : (
                /* Grelha de Cartões de Checkout */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {confirmedBookings.map((booking) => {
                            const basePrice = getBasePrice(booking.service);
                            const currentVal = prices[booking.id] !== undefined ? prices[booking.id] : String(basePrice);

                            return (
                                <motion.div
                                    key={booking.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    className="bg-[#121212] border border-white/10 hover:border-braz-gold/50 transition-all rounded-2xl p-6 relative group overflow-hidden"
                                >
                                    {/* Efeito Glow Topo */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-braz-gold/0 via-braz-gold to-braz-gold/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Cabeçalho do Cartão */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-braz-gold font-black shadow-inner">
                                                {booking.client?.name?.charAt(0).toUpperCase() || <User size={18} />}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-sm tracking-wide truncate max-w-[150px]">
                                                    {booking.client?.name || 'Cliente Sem Nome'}
                                                </h3>
                                                <p className="text-[10px] text-white/40 font-mono mt-0.5">{booking.client?.phone || 'Sem TV'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalhes do Serviço */}
                                    <div className="space-y-3 mb-6 bg-white/[0.02] rounded-xl p-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/40 font-bold uppercase tracking-wider">Serviço</span>
                                            <span className="text-white font-semibold">
                                                {SERVICES_CONFIG[booking.service as keyof typeof SERVICES_CONFIG]?.label || booking.service}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/40 font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Calendar size={12} /> Data
                                            </span>
                                            <span className="text-white font-mono">{booking.date}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/40 font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Clock size={12} /> Hora
                                            </span>
                                            <span className="text-white font-mono">{booking.time}</span>
                                        </div>
                                    </div>

                                    {/* Input de Preço e Botão */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-braz-gold uppercase tracking-widest pl-1 mb-1 block">
                                                Valor Cobrado (€)
                                            </label>
                                            <div className="relative">
                                                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={currentVal}
                                                    onChange={(e) => handlePriceChange(booking.id, e.target.value)}
                                                    className="w-full bg-black/50 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white text-lg font-black focus:outline-none focus:border-braz-gold transition-colors text-right font-mono"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <p className="text-[9px] text-emerald-400 mt-1 pl-1 italic">
                                                *O valor base do serviço é €{basePrice.toFixed(2)}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleCheckout(booking)}
                                            disabled={processingId === booking.id}
                                            className="w-full relative overflow-hidden group bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/50 hover:border-transparent transition-all duration-300 py-3 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 text-xs"
                                        >
                                            {processingId === booking.id ? (
                                                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={16} /> Confimar Pagamento
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default CheckoutView;
