import React, { useState, useMemo } from 'react';
import { Download, Users, Calendar, Loader2, TrendingUp, BarChart3, PieChart, Clock, CheckCircle, DollarSign, CalendarDays, ArrowUpRight, ArrowDownRight, Plus, Trash2, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../common/Toast';
import { useAdminData } from '../../contexts/AdminDataContext';
import { MetricCard, GrowthCard, StatusCard } from './ui/StatCards';
import { SERVICES_CONFIG } from '../../utils/constants';
import { Expense } from '../../src/types';

const ReportsPage: React.FC = () => {
    const { showToast } = useToast();
    const { bookings, clients, expenses, loading, addExpense, removeExpense } = useAdminData();
    const [exporting, setExporting] = useState<string | null>(null);

    const [newExpenseDesc, setNewExpenseDesc] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');

    const handleAddExpense = () => {
        if (!newExpenseDesc || !newExpenseAmount) return;
        addExpense({
            id: Date.now().toString(),
            description: newExpenseDesc,
            amount: parseFloat(newExpenseAmount),
            date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        });
        setNewExpenseDesc('');
        setNewExpenseAmount('');
        showToast('Despesa adicionada!', 'success');
    };

    // =================== STATISTICS ===================
    const stats = useMemo(() => {
        const realBookings = bookings.filter(b => b.status !== 'blocked' && b.service !== 'BLOQUEIO_ADMIN');
        const confirmed = realBookings.filter(b => b.status === 'confirmed');
        const paid = realBookings.filter(b => b.status === 'paid');
        const pending = realBookings.filter(b => b.status === 'pending');
        const cancelled = realBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected');
        const blocked = bookings.filter(b => b.status === 'blocked');

        // Revenue (only from Paid)
        const totalRevenue = paid.reduce((acc, b) => {
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
        const thisMonthPaid = paid.filter(b => b.date?.startsWith(thisMonthStr));
        const lastMonthPaid = paid.filter(b => b.date?.startsWith(lastMonthStr));

        const thisMonthRevenue = thisMonthPaid.reduce((acc, b) => {
            const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
            return acc + (config?.price || 0);
        }, 0);
        const lastMonthRevenue = lastMonthPaid.reduce((acc, b) => {
            const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
            return acc + (config?.price || 0);
        }, 0);

        // Services breakdown (paid + confirmed)
        const serviceCount: Record<string, number> = {};
        const serviceRevenue: Record<string, number> = {};
        const validForBreakdown = [...confirmed, ...paid];
        validForBreakdown.forEach(b => {
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
                percentage: validForBreakdown.length > 0 ? Math.round((count / validForBreakdown.length) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

        // Busiest hours (paid + confirmed)
        const hourCount: Record<string, number> = {};
        validForBreakdown.forEach(b => {
            hourCount[b.time] = (hourCount[b.time] || 0) + 1;
        });
        const busiestHours = Object.entries(hourCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Busiest days of week
        const dayOfWeekCount: Record<string, number> = {};
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        validForBreakdown.forEach(b => {
            const d = new Date(`${b.date}T12:00:00Z`);
            const dayName = dayNames[d.getDay()];
            dayOfWeekCount[dayName] = (dayOfWeekCount[dayName] || 0) + 1;
        });
        const busiestDays = Object.entries(dayOfWeekCount).sort((a, b) => b[1] - a[1]);

        // Monthly trend (last 6 months)
        const monthlyTrend: { month: string; bookings: number; revenue: number; expenses: number; netData: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const mLabel = d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });

            const mBookings = validForBreakdown.filter(b => b.date?.startsWith(mStr));
            const mPaid = paid.filter(b => b.date?.startsWith(mStr));

            const mRevenue = mPaid.reduce((acc, b) => {
                const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
                return acc + (config?.price || 0);
            }, 0);

            const mExpenses = expenses.filter(e => e.date === mStr).reduce((acc, e) => acc + e.amount, 0);

            monthlyTrend.push({ month: mLabel, bookings: mBookings.length, revenue: mRevenue, expenses: mExpenses, netData: mRevenue - mExpenses });
        }

        // Expenses this month
        const thisMonthExpenses = expenses.filter(e => e.date === thisMonthStr).reduce((acc, e) => acc + e.amount, 0);
        const thisMonthNet = thisMonthRevenue - thisMonthExpenses;

        // Conversion rate
        const conversionRate = realBookings.length > 0 ? Math.round((validForBreakdown.length / realBookings.length) * 100) : 0;

        // Average revenue per booking
        const avgRevenue = paid.length > 0 ? Math.round(totalRevenue / paid.length) : 0;

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
            paid: paid.length,
            pending: pending.length,
            cancelled: cancelled.length,
            blocked: blocked.length,
            totalRevenue,
            thisMonthRevenue,
            thisMonthBookings: thisMonthBookings.length,
            thisMonthExpenses,
            thisMonthNet,
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
            thisMonthStr,
        };
    }, [bookings, clients, expenses]);

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

            {/* ===== ROW 2: Financial Panel (Net Profit & Expenses) ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <GrowthCard label="Receita Bruta (Mês)" value={`€${stats.thisMonthRevenue.toLocaleString()}`} growth={stats.revenueGrowth} color="text-braz-gold" icon={<DollarSign size={20} />} />
                <GrowthCard label="Despesas (Mês)" value={`€${stats.thisMonthExpenses.toLocaleString()}`} growth={0} color="text-red-400" icon={<TrendingUp size={20} className="rotate-180" />} flipGrowth={true} disableGrowth={true} />
                <GrowthCard label="Lucro Líquido (Mês)" value={`€${stats.thisMonthNet.toLocaleString()}`} growth={0} color="text-emerald-400" icon={<Wallet size={20} />} disableGrowth={true} />
            </div>

            {/* ===== ROW 2.5: Tracker Section ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Add Expense Form */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6 border-l-2 border-l-red-500/50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-5 flex items-center gap-2">
                        <Wallet size={14} className="text-red-400" /> Adicionar Despesa (Este Mês)
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Descrição (ex: Lâminas, Luz)"
                            value={newExpenseDesc}
                            onChange={(e) => setNewExpenseDesc(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-red-400/50"
                        />
                        <div className="relative w-full sm:w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">€</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={newExpenseAmount}
                                onChange={(e) => setNewExpenseAmount(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-8 pr-4 text-sm text-white outline-none focus:border-red-400/50"
                            />
                        </div>
                        <button
                            onClick={handleAddExpense}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Adicionar
                        </button>
                    </div>
                </div>

                {/* Expense List */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6 h-48 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                        Lista de Despesas
                    </h3>
                    <div className="space-y-2">
                        {expenses.filter(e => e.date === stats.thisMonthStr).map((exp, i) => (
                            <div key={exp.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                <span className="text-sm text-white/80 font-medium">{exp.description}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-black text-red-400">€{exp.amount.toFixed(2)}</span>
                                    <button onClick={() => removeExpense(exp.id)} className="text-white/20 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {expenses.filter(e => e.date === stats.thisMonthStr).length === 0 && (
                            <p className="text-center text-xs text-white/20 italic pt-4">Nenhuma despesa registada este mês.</p>
                        )}
                    </div>
                </div>
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
                                <span className="text-[10px] font-bold text-emerald-400">€{m.netData.toLocaleString()}</span>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(m.revenue / maxMonthlyBookings) * 100}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="w-full bg-gradient-to-t from-emerald-500/20 to-emerald-500/60 rounded-t-lg min-h-[4px]"
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
                    <StatusCard label="Pagos" count={stats.paid} total={stats.total} color="bg-braz-gold" />
                    <StatusCard label="Cancelados" count={stats.cancelled} total={stats.total} color="bg-red-500" />
                    <StatusCard label="Bloqueios" count={stats.blocked} total={bookings.length} color="bg-orange-500" />
                    <StatusCard label="Total Bookings" count={stats.total} total={stats.total} color="bg-white" />
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
