import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '../common/Toast';
import { SERVICES_CONFIG } from '../../utils/constants';
import api from '../../src/services/api';

interface EditBookingModalProps {
    booking: any;
    onClose: () => void;
    onSaved: () => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({ booking, onClose, onSaved }) => {
    const { showToast } = useToast();
    const [form, setForm] = useState({
        service: booking.service || '',
        date: booking.date || '',
        time: booking.time || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await api.put(`/bookings/${booking.id}`, form);
            showToast('Booking atualizado com sucesso!', 'success');
            onSaved();
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Erro ao atualizar.';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#121212] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black uppercase tracking-tighter">Editar Booking</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X size={18} className="text-white/40" />
                    </button>
                </div>

                {/* Client Info (read-only) */}
                <div className="bg-white/5 p-3 rounded-xl mb-5">
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Cliente</p>
                    <p className="text-sm font-bold">{booking.client?.name || 'N/A'}</p>
                </div>

                <div className="space-y-4">
                    {/* Service */}
                    <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">Serviço</label>
                        <select
                            value={form.service}
                            onChange={(e) => setForm({ ...form, service: e.target.value })}
                            className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50 appearance-none"
                        >
                            {Object.entries(SERVICES_CONFIG).map(([key, config]) => (
                                <option key={key} value={key} className="bg-[#121212]">{config.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">Data</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50 [color-scheme:dark]"
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">Hora</label>
                        <input
                            type="time"
                            value={form.time}
                            onChange={(e) => setForm({ ...form, time: e.target.value })}
                            className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50 [color-scheme:dark]"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                            <AlertTriangle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 py-3 text-xs font-bold uppercase text-white/40 hover:text-white transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-braz-gold text-black py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Save size={14} />
                            {saving ? 'A guardar...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default EditBookingModal;
