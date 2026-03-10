import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Calendar, Clock, Trash2, Plus, AlertTriangle, Loader2, CheckSquare, Square, Undo2, CalendarRange } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmContext'; // Added this import
import api from '../../services/api';
import { getAllBookings, deleteBooking } from '../../services/bookingService';

// Todos os slots de 30 min disponíveis
const ALL_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
];

type BlockMode = 'fullDay' | 'singleTime' | 'timeRange';

const BlockManagement: React.FC = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm(); // Added this line
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchDeleting, setBatchDeleting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        date: '', dateEnd: '', time: '', timeStart: '09:00', timeEnd: '18:00', reason: '',
    });
    const [blockMode, setBlockMode] = useState<BlockMode>('fullDay');
    const [useRange, setUseRange] = useState(false); // multi-day range

    const fetchBlocks = async () => {
        try {
            if (blocks.length === 0) setLoading(true);
            const data = await getAllBookings();
            const allBookings = Array.isArray(data) ? data : data?.data || [];
            setBlocks(allBookings.filter((b: any) => b.status === 'blocked').sort((a: any, b: any) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));
        } catch {
            showToast('Erro ao carregar bloqueios.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBlocks(); }, []);

    // Agrupar bloqueios por data
    const groupedBlocks = useMemo(() => {
        const map = new Map<string, any[]>();
        blocks.forEach(b => {
            const key = b.date;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(b);
        });
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [blocks]);

    const handleCreate = async () => {
        if (!form.date) { showToast('Selecione uma data.', 'warning'); return; }
        if (useRange && !form.dateEnd) { showToast('Selecione a data final.', 'warning'); return; }

        setCreating(true);
        try {
            const payload: any = {
                date: form.date,
                reason: form.reason,
                fullDay: blockMode === 'fullDay',
            };

            if (useRange) payload.dateEnd = form.dateEnd;

            if (blockMode === 'singleTime') {
                payload.time = form.time || '09:00';
            } else if (blockMode === 'timeRange') {
                payload.timeStart = form.timeStart;
                payload.timeEnd = form.timeEnd;
            }

            const res = await api.post('/bookings/block', payload);
            showToast(res.data?.message || 'Bloqueio criado!', 'success');
            setShowCreateModal(false);
            setForm({ date: '', dateEnd: '', time: '', timeStart: '09:00', timeEnd: '18:00', reason: '' });
            setBlockMode('fullDay');
            setUseRange(false);
            fetchBlocks();
        } catch {
            showToast('Erro ao bloquear.', 'error');
        } finally {
            setCreating(false);
        }
    };

    // Toggle seleção individual
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Selecionar/desselecionar todos de um dia
    const toggleDay = (dayBlocks: any[]) => {
        const dayIds = dayBlocks.map((b: any) => b.id);
        const allSelected = dayIds.every((id: string) => selectedIds.has(id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            dayIds.forEach((id: string) => allSelected ? next.delete(id) : next.add(id));
            return next;
        });
    };

    // Selecionar tudo
    const selectAll = () => {
        if (selectedIds.size === blocks.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(blocks.map(b => b.id)));
        }
    };

    // Batch delete
    const handleBatchDelete = () => {
        if (selectedIds.size === 0) return;
        confirm({
            title: 'Remover Vários Bloqueios',
            message: `Tem a certainty que deseja remover ${selectedIds.size} bloqueio(s)? Esta ação não pode ser desfeita e os horários voltarão a ficar disponíveis.`,
            type: 'warning',
            confirmText: 'Sim, Remover',
            onConfirm: async () => {
                setBatchDeleting(true);
                try {
                    const res = await api.post('/bookings/batch-delete', { ids: Array.from(selectedIds) });
                    showToast(res.data?.message || 'Bloqueios removidos!', 'success');
                    setSelectedIds(new Set());
                    fetchBlocks();
                } catch {
                    showToast('Erro ao remover bloqueios.', 'error');
                } finally {
                    setBatchDeleting(false);
                }
            }
        });
    };

    // Single remove
    const handleRemove = (id: string) => {
        confirm({
            title: 'Desbloquear Horário',
            message: 'Tem a certainty que deseja desbloquear este horário?',
            type: 'info',
            confirmText: 'Desbloquear',
            onConfirm: async () => {
                try {
                    await deleteBooking(id);
                    showToast('Desbloqueado.', 'success');
                    fetchBlocks();
                } catch {
                    showToast('Erro ao desbloquear.', 'error');
                }
            }
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Lock className="text-orange-500" size={24} /> Gestão de Bloqueios
                    </h1>
                    <p className="text-white/30 text-xs mt-1">{blocks.length} bloqueio{blocks.length !== 1 ? 's' : ''} ativo{blocks.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* Botão Selecionar Tudo */}
                    {blocks.length > 0 && (
                        <button
                            onClick={selectAll}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${selectedIds.size === blocks.length
                                ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {selectedIds.size === blocks.length ? <CheckSquare size={14} /> : <Square size={14} />}
                            {selectedIds.size === blocks.length ? 'Desselecionar' : 'Selecionar Tudo'}
                        </button>
                    )}

                    {/* Batch Undo Button */}
                    {selectedIds.size > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={handleBatchDelete}
                            disabled={batchDeleting}
                            className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                            {batchDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            Remover {selectedIds.size}
                        </motion.button>
                    )}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-500 hover:text-black transition-all"
                    >
                        <Plus size={14} /> Novo Bloqueio
                    </button>
                </div>
            </div>

            {/* Contador de seleção flutuante se houver muitos bloques */}
            {selectedIds.size > 0 && (
                <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/10 rounded-lg w-fit">
                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">
                        {selectedIds.size} selecionados para remoção
                    </span>
                </div>
            )}

            {/* Blocks List — Grouped by Date */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-[#121212] rounded-2xl border border-white/5 p-5 animate-pulse">
                            <div className="h-6 bg-white/5 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            ) : blocks.length === 0 ? (
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-16 text-center">
                    <Lock className="mx-auto text-orange-500/20 mb-4" size={48} />
                    <p className="text-white/40 text-sm mb-1">Nenhum bloqueio ativo.</p>
                    <p className="text-white/20 text-xs">Use o botão acima para bloquear datas ou horários.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {groupedBlocks.map(([date, dayBlocks]) => {
                        const allSelected = dayBlocks.every((b: any) => selectedIds.has(b.id));
                        return (
                            <div key={date} className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden">
                                {/* Day Header */}
                                <div
                                    className="flex items-center justify-between px-5 py-4 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                    onClick={() => toggleDay(dayBlocks)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            {allSelected ? <CheckSquare size={16} className="text-orange-400" /> : <Square size={16} className="text-white/20" />}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-500/10 p-2.5 rounded-xl">
                                                <Calendar className="text-orange-400" size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white capitalize">{formatDate(date)}</p>
                                                <p className="text-[10px] text-white/30 mt-0.5">{dayBlocks.length} slot{dayBlocks.length !== 1 ? 's' : ''} bloqueado{dayBlocks.length !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Time Slots */}
                                <div className="px-5 py-3 flex flex-wrap gap-2">
                                    {dayBlocks.map((block: any) => (
                                        <div
                                            key={block.id}
                                            onClick={() => toggleSelect(block.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${selectedIds.has(block.id)
                                                ? 'border-orange-500/50 bg-orange-500/10 text-orange-300'
                                                : 'border-white/5 bg-white/[0.02] text-white/40 hover:border-orange-500/30'
                                                }`}
                                        >
                                            <Clock size={10} />
                                            {block.time}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemove(block.id); }}
                                                className="ml-1 p-0.5 text-red-500/40 hover:text-red-400 transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== CREATE BLOCK MODAL ===== */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#121212] border border-white/10 p-8 rounded-2xl max-w-lg w-full shadow-2xl"
                        >
                            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3">
                                <AlertTriangle className="text-orange-500" /> Novo Bloqueio
                            </h2>

                            <div className="space-y-5">
                                {/* Datas */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 tracking-widest">
                                            {useRange ? 'Data Início' : 'Data'}
                                        </label>
                                        <input type="date" value={form.date}
                                            className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-orange-500/50 focus:bg-white/[0.08] text-white text-sm [color-scheme:dark] transition-all"
                                            onChange={(e) => setForm({ ...form, date: e.target.value })} />
                                    </div>
                                    {useRange && (
                                        <div>
                                            <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 tracking-widest">Data Fim</label>
                                            <input type="date" value={form.dateEnd} min={form.date}
                                                className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-orange-500/50 focus:bg-white/[0.08] text-white text-sm [color-scheme:dark] transition-all"
                                                onChange={(e) => setForm({ ...form, dateEnd: e.target.value })} />
                                        </div>
                                    )}
                                </div>

                                {/* Toggle Range */}
                                <div
                                    className="flex items-center gap-3 bg-white/5 p-3 rounded-xl cursor-pointer hover:bg-white/[0.07] transition-colors"
                                    onClick={() => setUseRange(!useRange)}
                                >
                                    <CalendarRange size={16} className={useRange ? 'text-orange-400' : 'text-white/30'} />
                                    <span className="text-sm font-bold uppercase tracking-wider">Intervalo de Dias</span>
                                    <input type="checkbox" checked={useRange} readOnly className="ml-auto w-4 h-4 accent-orange-500" />
                                </div>

                                {/* Block Type Selector */}
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase block mb-3 tracking-widest">Tipo de Bloqueio</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { key: 'fullDay' as BlockMode, label: 'Dia Inteiro', icon: '📅' },
                                            { key: 'timeRange' as BlockMode, label: 'Horas (de-até)', icon: '⏰' },
                                            { key: 'singleTime' as BlockMode, label: 'Hora Única', icon: '🕐' },
                                        ].map(opt => (
                                            <button
                                                key={opt.key}
                                                onClick={() => setBlockMode(opt.key)}
                                                className={`p-3 rounded-xl text-xs font-bold uppercase text-center border transition-all ${blockMode === opt.key
                                                    ? 'border-orange-500/50 bg-orange-500/10 text-orange-300'
                                                    : 'border-white/5 text-white/40 hover:border-white/20'
                                                    }`}
                                            >
                                                <span className="text-lg block mb-1">{opt.icon}</span>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Time inputs based on mode */}
                                {blockMode === 'singleTime' && (
                                    <div>
                                        <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 tracking-widest">Hora</label>
                                        <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                                            className="w-full bg-white/5 p-3 rounded-xl border border-white/10 outline-none focus:border-orange-500 text-white text-sm">
                                            {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                )}

                                {blockMode === 'timeRange' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 tracking-widest">De</label>
                                            <select value={form.timeStart} onChange={(e) => setForm({ ...form, timeStart: e.target.value })}
                                                className="w-full bg-white/5 p-3 rounded-xl border border-white/10 outline-none focus:border-orange-500 text-white text-sm">
                                                {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 tracking-widest">Até</label>
                                            <select value={form.timeEnd} onChange={(e) => setForm({ ...form, timeEnd: e.target.value })}
                                                className="w-full bg-white/5 p-3 rounded-xl border border-white/10 outline-none focus:border-orange-500 text-white text-sm">
                                                {ALL_SLOTS.filter(s => s >= form.timeStart).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Reason */}
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase block mb-2 tracking-widest">Motivo (Opcional)</label>
                                    <textarea value={form.reason}
                                        className="w-full bg-white/5 p-3 rounded-xl border border-white/10 outline-none focus:border-orange-500 h-20 text-white text-sm resize-none"
                                        placeholder="Ex: Férias, Formação, Dia pessoal..."
                                        onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                                </div>

                                {/* Summary */}
                                <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4 text-[11px] text-orange-300/70">
                                    <strong className="text-orange-400">Resumo:</strong>{' '}
                                    {blockMode === 'fullDay' ? 'Dia inteiro' : blockMode === 'timeRange' ? `Das ${form.timeStart} às ${form.timeEnd}` : `Às ${form.time || '09:00'}`}
                                    {' • '}
                                    {useRange && form.dateEnd
                                        ? `De ${form.date || '...'} a ${form.dateEnd}`
                                        : form.date || 'Selecione uma data'
                                    }
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 text-xs font-bold uppercase text-white/40 hover:text-white transition-colors">
                                        Cancelar
                                    </button>
                                    <button onClick={handleCreate} disabled={creating}
                                        className="flex-1 bg-orange-500 text-black py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {creating ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                                        {creating ? 'A bloquear...' : 'Confirmar Bloqueio'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlockManagement;
