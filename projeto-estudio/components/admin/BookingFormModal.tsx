import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../common/Toast';
import { SERVICES_CONFIG } from '../../utils/constants';
import api from '../../src/services/api';

interface BookingFormModalProps {
    booking?: any; // If provided, we are in "Edit" mode
    onClose: () => void;
    onSaved: () => void;
}

const BookingFormModal: React.FC<BookingFormModalProps> = ({ booking, onClose, onSaved }) => {
    const isEdit = !!booking;
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        clientName: booking?.client?.name || '',
        clientEmail: booking?.client?.email || '',
        clientPhone: booking?.client?.phone || '',
        service: booking?.service || 'Microblading',
        date: booking?.date || new Date().toISOString().split('T')[0],
        time: booking?.time || '14:00',
        notes: booking?.notes || '',
        status: booking?.status || 'confirmed'
    });

    // Extra services state (edit mode)
    const [extras, setExtras] = useState<{ service: string; price: number }[]>(() => {
        try { return booking?.extraServices ? JSON.parse(booking.extraServices) : []; }
        catch { return []; }
    });
    const [newExtra, setNewExtra] = useState({ service: '', price: 0 });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const addExtra = () => {
        if (!newExtra.service || newExtra.price <= 0) return;
        setExtras(prev => [...prev, { ...newExtra }]);
        setNewExtra({ service: '', price: 0 });
    };

    const removeExtra = (i: number) => setExtras(prev => prev.filter((_, idx) => idx !== i));

    // Calculate total price
    const basePrice = SERVICES_CONFIG[formData.service as keyof typeof SERVICES_CONFIG]?.price || 0;
    const extrasTotal = extras.reduce((acc, e) => acc + e.price, 0);
    const totalPrice = basePrice + extrasTotal;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isEdit && (!formData.clientName || !formData.date || !formData.time)) {
            showToast('Preencha os campos obrigatórios.', 'warning');
            return;
        }

        try {
            setLoading(true);

            if (isEdit) {
                // UPDATE
                await api.put(`/bookings/${booking.id}`, {
                    service: formData.service,
                    date: formData.date,
                    time: formData.time,
                    status: formData.status,
                    notes: formData.notes,
                    extraServices: extras.length > 0 ? JSON.stringify(extras) : null,
                    totalPrice: extras.length > 0 ? totalPrice : null,
                });
                showToast('Reserva atualizada com sucesso!', 'success');
            } else {
                // CREATE — flat payload matching backend createBooking
                await api.post('/bookings', {
                    name: formData.clientName,
                    email: formData.clientEmail || null,
                    phone: formData.clientPhone || null,
                    service: formData.service,
                    date: formData.date,
                    time: formData.time,
                });
                showToast('Reserva criada com sucesso!', 'success');
            }

            onSaved();
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message || `Erro ao ${isEdit ? 'atualizar' : 'criar'} reserva.`;
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/[0.02] shrink-0">
                    <h2 className="font-black text-braz-gold uppercase tracking-widest text-sm">
                        {isEdit ? 'Editar Reserva' : 'Nova Marcação / Bloqueio'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 overflow-y-auto">
                    {/* Read-Only Client Info in Edit Mode */}
                    {isEdit && (
                        <div className="bg-white/5 p-4 rounded-xl mb-2 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Cliente</p>
                                <p className="text-sm font-black text-white">{booking.client?.name || 'N/A'}</p>
                            </div>
                        </div>
                    )}

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Data *</label>
                            <input
                                type="date" name="date" required
                                value={formData.date} onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-braz-gold/50 [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Hora *</label>
                            <input
                                type="time" name="time" required
                                value={formData.time} onChange={handleChange}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-braz-gold/50 [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Client Details fields ONLY when creating */}
                    {!isEdit && (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Nome ou Motivo *</label>
                                <input
                                    type="text" name="clientName" required
                                    placeholder="Ex: Joana Silva ou 'Férias'"
                                    value={formData.clientName} onChange={handleChange}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-braz-gold/50"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Email (Opcional)</label>
                                <input
                                    type="email" name="clientEmail"
                                    placeholder="Ex: joana@email.com"
                                    value={formData.clientEmail} onChange={handleChange}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-braz-gold/50"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Telemóvel (Opcional)</label>
                                <input
                                    type="tel" name="clientPhone"
                                    placeholder="Ex: 910000000"
                                    value={formData.clientPhone} onChange={handleChange}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-braz-gold/50"
                                />
                            </div>
                        </>
                    )}

                    {/* Service */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Serviço *</label>
                        <select
                            name="service" required
                            value={formData.service} onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-braz-gold/50 appearance-none"
                        >
                            {Object.entries(SERVICES_CONFIG).map(([key, service]) => (
                                <option key={key} value={key} className="bg-[#121212]">{service.label}</option>
                            ))}
                            <option value="block" className="bg-[#121212]">Bloquear Horário (Pausa)</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Estado</label>
                        <select
                            name="status"
                            value={formData.status} onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-braz-gold/50 appearance-none"
                        >
                            <option value="pending" className="bg-[#121212]">Pendente</option>
                            <option value="confirmed" className="bg-[#121212]">Confirmado</option>
                            <option value="paid" className="bg-[#121212]">Pago</option>
                            <option value="blocked" className="bg-[#121212]">Bloqueado</option>
                            <option value="cancelled" className="bg-[#121212]">Cancelado</option>
                        </select>
                    </div>

                    {/* Notes (always visible) */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Notas Privadas</label>
                        <textarea
                            name="notes"
                            placeholder="Ex: Prefere gel hipoalergénico, alergia a latex..."
                            value={formData.notes} onChange={handleChange}
                            rows={2}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-braz-gold/50 resize-none"
                        />
                    </div>

                    {/* Extra Services (edit mode only) */}
                    {isEdit && (
                        <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Serviços Adicionais</label>
                            {extras.map((ex, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="flex-1 text-xs text-white/70">{ex.service}</span>
                                    <span className="text-xs font-bold text-braz-gold">€{ex.price}</span>
                                    <button type="button" onClick={() => removeExtra(i)} className="p-1 text-red-400/50 hover:text-red-400">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <input
                                    type="text" placeholder="Serviço extra"
                                    value={newExtra.service}
                                    onChange={(e) => setNewExtra(prev => ({ ...prev, service: e.target.value }))}
                                    className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-braz-gold/50"
                                />
                                <div className="relative w-20">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 text-xs">€</span>
                                    <input
                                        type="number" placeholder="0"
                                        value={newExtra.price || ''}
                                        onChange={(e) => setNewExtra(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-6 pr-2 py-2 text-xs text-white focus:outline-none focus:border-braz-gold/50"
                                    />
                                </div>
                                <button type="button" onClick={addExtra} className="p-2 bg-braz-gold/10 text-braz-gold rounded-lg hover:bg-braz-gold/20 transition-colors">
                                    <Plus size={14} />
                                </button>
                            </div>
                            {(extras.length > 0 || basePrice > 0) && (
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Total</span>
                                    <span className="text-sm font-black text-braz-gold">€{totalPrice}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                            <AlertTriangle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/5 flex gap-3">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 py-3 text-xs font-bold text-white/40 uppercase tracking-wider hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="flex-[2] bg-braz-gold text-black py-3 px-6 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Save size={14} />
                            {loading ? 'A Guardar...' : (isEdit ? 'Guardar Alterações' : 'Criar Reserva')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default BookingFormModal;
