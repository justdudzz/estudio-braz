import React, { useState, useEffect, useMemo } from 'react';
import { Download, FileText, Users, Calendar, Loader2, TrendingUp, BarChart3, PieChart, Clock, CheckCircle, XCircle, DollarSign, CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../common/Toast';
import { getAllBookings } from '../../src/services/bookingService';
import api from '../../src/services/api';
import { SERVICES_CONFIG } from '../../utils/constants';

const SYSTEM_EMAILS = ['system@studiobraz.internal'];

const ReportsPage: React.FC = () => {
    const { showToast } = useToast();
    const [bookings, setBookings] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [bookingsRes, clientsRes] = await Promise.all([
                    getAllBookings(),
                    api.get('/bookings/clients'),
                ]);
                const bk = Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.data || [];
                setBookings(bk);
                const cl = (clientsRes.data || []).filter((c: any) => !SYSTEM_EMAILS.includes(c.email || ''));
                setClients(cl);
            } catch {
                showToast('Erro ao carregar dados.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // =================== STATISTICS ===================
    const stats = useMemo(() => {
        const realBookings = bookings.filter(b => b.status !== 'blocked' && b.service !== 'BLOQUEIO_ADMIN');
        const confirmed = realBookings.filter(b => b.status === 'confirmed');
        const pending = realBookings.filter(b => b.status === 'pending');
        const cancelled = realBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected');
        const blocked = bookings.filter(b => b.status === 'blocked');

        // Revenue
        const totalRevenue = confirmed.reduce((acc, b) => {
            const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
            return acc + (config?.price || 0);
        }, 0);

        // This month
        const now = new Date();
        const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

        const thisMonthBookings = realBookings.filter(b => b.date?.startsWith(thisMonthStr));
        const lastMonthBookings = realBookings.filter(b => b.date?.startsWith(lastMonthStr));
        const thisMonthConfirmed = confirmed.filter(b => b.date?.startsWith(thisMonthStr));
        const lastMonthConfirmed = confirmed.filter(b => b.date?.startsWith(lastMonthStr));

        const thisMonthRevenue = thisMonthConfirmed.reduce((acc, b) => {
            const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
            return acc + (config?.price || 0);
        }, 0);
        const lastMonthRevenue = lastMonthConfirmed.reduce((acc, b) => {
            const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
            return acc + (config?.price || 0);
        }, 0);

        // Services breakdown
        const serviceCount: Record<string, number> = {};
        const serviceRevenue: Record<string, number> = {};
        confirmed.forEach(b => {
            serviceCount[b.service] = (serviceCount[b.service] || 0) + 1;
            const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
            serviceRevenue[b.service] = (serviceRevenue[b.service] || 0) + (config?.price || 0);
        });

        const serviceBreakdown = Object.entries(serviceCount)
            .map(([service, count]) => ({
                service,
                label: SERVICES_CONFIG[service as keyof typeof SERVICES_CONFIG]?.label || service,
                count,
                revenue: serviceRevenue[service] || 0,
                percentage: confirmed.length > 0 ? Math.round((count / confirmed.length) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

        // Busiest hours
        const hourCount: Record<string, number> = {};
        confirmed.forEach(b => {
            hourCount[b.time] = (hourCount[b.time] || 0) + 1;
        });
        const busiestHours = Object.entries(hourCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Busiest days of week
        const dayOfWeekCount: Record<string, number> = {};
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        confirmed.forEach(b => {
            const d = new Date(`${b.date}T12:00:00Z`);
            const dayName = dayNames[d.getDay()];
            dayOfWeekCount[dayName] = (dayOfWeekCount[dayName] || 0) + 1;
        });
        const busiestDays = Object.entries(dayOfWeekCount).sort((a, b) => b[1] - a[1]);

        // Monthly trend (last 6 months)
        const monthlyTrend: { month: string; bookings: number; revenue: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const mLabel = d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
            const mBookings = confirmed.filter(b => b.date?.startsWith(mStr));
            const mRevenue = mBookings.reduce((acc, b) => {
                const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
                return acc + (config?.price || 0);
            }, 0);
            monthlyTrend.push({ month: mLabel, bookings: mBookings.length, revenue: mRevenue });
        }

        // Conversion rate
        const conversionRate = realBookings.length > 0 ? Math.round((confirmed.length / realBookings.length) * 100) : 0;

        // Average revenue per booking
        const avgRevenue = confirmed.length > 0 ? Math.round(totalRevenue / confirmed.length) : 0;

        // Growth
        const bookingGrowth = lastMonthBookings.length > 0
            ? Math.round(((thisMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length) * 100)
            : thisMonthBookings.length > 0 ? 100 : 0;

        const revenueGrowth = lastMonthRevenue > 0
            ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : thisMonthRevenue > 0 ? 100 : 0;

        // Top clients
        const topClients = [...clients].sort((a, b) => b.points - a.points).slice(0, 5);

        // New clients this month
        const newClientsThisMonth = clients.filter(c => c.createdAt?.startsWith(thisMonthStr)).length;

        return {
            total: realBookings.length,
            confirmed: confirmed.length,
            pending: pending.length,
            cancelled: cancelled.length,
            blocked: blocked.length,
            totalRevenue,
            thisMonthRevenue,
            thisMonthBookings: thisMonthBookings.length,
            conversionRate,
            avgRevenue,
            bookingGrowth,
            revenueGrowth,
            serviceBreakdown,
            busiestHours,
            busiestDays,
            monthlyTrend,
            topClients,
            totalClients: clients.length,
            newClientsThisMonth,
        };
    }, [bookings, clients]);

    // =================== CSV EXPORT ===================
    const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
        const bom = '\uFEFF';
        const csv = bom + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportBookings = async () => {
        setExporting('bookings');
        try {
            const headers = ['Cliente', 'Email', 'Telefone', 'Serviço', 'Data', 'Hora', 'Status'];
            const rows = bookings.filter(b => b.service !== 'BLOQUEIO_ADMIN').map((b: any) => [
                b.client?.name || '', b.client?.email || '', b.client?.phone || '',
                SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.label || b.service,
                b.date, b.time, b.status
            ]);
            downloadCSV(`bookings_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
            showToast(`${rows.length} bookings exportados!`, 'success');
        } catch { showToast('Erro ao exportar.', 'error'); }
        finally { setExporting(null); }
    };

    const exportClients = async () => {
        setExporting('clients');
        try {
            const headers = ['Nome', 'Email', 'Telefone', 'Pontos', 'Total Visitas'];
            const rows = clients.map((c: any) => [
                c.name || '', c.email || '', c.phone || '',
                String(c.points || 0), String(c._count?.bookings || 0)
            ]);
            downloadCSV(`clientes_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
            showToast(`${rows.length} clientes exportados!`, 'success');
        } catch { showToast('Erro ao exportar.', 'error'); }
        finally { setExporting(null); }
    };

    // =================== RENDER ===================
    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={32} className="animate-spin text-[#C5A059]" />
            </div>
        );
    }

    const maxMonthlyBookings = Math.max(...stats.monthlyTrend.map(m => m.bookings), 1);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <BarChart3 className="text-[#C5A059]" size={24} /> Estatísticas & Relatórios
                    </h1>
                    <p className="text-white/30 text-xs mt-1">Panorama completo do desempenho do Studio Braz</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportBookings} disabled={!!exporting}
                        className="flex items-center gap-2 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-[#C5A059] hover:text-black transition-all disabled:opacity-50">
                        {exporting === 'bookings' ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Bookings CSV
                    </button>
                    <button onClick={exportClients} disabled={!!exporting}
                        className="flex items-center gap-2 bg-white/5 text-white/60 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all disabled:opacity-50">
                        {exporting === 'clients' ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Clientes CSV
                    </button>
                </div>
            </div>

            {/* ===== ROW 1: Key Metrics ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard icon={<DollarSign size={18} />} label="Receita Total" value={`€${stats.totalRevenue.toLocaleString()}`} sub={`€${stats.avgRevenue} por sessão`} color="text-emerald-400" bg="bg-emerald-500/10" />
                <MetricCard icon={<CheckCircle size={18} />} label="Confirmados" value={String(stats.confirmed)} sub={`${stats.conversionRate}% taxa de conversão`} color="text-green-400" bg="bg-green-500/10" />
                <MetricCard icon={<Users size={18} />} label="Total Clientes" value={String(stats.totalClients)} sub={`+${stats.newClientsThisMonth} este mês`} color="text-blue-400" bg="bg-blue-500/10" />
                <MetricCard icon={<Calendar size={18} />} label="Total Marcações" value={String(stats.total)} sub={`${stats.pending} pendentes`} color="text-[#C5A059]" bg="bg-[#C5A059]/10" />
            </div>

            {/* ===== ROW 2: Monthly Growth ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <GrowthCard label="Marcações este Mês" value={stats.thisMonthBookings} growth={stats.bookingGrowth} />
                <GrowthCard label="Receita este Mês" value={`€${stats.thisMonthRevenue.toLocaleString()}`} growth={stats.revenueGrowth} />
            </div>

            {/* ===== ROW 3: Monthly Trend + Services Breakdown ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Monthly Trend (Bar Chart) */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                        <TrendingUp size={14} className="text-[#C5A059]" /> Evolução Mensal (6 Meses)
                    </h3>
                    <div className="flex items-end gap-2 h-40">
                        {stats.monthlyTrend.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-[10px] font-bold text-[#C5A059]">{m.bookings}</span>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(m.bookings / maxMonthlyBookings) * 100}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="w-full bg-gradient-to-t from-[#C5A059]/20 to-[#C5A059]/60 rounded-t-lg min-h-[4px]"
                                />
                                <span className="text-[8px] text-white/30 uppercase font-bold">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Services Breakdown */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                        <PieChart size={14} className="text-[#C5A059]" /> Serviços Mais Populares
                    </h3>
                    <div className="space-y-3">
                        {stats.serviceBreakdown.map((s, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-semibold text-white/80">{s.label}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-white/30">{s.count}x</span>
                                        <span className="text-[10px] font-bold text-emerald-400">€{s.revenue}</span>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.percentage}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                        className="h-full bg-gradient-to-r from-[#C5A059] to-[#E5C585] rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                        {stats.serviceBreakdown.length === 0 && (
                            <p className="text-white/20 text-xs text-center py-8">Sem dados de serviços ainda.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== ROW 4: Busiest Hours + Days + Top Clients ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Busiest Hours */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5 flex items-center gap-2">
                        <Clock size={14} className="text-blue-400" /> Horas Mais Movimentadas
                    </h3>
                    <div className="space-y-2.5">
                        {stats.busiestHours.map(([hour, count], i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                                <span className="text-sm font-bold text-white/80">{hour}</span>
                                <span className="text-xs font-black text-blue-400">{count} sessões</span>
                            </div>
                        ))}
                        {stats.busiestHours.length === 0 && <p className="text-white/20 text-xs text-center">Sem dados.</p>}
                    </div>
                </div>

                {/* Busiest Days */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5 flex items-center gap-2">
                        <CalendarDays size={14} className="text-purple-400" /> Dias Mais Movimentados
                    </h3>
                    <div className="space-y-2.5">
                        {stats.busiestDays.map(([day, count], i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                                <span className="text-sm font-bold text-white/80">{day}</span>
                                <span className="text-xs font-black text-purple-400">{count} sessões</span>
                            </div>
                        ))}
                        {stats.busiestDays.length === 0 && <p className="text-white/20 text-xs text-center">Sem dados.</p>}
                    </div>
                </div>

                {/* Top Clients */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5 flex items-center gap-2">
                        <Users size={14} className="text-[#C5A059]" /> Top 5 Clientes
                    </h3>
                    <div className="space-y-2.5">
                        {stats.topClients.map((c: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                                    <span className="text-xs font-bold text-white/80 truncate max-w-[100px]">{c.name}</span>
                                </div>
                                <span className="text-xs font-black text-[#C5A059]">{c.points} pts</span>
                            </div>
                        ))}
                        {stats.topClients.length === 0 && <p className="text-white/20 text-xs text-center">Sem clientes.</p>}
                    </div>
                </div>
            </div>

            {/* ===== ROW 5: Status Breakdown ===== */}
            <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Distribuição por Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatusCard label="Confirmados" count={stats.confirmed} total={stats.total} color="bg-green-500" />
                    <StatusCard label="Pendentes" count={stats.pending} total={stats.total} color="bg-yellow-500" />
                    <StatusCard label="Cancelados" count={stats.cancelled} total={stats.total} color="bg-red-500" />
                    <StatusCard label="Bloqueios" count={stats.blocked} total={bookings.length} color="bg-orange-500" />
                    <StatusCard label="Total" count={stats.total} total={stats.total} color="bg-[#C5A059]" />
                </div>
            </div>
        </div>
    );
};

// ============ Sub-Components ============

const MetricCard = ({ icon, label, value, sub, color, bg }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#121212] rounded-2xl border border-white/5 p-5"
    >
        <div className={`${bg} ${color} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
            {icon}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-[10px] text-white/30 mt-1">{sub}</p>
    </motion.div>
);

const GrowthCard = ({ label, value, growth }: { label: string; value: any; growth: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#121212] rounded-2xl border border-white/5 p-6 flex items-center justify-between"
    >
        <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{label}</p>
            <p className="text-3xl font-black text-white">{value}</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${growth >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
            {growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(growth)}%
        </div>
    </motion.div>
);

const StatusCard = ({ label, count, total, color }: { label: string; count: number; total: number; color: string }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="text-center">
            <p className="text-lg font-black text-white">{count}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">{label}</p>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full ${color} rounded-full`}
                />
            </div>
            <p className="text-[8px] text-white/20 mt-1">{pct}%</p>
        </div>
    );
};

export default ReportsPage;
