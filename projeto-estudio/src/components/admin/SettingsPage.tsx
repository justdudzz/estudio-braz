import React, { useState } from 'react';
import { Settings, Save, Clock, Euro, Loader2, ShieldCheck, QrCode, Smartphone, Trash2 } from 'lucide-react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmContext';
import { SERVICES_CONFIG, OPENING_HOURS, BUSINESS_INFO } from '../../utils/constants';
import * as authService from '../../services/authService';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// localStorage keys
const LS_KEY_BUSINESS = 'admin_settings_business';
const LS_KEY_HOURS = 'admin_settings_hours';
const LS_KEY_SERVICES = 'admin_settings_services';

const SettingsPage: React.FC = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const { user, updateUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const [cleaning, setCleaning] = useState(false);

    // 2FA State
    const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isTwoFactorEnabled || false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState('');
    const [generating2FA, setGenerating2FA] = useState(false);
    const [verifying2FA, setVerifying2FA] = useState(false);
    const [disabling2FA, setDisabling2FA] = useState(false);
    const [showDisableForm, setShowDisableForm] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');

    // Business info state
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

    const handleGenerate2FA = async () => {
        setGenerating2FA(true);
        try {
            const data = await authService.generate2FA();
            setQrCode(data.qrCodeImage);
            showToast('QR Code gerado. Digitalize com o Google Authenticator.', 'info');
        } catch (err: any) {
            showToast(err.message || 'Erro ao gerar 2FA', 'error');
        } finally {
            setGenerating2FA(false);
        }
    };

    const handleVerify2FA = async () => {
        if (otpCode.length !== 6) return;
        setVerifying2FA(true);
        try {
            await authService.verify2FASetup(otpCode);
            setIs2FAEnabled(true);
            setQrCode(null);
            setOtpCode('');
            // Update local user state globally
            updateUser({ isTwoFactorEnabled: true });
            showToast('Autenticação de 2 Passos ativada com sucesso!', 'success');
        } catch (err: any) {
            showToast(err.message || 'Código inválido', 'error');
        } finally {
            setVerifying2FA(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!disablePassword) { showToast('Introduza a password.', 'warning'); return; }
        setDisabling2FA(true);
        try {
            await authService.disable2FA(disablePassword);
            setIs2FAEnabled(false);
            setShowDisableForm(false);
            setDisablePassword('');
            setQrCode(null);
            setOtpCode('');
            // Update local user state globally
            updateUser({ isTwoFactorEnabled: false });
            showToast('2FA desativado com sucesso.', 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Erro ao desativar 2FA.', 'error');
        } finally {
            setDisabling2FA(false);
        }
    };

    const handleDeepClean = () => {
        confirm({
            title: "Limpeza Profunda do Sistema",
            message: "Esta ação apagará definitivamente dados obsoletos (Marcações pendentes antigas, bloqueios passados, clientes inativos há >60 dias e tokens expirados). A rentabilidade (Pago / Completo) e histórico contábil recente NUNCA serão apagados. Deseja prosseguir com a otimização?",
            confirmText: "EXECUTAR LIMPEZA CLÍNICA",
            cancelText: "CANCELAR",
            type: "danger",
            onConfirm: async () => {
                setCleaning(true);
                try {
                    const res = await api.delete('/bookings/database/deep-clean');
                    const data = res.data;
                    showToast(data.message || 'Limpeza realizada!', 'success');
                    console.log("Stats da limpeza:", data.stats);
                } catch (error: any) {
                    showToast(error.response?.data?.message || 'Erro ao efetuar limpeza da base de dados.', 'error');
                } finally {
                    setCleaning(false);
                }
            }
        });
    };

    return (
        <div className="pb-20">
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

                {/* --- 🔐 SEGURANÇA AVANÇADA (2FA) --- */}
                <div className="bg-[#121212] rounded-2xl border border-braz-gold/10 p-6 lg:col-span-2 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-braz-gold/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                    <h2 className="text-sm font-bold uppercase tracking-wider text-braz-gold mb-6 flex items-center gap-2">
                        <ShieldCheck size={18} /> Segurança de Elite (2FA)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <p className="text-xs text-white/50 leading-relaxed">
                                A Autenticação de Dois Passos adiciona uma camada de proteção inquebrável ao seu painel.
                            </p>

                            <div className="flex items-center gap-4 py-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${is2FAEnabled ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-white/20'}`}>
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                                        Estado: {is2FAEnabled ? 'PROTEGIDO' : 'VULNERÁVEL'}
                                    </p>
                                </div>
                            </div>

                            {!is2FAEnabled && !qrCode && (
                                <button
                                    onClick={handleGenerate2FA}
                                    disabled={generating2FA}
                                    className="px-6 py-3 bg-braz-gold text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {generating2FA ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
                                    ATIVAR GOOGLE AUTHENTICATOR
                                </button>
                            )}
                        </div>

                        {qrCode && !is2FAEnabled && (
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col items-center text-center">
                                <p className="text-[10px] font-bold text-braz-gold uppercase tracking-widest mb-4">1. Digitalize o código</p>
                                <div className="bg-white p-2 rounded-xl mb-6">
                                    <img src={qrCode} alt="QR Code 2FA" className="w-44 h-44" />
                                </div>
                                <div className="flex gap-2 w-full max-w-[200px]">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center text-xl font-mono tracking-[0.3em] text-white outline-none focus:border-braz-gold transition-all"
                                    />
                                    <button
                                        onClick={handleVerify2FA}
                                        disabled={verifying2FA || otpCode.length !== 6}
                                        className="bg-braz-gold text-black p-3 rounded-xl hover:bg-white transition-all disabled:opacity-30"
                                    >
                                        {verifying2FA ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {is2FAEnabled && (
                            <div className="space-y-4">
                                <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/10 flex items-center gap-4">
                                    <Smartphone className="text-green-500 shrink-0" size={32} />
                                    <p className="text-[10px] text-green-500/70 uppercase tracking-widest font-bold leading-loose">
                                        O seu dispositivo está emparelhado. Segurança ativa.
                                    </p>
                                </div>
                                {!showDisableForm ? (
                                    <button
                                        onClick={() => setShowDisableForm(true)}
                                        className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <ShieldCheck size={14} /> DESATIVAR 2FA
                                    </button>
                                ) : (
                                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 space-y-3">
                                        <p className="text-[10px] text-red-400/70 uppercase tracking-widest font-bold">Confirme com a sua password:</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                value={disablePassword}
                                                onChange={(e) => setDisablePassword(e.target.value)}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-red-500/50"
                                            />
                                            <button
                                                onClick={handleDisable2FA}
                                                disabled={disabling2FA}
                                                className="px-4 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-red-600 transition-all disabled:opacity-50"
                                            >
                                                {disabling2FA ? <Loader2 size={14} className="animate-spin" /> : 'CONFIRMAR'}
                                            </button>
                                            <button
                                                onClick={() => { setShowDisableForm(false); setDisablePassword(''); }}
                                                className="px-3 py-3 bg-white/5 text-white/40 rounded-xl text-[10px] font-bold uppercase hover:text-white"
                                            >
                                                CANCELAR
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 🧹 LIMPEZA DE SISTEMA (JANITOR) --- */}
                <div className="bg-[#121212] rounded-2xl border border-red-500/10 p-6 lg:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    
                    <h2 className="text-sm font-bold uppercase tracking-wider text-red-500/90 mb-4 flex items-center gap-2">
                        <Trash2 size={18} /> Otimização Clínica e Limpeza de Lixo
                    </h2>
                    
                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="space-y-2 flex-1">
                            <p className="text-xs text-white/50 leading-relaxed italic">
                                "Ao longo do tempo, o sistema acumula fantasmas: clientes que nunca marcaram, bloqueios de calendário de meses passados, e pendentes esquecidos, atrasando a pesquisa na Base de Dados."
                            </p>
                            <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest mt-2">
                                ✅ O que fica intacto: Todo o seu Painel de Contabilidade, Faturação (Pagos/Completos) e Análises.
                            </p>
                        </div>
                        
                        <button
                            onClick={handleDeepClean}
                            disabled={cleaning}
                            className="shrink-0 px-6 py-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-3 group"
                        >
                            {cleaning ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} className="group-hover:scale-110 transition-transform" />}
                            {cleaning ? 'A LIMPAR O CÓDIGO...' : 'EFETUAR LIMPEZA SEGURA'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;
