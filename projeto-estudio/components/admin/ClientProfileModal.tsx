import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Award, Calendar, Edit2, Save } from 'lucide-react';
import { useToast } from '../common/Toast';
import api from '../../src/services/api';
import { SERVICES_CONFIG } from '../../utils/constants';

interface ClientProfileModalProps {
    clientId: string;
    onClose: () => void;
    onUpdated: () => void;
}

const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ clientId, onClose, onUpdated }) => {
    const { showToast } = useToast();
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ tier: '', points: 0 });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/bookings/clients/${clientId}`);
                setClient(res.data);
                setForm({ tier: res.data.tier || 'Bronze', points: res.data.points || 0 });
            } catch {
                showToast('Erro ao carregar perfil.', 'error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [clientId]);

    const handleSave = async () => {
        try {
            await api.put(`/bookings/clients/${clientId}`, form);
            showToast('Cliente atualizado!', 'success');
            setEditing(false);
            onUpdated();
        } catch {
            showToast('Erro ao guardar.', 'error');
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
                className="bg-[#121212] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto"
            >
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 rounded-full border-2 border-braz-pink/30 border-t-braz-pink animate-spin mx-auto" />
                    </div>
                ) : client ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-braz-pink/10 flex items-center justify-center text-braz-pink font-black text-lg">
                                    {client.name?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black">{client.name}</h2>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest">{client._count?.bookings || 0} visitas</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
                                <X size={18} className="text-white/40" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="p-6 space-y-3">
                            {client.email && (
                                <div className="flex items-center gap-3 text-sm text-white/60">
                                    <Mail size={14} className="text-white/20" /> {client.email}
                                </div>
                            )}
                            {client.phone && (
                                <div className="flex items-center gap-3 text-sm text-white/60">
                                    <Phone size={14} className="text-white/20" /> {client.phone}
                                </div>
                            )}

                            {/* Tier & Points (editable) */}
                            <div className="bg-white/5 rounded-xl p-4 mt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Fidelização</span>
                                    <button onClick={() => setEditing(!editing)} className="text-braz-pink text-[10px] font-bold uppercase flex items-center gap-1">
                                        <Edit2 size={10} /> {editing ? 'Cancelar' : 'Editar'}
                                    </button>
                                </div>

                                {editing ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[9px] text-white/20 uppercase block mb-1">Tier</label>
                                            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}
                                                className="w-full bg-white/5 p-2 rounded-lg border border-white/10 text-sm text-white outline-none">
                                                <option value="Bronze" className="bg-[#121212]">Bronze</option>
                                                <option value="Silver" className="bg-[#121212]">Silver</option>
                                                <option value="Gold" className="bg-[#121212]">Gold</option>
                                                <option value="Platinum" className="bg-[#121212]">Platinum</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-white/20 uppercase block mb-1">Pontos</label>
                                            <input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-white/5 p-2 rounded-lg border border-white/10 text-sm text-white outline-none" />
                                        </div>
                                        <button onClick={handleSave} className="w-full bg-braz-gold text-black py-2 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2">
                                            <Save size={12} /> Guardar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Award size={16} className="text-braz-pink" />
                                            <span className="font-black text-lg text-braz-pink">{client.points}</span>
                                            <span className="text-[10px] text-white/30 uppercase">pontos</span>
                                        </div>
                                        <span className="bg-braz-pink/10 text-braz-pink px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                            {client.tier || 'Bronze'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking History */}
                        <div className="p-6 border-t border-white/5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3 flex items-center gap-2">
                                <Calendar size={12} /> Histórico de Bookings
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {client.bookings?.length > 0 ? client.bookings.map((b: any) => (
                                    <div key={b.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                                        <div>
                                            <p className="text-xs font-semibold">{SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.label || b.service}</p>
                                            <p className="text-[10px] text-white/30">{b.date} às {b.time}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                                                b.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-yellow-500/10 text-yellow-400'
                                            }`}>{b.status}</span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-white/20 text-center py-4">Sem histórico.</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : null}
            </motion.div>
        </motion.div>
    );
};

export default ClientProfileModal;
