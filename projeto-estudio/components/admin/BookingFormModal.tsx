import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertTriangle } from 'lucide-react';
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
        service: booking?.service || 'makeup-express',
        date: booking?.date || new Date().toISOString().split('T')[0],
        time: booking?.time || '14:00',
        notes: booking?.notes || '',
        status: booking?.status || 'confirmed'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

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
                    status: formData.status
                });
                showToast('Reserva atualizada com sucesso!', 'success');
            } else {
                // CREATE
                const payload = {
                    client: {
                        name: formData.clientName,
                        email: formData.clientEmail || `${formData.clientName.replace(/\s+/g, '').toLowerCase()}@walkin.local`,
                        phone: formData.clientPhone,
                    },
                    service: formData.service,
                    date: formData.date,
                    time: formData.time,
                    notes: formData.notes,
                    status: formData.status
                };
                await api.post('/bookings', payload);
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
