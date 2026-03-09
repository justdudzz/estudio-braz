import React, { useState, useMemo } from 'react';
import { Download, Users, Calendar, Loader2, TrendingUp, BarChart3, PieChart, Clock, CheckCircle, DollarSign, CalendarDays, Plus, Trash2, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../common/Toast';
import { useAdminData } from '../../contexts/AdminDataContext';
import { MetricCard, GrowthCard, StatusCard } from './ui/StatCards';
import { SERVICES_CONFIG } from '../../utils/constants';

const ReportsPage: React.FC = () => {
    const { showToast } = useToast();
    const { bookings, clients, expenses, loading, addExpense, removeExpense, selectedMonth, setSelectedMonth } = useAdminData();
    const [exporting, setExporting] = useState(false);
    const [expenseLoading, setExpenseLoading] = useState(false);

    const [newExpenseDesc, setNewExpenseDesc] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');

    // =================== HANDLERS ===================
    const handleAddExpense = async () => {
        if (!newExpenseDesc || !newExpenseAmount) return;
        setExpenseLoading(true);
        try {
            await addExpense({
                description: newExpenseDesc,
                amount: parseFloat(newExpenseAmount),
                date: selectedMonth
            });
            setNewExpenseDesc('');
            setNewExpenseAmount('');
            showToast('Despesa adicionada!', 'success');
        } catch {
            showToast('Erro ao gravar despesa.', 'error');
        } finally {
            setExpenseLoading(false);
        }
    };

    const handleRemoveExpense = async (id: string) => {
        try {
            await removeExpense(id);
            showToast('Despesa eliminada.', 'success');
        } catch {
            showToast('Erro ao eliminar despesa.', 'error');
        }
    };

    // Navegação de Meses
    const handlePrevMonth = () => {
        const [y, m] = selectedMonth.split('-');
        const d = new Date(Number(y), Number(m) - 2, 1);
        setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    };

    const handleNextMonth = () => {
        const [y, m] = selectedMonth.split('-');
        const d = new Date(Number(y), Number(m), 1);
        setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    };

    const monthDisplay = new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]) - 1, 1)
        .toLocaleString('pt-PT', { month: 'long', year: 'numeric' });

    // =================== STATISTICS (MÊS SELECIONADO) ===================
    const stats = useMemo(() => {
        const realBookings = bookings.filter(b => b.status !== 'blocked' && b.service !== 'BLOQUEIO_ADMIN');

        // Filtrar TUDO pelo mês selecionado
        const monthBookings = realBookings.filter(b => b.date?.startsWith(selectedMonth));
        const monthConfirmed = monthBookings.filter(b => b.status === 'confirmed');
        const monthPaid = monthBookings.filter(b => b.status === 'paid');
        const monthPending = monthBookings.filter(b => b.status === 'pending');
        const monthCancelled = monthBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected');

        const monthRevenue = monthPaid.reduce((acc, b) => {
            if (b.totalPrice) return acc + b.totalPrice;
            const config = SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG];
            return acc + (config?.price || 0);
        }, 0);

        const monthExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
        const monthNet = monthRevenue - monthExpenses;

        // Busiest Days
        const dayOfWeekCount: Record<string, number> = {};
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        [...monthConfirmed, ...monthPaid].forEach(b => {
            const [y, m, d] = b.date.split('-');
            const dateObj = new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
            const dayName = dayNames[dateObj.getDay()];
            dayOfWeekCount[dayName] = (dayOfWeekCount[dayName] || 0) + 1;
        });
        const busiestDays = Object.entries(dayOfWeekCount).sort((a, b) => b[1] - a[1]);

        // Busiest Hours
        const hourCount: Record<string, number> = {};
        [...monthConfirmed, ...monthPaid].forEach(b => {
            hourCount[b.time] = (hourCount[b.time] || 0) + 1;
        });
        const busiestHours = Object.entries(hourCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // Services breakdown
        const serviceCount: Record<string, number> = {};
        const serviceRevenue: Record<string, number> = {};
        [...monthConfirmed, ...monthPaid].forEach(b => {
            serviceCount[b.service] = (serviceCount[b.service] || 0) + 1;
            const rev = b.totalPrice || SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.price || 0;
            serviceRevenue[b.service] = (serviceRevenue[b.service] || 0) + rev;
        });

        const totalValid = monthConfirmed.length + monthPaid.length;
        const serviceBreakdown = Object.entries(serviceCount)
            .map(([service, count]) => ({
                service,
                label: SERVICES_CONFIG[service as keyof typeof SERVICES_CONFIG]?.label || service,
                count,
                revenue: serviceRevenue[service] || 0,
                percentage: totalValid > 0 ? Math.round((count / totalValid) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);

        // Monthly trend (last 6 months)
        const now = new Date();
        const monthlyTrend: { month: string; bookings: number; revenue: number; netData: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const td = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStr = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, '0')}`;
            const mLabel = td.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
            const mValid = realBookings.filter(b => b.date?.startsWith(mStr) && (b.status === 'confirmed' || b.status === 'paid'));
            const mPaid = realBookings.filter(b => b.date?.startsWith(mStr) && b.status === 'paid');
            const mRev = mPaid.reduce((acc, b) => {
                if (b.totalPrice) return acc + b.totalPrice;
                return acc + (SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.price || 0);
            }, 0);
            const mExp = expenses.filter(e => e.date === mStr).reduce((acc, e) => acc + e.amount, 0);
            monthlyTrend.push({ month: mLabel, bookings: mValid.length, revenue: mRev, netData: mRev - mExp });
        }

        // Top clients
        const topClients = [...clients].sort((a, b) => b.points - a.points).slice(0, 5);

        // Growth vs previous month
        const [currY, currM] = selectedMonth.split('-');
        const prevD = new Date(Number(currY), Number(currM) - 2, 1);
        const prevMStr = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}`;
        const prevBookings = realBookings.filter(b => b.date?.startsWith(prevMStr));
        const prevPaid = prevBookings.filter(b => b.status === 'paid');
        const prevRev = prevPaid.reduce((acc, b) => {
            if (b.totalPrice) return acc + b.totalPrice;
            return acc + (SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.price || 0);
        }, 0);
        const revenueGrowth = prevRev > 0 ? Math.round(((monthRevenue - prevRev) / prevRev) * 100) : monthRevenue > 0 ? 100 : 0;

        return {
            total: monthBookings.length,
            confirmed: monthConfirmed.length,
            paid: monthPaid.length,
            pending: monthPending.length,
            cancelled: monthCancelled.length,
            revenue: monthRevenue,
            expenses: monthExpenses,
            net: monthNet,
            busiestDays,
            busiestHours,
            serviceBreakdown,
            monthlyTrend,
            topClients,
            totalClients: clients.length,
            conversionRate: monthBookings.length > 0 ? Math.round((totalValid / monthBookings.length) * 100) : 0,
            avgRevenue: monthPaid.length > 0 ? Math.round(monthRevenue / monthPaid.length) : 0,
            revenueGrowth,
        };
    }, [bookings, clients, expenses, selectedMonth]);

    // =================== CSV EXPORT (Contabilidade Perfeita) ===================
    const exportMonthlyCSV = () => {
        setExporting(true);
        try {
            const bom = '\uFEFF';
            let csv = bom;
            csv += `FECHO DE CONTAS: ${monthDisplay.toUpperCase()}\n`;
            csv += `Gerado em:;${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT')}\n\n`;
            csv += `RESUMO FINANCEIRO\n`;
            csv += `Total de Sessões:;${stats.total}\n`;
            csv += `Faturação Bruta:;€ ${stats.revenue.toFixed(2)}\n`;
            csv += `Despesas Operacionais:;€ ${stats.expenses.toFixed(2)}\n`;
            csv += `LUCRO LÍQUIDO:;€ ${stats.net.toFixed(2)}\n\n`;
            csv += `DESCRIÇÃO DE DESPESAS\n`;
            csv += `Data;Descrição;Valor\n`;
            if (expenses.length > 0) {
                expenses.forEach(e => { csv += `${e.date};${e.description};€ ${e.amount.toFixed(2)}\n`; });
            } else {
                csv += `-;Sem Despesas Registadas;-\n`;
            }
            csv += `\n`;
            csv += `HISTÓRICO DE SESSÕES (Pagos/Confirmados)\n`;
            csv += `Data;Hora;Cliente;Telemóvel;Serviço;Status;Valor Cobrado\n`;
            const csvBookings = bookings.filter(b => b.date?.startsWith(selectedMonth) && (b.status === 'confirmed' || b.status === 'paid'));
            if (csvBookings.length > 0) {
                csvBookings.forEach((b: any) => {
                    const price = b.totalPrice || SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.price || 0;
                    csv += `${b.date};${b.time};${b.client?.name || '-'};${b.client?.phone || '-'};${SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.label || b.service};${b.status.toUpperCase()};€ ${price.toFixed(2)}\n`;
                });
            } else {
                csv += `-;-;-;-;Sem Faturação;-;-\n`;
            }
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `EstudioBraz_Contabilidade_${selectedMonth}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            showToast('Documento Contabilístico Descarregado!', 'success');
        } catch {
            showToast('Erro ao exportar.', 'error');
        } finally {
            setExporting(false);
        }
    };

    // =================== RENDER ===================
    if (loading && bookings.length === 0) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={32} className="animate-spin text-[#C5A059]" />
            </div>
        );
    }

    const maxMonthlyRev = Math.max(...stats.monthlyTrend.map(m => m.revenue), 1);

    return (
        <div>
            {/* CABEÇALHO DO CRM */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <BarChart3 className="text-[#C5A059]" size={24} /> Painel de Contabilidade
                    </h1>
                    <p className="text-white/40 text-sm mt-1">Navegue pelos meses para ver a faturação e despesas de forma isolada.</p>
                </div>

                {/* SELETOR DE MÊS */}
                <div className="flex items-center gap-3 bg-black/40 rounded-xl p-2 border border-white/5">
                    <button onClick={handlePrevMonth} className="p-2 text-[#C5A059] hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center min-w-[140px]">
                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Mês de Análise</span>
                        <span className="text-white font-black uppercase tracking-tight capitalize">{monthDisplay}</span>
                    </div>
                    <button onClick={handleNextMonth} className="p-2 text-[#C5A059] hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <button onClick={exportMonthlyCSV} disabled={exporting}
                    className="flex items-center gap-2 bg-[#C5A059] text-black px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-all disabled:opacity-50">
                    {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {exporting ? 'A Exportar...' : 'Baixar Fecho Mensal'}
                </button>
            </div>

            {/* ===== ROW 1: Key Metrics ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard icon={<DollarSign size={18} />} label="Faturação Bruta" value={`€${stats.revenue.toLocaleString()}`} sub={`€${stats.avgRevenue} por sessão`} color="text-[#C5A059]" bg="bg-[#C5A059]/10" />
                <MetricCard icon={<CheckCircle size={18} />} label="Sessões Faturadas" value={String(stats.paid)} sub={`${stats.conversionRate}% taxa de conversão`} color="text-emerald-400" bg="bg-emerald-500/10" />
                <MetricCard icon={<Calendar size={18} />} label="Total Agendado" value={String(stats.total)} sub={`${stats.pending} pendentes`} color="text-blue-400" bg="bg-blue-500/10" />
                <MetricCard icon={<Users size={18} />} label="Total Clientes" value={String(stats.totalClients)} sub="Base de dados global" color="text-purple-400" bg="bg-purple-500/10" />
            </div>

            {/* ===== ROW 2: Financial Panel ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <GrowthCard label="Receita Bruta (Mês)" value={`€${stats.revenue.toLocaleString()}`} growth={stats.revenueGrowth} color="text-braz-gold" icon={<DollarSign size={20} />} />
                <GrowthCard label="Despesas (Mês)" value={`€${stats.expenses.toLocaleString()}`} growth={0} color="text-red-400" icon={<TrendingUp size={20} className="rotate-180" />} flipGrowth={true} disableGrowth={true} />
                <GrowthCard label="Lucro Líquido (Mês)" value={`€${stats.net.toLocaleString()}`} growth={0} color="text-emerald-400" icon={<Wallet size={20} />} disableGrowth={true} />
            </div>

            {/* ===== ROW 2.5: Expenses ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Add Expense */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6 border-l-2 border-l-red-500/50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-5 flex items-center gap-2">
                        <Wallet size={14} className="text-red-400" /> Adicionar Despesa ({monthDisplay})
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" placeholder="Descrição (ex: Lâminas, Luz)" value={newExpenseDesc} onChange={(e) => setNewExpenseDesc(e.target.value)} disabled={expenseLoading}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-red-400/50 disabled:opacity-50" />
                        <div className="relative w-full sm:w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">€</span>
                            <input type="number" placeholder="0.00" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} disabled={expenseLoading}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-8 pr-4 text-sm text-white outline-none focus:border-red-400/50 disabled:opacity-50" />
                        </div>
                        <button onClick={handleAddExpense} disabled={expenseLoading}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {expenseLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Adicionar
                        </button>
                    </div>
                </div>

                {/* Expense List */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6 max-h-52 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                        Despesas de {monthDisplay}
                    </h3>
                    <div className="space-y-2">
                        {expenses.map((exp) => (
                            <div key={exp.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                <span className="text-sm text-white/80 font-medium">{exp.description}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-black text-red-400">€{exp.amount.toFixed(2)}</span>
                                    <button onClick={() => handleRemoveExpense(exp.id)} className="text-white/20 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {expenses.length === 0 && (
                            <p className="text-center text-xs text-white/20 italic pt-4">Nenhuma despesa registada em {monthDisplay}.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== ROW 3: Monthly Trend + Services ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                        <TrendingUp size={14} className="text-[#C5A059]" /> Evolução Mensal (6 Meses)
                    </h3>
                    <div className="flex items-end gap-2 h-40">
                        {stats.monthlyTrend.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <span className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">€{m.netData.toLocaleString()}</span>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(m.revenue / maxMonthlyRev) * 100}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="w-full bg-gradient-to-t from-emerald-500/20 to-emerald-500/60 rounded-t-lg min-h-[4px]"
                                />
                                <span className="text-[8px] text-white/30 uppercase font-bold">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                        <PieChart size={14} className="text-[#C5A059]" /> Receita por Serviço
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
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.percentage}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                                        className="h-full bg-gradient-to-r from-[#C5A059] to-[#E5C585] rounded-full" />
                                </div>
                            </div>
                        ))}
                        {stats.serviceBreakdown.length === 0 && (<p className="text-white/20 text-xs text-center py-8">Sem dados de serviços.</p>)}
                    </div>
                </div>
            </div>

            {/* ===== ROW 4: Hours + Days + Top Clients ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5 flex items-center gap-2">
                        <Clock size={14} className="text-blue-400" /> Horas Mais Movimentadas
                    </h3>
                    <div className="space-y-2.5">
                        {stats.busiestHours.map(([hour, count]: [string, number], i: number) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                                <span className="text-sm font-bold text-white/80">{hour}</span>
                                <span className="text-xs font-black text-blue-400">{count} sessões</span>
                            </div>
                        ))}
                        {stats.busiestHours.length === 0 && <p className="text-white/20 text-xs text-center">Sem dados.</p>}
                    </div>
                </div>

                <div className="bg-[#121212] rounded-2xl border border-white/5 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5 flex items-center gap-2">
                        <CalendarDays size={14} className="text-purple-400" /> Dias Mais Movimentados
                    </h3>
                    <div className="space-y-2.5">
                        {stats.busiestDays.map(([day, count]: [string, number], i: number) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg">
                                <span className="text-sm font-bold text-white/80">{day}</span>
                                <span className="text-xs font-black text-purple-400">{count} sessões</span>
                            </div>
                        ))}
                        {stats.busiestDays.length === 0 && <p className="text-white/20 text-xs text-center">Sem dados.</p>}
                    </div>
                </div>

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
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Distribuição por Status ({monthDisplay})</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatusCard label="Confirmados" count={stats.confirmed} total={stats.total} color="bg-green-500" />
                    <StatusCard label="Pendentes" count={stats.pending} total={stats.total} color="bg-yellow-500" />
                    <StatusCard label="Pagos" count={stats.paid} total={stats.total} color="bg-braz-gold" />
                    <StatusCard label="Cancelados" count={stats.cancelled} total={stats.total} color="bg-red-500" />
                    <StatusCard label="Total" count={stats.total} total={stats.total} color="bg-white" />
                </div>
            </div>

            <div className="h-10"></div>
        </div>
    );
};

export default ReportsPage;
