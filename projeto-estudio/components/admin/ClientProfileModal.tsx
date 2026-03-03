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
    const [form, setForm] = useState({ tier: '', points: 0, notes: '' });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/bookings/clients/${clientId}`);
                setClient(res.data);
                setForm({ tier: res.data.tier || 'Bronze', points: res.data.points || 0, notes: res.data.notes || '' });
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

    const ltv = client?.bookings?.reduce((total: number, b: any) => {
        if (b.status === 'confirmed') {
            const price = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.price || 0;
            return total + price;
        }
        return total;
    }, 0) || 0;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#121212] border border-white/10 rounded-2xl max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto"
            >
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 rounded-full border-2 border-braz-gold/30 border-t-braz-gold animate-spin mx-auto" />
                    </div>
                ) : client ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#151515] to-[#121212]">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-braz-gold/20 to-transparent border border-braz-gold/20 flex items-center justify-center text-braz-gold font-black text-xl shadow-inner">
                                    {client.name?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black font-montserrat tracking-tighter text-white uppercase">{client.name}</h2>
                                    <div className="flex gap-3 text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
                                        <span>{client._count?.bookings || 0} visitas</span>
                                        <span className="text-braz-gold">{ltv}€ faturados</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X size={20} className="text-white/40 hover:text-white" />
                            </button>
                        </div>

                        {/* Info & Notes */}
                        <div className="p-6 space-y-4">
                            <div className="flex flex-col gap-2">
                                {client.email && (
                                    <div className="flex items-center gap-3 text-sm text-white/70 font-medium">
                                        <Mail size={16} className="text-white/20" /> {client.email}
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center gap-3 text-sm text-white/70 font-medium">
                                        <Phone size={16} className="text-white/20" /> {client.phone}
                                    </div>
                                )}
                            </div>

                            {/* Client Notes */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-black flex items-center gap-2"><Edit2 size={12} />Notas Internas</span>
                                    <button onClick={() => setEditing(!editing)} className="text-braz-gold text-[10px] font-bold uppercase transition-colors hover:text-white">
                                        {editing ? 'Cancelar' : 'Editar Tudo'}
                                    </button>
                                </div>
                                {editing ? (
                                    <textarea
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Ex: Alérgica a certo produto, prefere chá verde..."
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-braz-gold/50 min-h-[80px]"
                                    />
                                ) : (
                                    <p className="text-sm text-white/60 italic leading-relaxed">
                                        {client.notes || 'Nenhuma nota adicionada.'}
                                    </p>
                                )}
                            </div>

                            {/* Tier & Points (editable) */}
                            {editing && (
                                <div className="bg-white/5 rounded-xl p-4 mt-4 border border-white/5 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] text-white/20 uppercase font-bold block mb-1">Tier</label>
                                            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}
                                                className="w-full bg-[#0A0A0A] p-2.5 rounded-lg border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50">
                                                <option value="Bronze" className="bg-[#121212]">Bronze</option>
                                                <option value="Silver" className="bg-[#121212]">Silver</option>
                                                <option value="Gold" className="bg-[#121212]">Gold</option>
                                                <option value="Platinum" className="bg-[#121212]">Platinum</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-white/20 uppercase font-bold block mb-1">Marcações Confirmadas (Pts)</label>
                                            <input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-[#0A0A0A] p-2.5 rounded-lg border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50" />
                                        </div>
                                    </div>
                                    <button onClick={handleSave} className="w-full bg-gradient-to-r from-braz-gold to-[#e3c178] text-black py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all">
                                        <Save size={14} /> Guardar Alterações
                                    </button>
                                </div>
                            )}

                            {!editing && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Award size={20} className="text-braz-gold drop-shadow-md" />
                                        <span className="font-black text-2xl text-white">{client.points}</span>
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">marcações <br />confirmadas</span>
                                    </div>
                                    <span className="bg-braz-gold/10 border border-braz-gold/20 text-braz-gold px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-inner">
                                        {client.tier || 'Bronze'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Booking History */}
                        <div className="p-6 border-t border-white/5 bg-[#151515]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                                <Calendar size={14} className="text-white/20" /> Histórico de Bookings
                            </h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {client.bookings?.length > 0 ? client.bookings.map((b: any) => (
                                    <div key={b.id} className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-white/90">{SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.label || b.service}</p>
                                            <p className="text-[11px] font-medium text-white/40 mt-0.5">{b.date} • {b.time}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${b.status === 'confirmed' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                                            b.status === 'cancelled' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                                                'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                                            }`}>{b.status}</span>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 bg-[#1A1A1A] rounded-xl border border-white/5">
                                        <Calendar size={24} className="mx-auto text-white/10 mb-2" />
                                        <p className="text-xs font-medium text-white/20 uppercase tracking-widest">Sem histórico</p>
                                    </div>
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
