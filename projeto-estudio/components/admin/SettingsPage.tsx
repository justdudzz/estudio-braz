import React, { useState, useEffect } from 'react';
import { Settings, Save, Clock, Euro, Loader2 } from 'lucide-react';
import { useToast } from '../common/Toast';
import { SERVICES_CONFIG, OPENING_HOURS, BUSINESS_INFO } from '../../utils/constants';

// localStorage keys
const LS_KEY_BUSINESS = 'admin_settings_business';
const LS_KEY_HOURS = 'admin_settings_hours';
const LS_KEY_SERVICES = 'admin_settings_services';

const SettingsPage: React.FC = () => {
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);

    // Business info state — loads from localStorage or falls back to constants
    const [business, setBusiness] = useState(() => {
        try {
            const stored = localStorage.getItem(LS_KEY_BUSINESS);
            return stored ? JSON.parse(stored) : {
                name: BUSINESS_INFO.name,
                whatsapp: BUSINESS_INFO.whatsapp,
                email: BUSINESS_INFO.email,
            };
        } catch { return { name: BUSINESS_INFO.name, whatsapp: BUSINESS_INFO.whatsapp, email: BUSINESS_INFO.email }; }
    });

    // Opening hours state
    const [hours, setHours] = useState(() => {
        try {
            const stored = localStorage.getItem(LS_KEY_HOURS);
            return stored ? JSON.parse(stored) : {
                start: OPENING_HOURS.start,
                end: OPENING_HOURS.end,
                weekendStart: OPENING_HOURS.weekendStart,
                weekendEnd: OPENING_HOURS.weekendEnd,
            };
        } catch { return { start: OPENING_HOURS.start, end: OPENING_HOURS.end, weekendStart: OPENING_HOURS.weekendStart, weekendEnd: OPENING_HOURS.weekendEnd }; }
    });

    // Services state
    const [services, setServices] = useState(() => {
        try {
            const stored = localStorage.getItem(LS_KEY_SERVICES);
            return stored ? JSON.parse(stored) : Object.entries(SERVICES_CONFIG).map(([key, config]) => ({
                key,
                label: config.label,
                price: config.price,
                duration: config.duration,
            }));
        } catch {
            return Object.entries(SERVICES_CONFIG).map(([key, config]) => ({
                key,
                label: config.label,
                price: config.price,
                duration: config.duration,
            }));
        }
    });

    const updateService = (index: number, field: string, value: number) => {
        setServices((prev: any[]) => prev.map((s: any, i: number) => i === index ? { ...s, [field]: value } : s));
    };

    const handleSave = () => {
        setSaving(true);
        try {
            localStorage.setItem(LS_KEY_BUSINESS, JSON.stringify(business));
            localStorage.setItem(LS_KEY_HOURS, JSON.stringify(hours));
            localStorage.setItem(LS_KEY_SERVICES, JSON.stringify(services));
            showToast('Configurações guardadas com sucesso!', 'success');
        } catch {
            showToast('Erro ao guardar configurações.', 'error');
        } finally {
            setTimeout(() => setSaving(false), 500);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Configurações</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-braz-gold/10 text-braz-gold border border-braz-gold/20 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-braz-gold hover:text-black transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'A guardar...' : 'Guardar'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Info */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
                        <Settings size={16} /> Informações do Negócio
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">Nome</label>
                            <input type="text" value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                                className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50" />
                        </div>
                        <div>
                            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">WhatsApp</label>
                            <input type="text" value={business.whatsapp} onChange={(e) => setBusiness({ ...business, whatsapp: e.target.value })}
                                className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50" />
                        </div>
                        <div>
                            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">Email</label>
                            <input type="email" value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                                className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50" />
                        </div>
                    </div>
                </div>

                {/* Opening Hours */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
                        <Clock size={16} /> Horário de Funcionamento
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">Abertura (Semana)</label>
                                <input type="number" value={hours.start} min={6} max={12} onChange={(e) => setHours({ ...hours, start: parseInt(e.target.value) || 9 })}
                                    className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50" />
                            </div>
                            <div>
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">Fecho (Semana)</label>
                                <input type="number" value={hours.end} min={16} max={23} onChange={(e) => setHours({ ...hours, end: parseInt(e.target.value) || 20 })}
                                    className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">Abertura (Sábado)</label>
                                <input type="number" value={hours.weekendStart} min={8} max={14} onChange={(e) => setHours({ ...hours, weekendStart: parseInt(e.target.value) || 9 })}
                                    className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50" />
                            </div>
                            <div>
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">Fecho (Sábado)</label>
                                <input type="number" value={hours.weekendEnd} min={12} max={20} onChange={(e) => setHours({ ...hours, weekendEnd: parseInt(e.target.value) || 13 })}
                                    className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-braz-gold/50" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services & Prices */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6 lg:col-span-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
                        <Euro size={16} /> Serviços e Preços
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map((svc: any, idx: number) => (
                            <div key={svc.key} className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                <p className="text-xs font-bold text-white mb-3">{svc.label}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] text-white/20 uppercase block mb-1">Preço (€)</label>
                                        <input type="number" value={svc.price} onChange={(e) => updateService(idx, 'price', parseInt(e.target.value) || 0)}
                                            className="w-full bg-white/5 p-2 rounded-lg border border-white/10 text-xs text-white outline-none focus:border-braz-gold/50" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-white/20 uppercase block mb-1">Duração (min)</label>
                                        <input type="number" value={svc.duration} onChange={(e) => updateService(idx, 'duration', parseInt(e.target.value) || 0)}
                                            className="w-full bg-white/5 p-2 rounded-lg border border-white/10 text-xs text-white outline-none focus:border-braz-gold/50" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
