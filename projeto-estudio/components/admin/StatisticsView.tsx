import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, subDays, subMonths, addDays, addMonths, startOfDay, endOfDay, isWithinInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useAdminData } from '../../contexts/AdminDataContext';
import { SERVICES_CONFIG, UI_COLORS } from '../../utils/constants';
import api from '../../src/services/api';

type TimeFilter = 'realtime' | '1d' | '1w' | '1m' | '6m' | '1y' | 'max';

const FILTERS: { value: TimeFilter; label: string }[] = [
    { value: 'realtime', label: 'Tempo Real' },
    { value: '1d', label: '1 Dia' },
    { value: '1w', label: '1 Semana' },
    { value: '1m', label: '1 Mês' },
    { value: '6m', label: '6 Meses' },
    { value: '1y', label: '1 Ano' },
    { value: 'max', label: 'Máx' },
];

const StatisticsView: React.FC = () => {
    const { expenses, lastUpdate } = useAdminData(); // Despesas e refresh trigger
    const [filter, setFilter] = useState<TimeFilter>('1w');
    const [allBookings, setAllBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch dynamic data based on filter
    useEffect(() => {
        const fetchStatsData = async () => {
            try {
                if (allBookings.length === 0) setLoading(true);
                let startStr = '';
                let endStr = '';
                const today = new Date();

                switch (filter) {
                    case 'realtime':
                    case '1d':
                        startStr = format(startOfDay(today), 'yyyy-MM-dd');
                        endStr = format(endOfDay(today), 'yyyy-MM-dd');
                        break;
                    case '1w':
                        startStr = format(subDays(today, 6), 'yyyy-MM-dd'); // 7 dias passados
                        endStr = format(addDays(today, 14), 'yyyy-MM-dd'); // +2 semanas de previsão
                        break;
                    case '1m':
                        startStr = format(subDays(today, 29), 'yyyy-MM-dd'); // 30 dias passados
                        endStr = format(addDays(today, 30), 'yyyy-MM-dd'); // +30 dias de previsão
                        break;
                    case '6m':
                        startStr = format(subMonths(today, 6), 'yyyy-MM-dd');
                        endStr = format(addMonths(today, 3), 'yyyy-MM-dd'); // +3 meses
                        break;
                    case '1y':
                        startStr = format(subMonths(today, 12), 'yyyy-MM-dd');
                        endStr = format(addMonths(today, 6), 'yyyy-MM-dd'); // +6 meses
                        break;
                    case 'max':
                        // Fetch everything sem restrição
                        startStr = '';
                        endStr = '';
                        break;
                }

                // API Endpoint: Se max, a startDate é vazia. O backend deve devolver os max permitidos (limitamos a 500 no controller)
                const url = startStr && endStr ? `/bookings?startDate=${startStr}&endDate=${format(today, 'yyyy-MM-dd')}` : '/bookings';
                const res = await api.get(url);
                setAllBookings(Array.isArray(res) ? res : res.data || []);
            } catch (error) {
                console.error("Erro a carregar estatísticas", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatsData();
    }, [filter, lastUpdate]);

    // Calcular estatísticas com base nos dados obtidos
    const chartData = useMemo(() => {
        if (!allBookings.length) return [];

        const groupedData: Record<string, { name: string; Agendamentos: number; Faturacao: number; Lucro: number; timestamp: number }> = {};

        // Granularidade
        const isHourly = filter === 'realtime' || filter === '1d';
        const isMonthly = filter === '6m' || filter === '1y' || filter === 'max';

        // 1. Processar Agendamentos (Faturação)
        allBookings.forEach(b => {
            if (b.status === 'cancelled' || b.status === 'blocked') return;

            // Extrair "2026-03-05" e "14:30"
            const dateStr = b.date;
            const hourStr = b.time ? b.time.split(':')[0] : '12';

            let key = '';
            let label = '';
            let orderWeight = 0;

            if (isHourly) {
                key = `${dateStr}T${hourStr}:00`;
                label = `${hourStr}:00`;
                orderWeight = new Date(`${dateStr}T${hourStr}:00:00`).getTime();
            } else if (isMonthly) {
                key = dateStr.slice(0, 7); // yyyy-MM
                const dummyDate = new Date(`${key}-01T12:00:00`);
                label = format(dummyDate, 'MMM yyyy', { locale: pt });
                orderWeight = dummyDate.getTime();
            } else {
                key = dateStr;
                const dummyDate = new Date(`${dateStr}T12:00:00`);
                label = format(dummyDate, 'dd MMM', { locale: pt });
                orderWeight = dummyDate.getTime();
            }

            if (!groupedData[key]) {
                groupedData[key] = { name: label, Agendamentos: 0, Faturacao: 0, Lucro: 0, timestamp: orderWeight };
            }

            if (b.status === 'confirmed' || b.status === 'paid') {
                const rev = b.totalPrice || SERVICES_CONFIG[b.service as keyof typeof SERVICES_CONFIG]?.price || 0;
                groupedData[key].Faturacao += rev;
                groupedData[key].Agendamentos += 1;
            }
        });

        // 2. Processar Despesas
        expenses.forEach(e => {
            const dateStr = e.date; // "2026-03-05"
            let key = '';

            if (isHourly) {
                key = `${dateStr}T00:00`; // Despesas diárias caem na hora zero
            } else if (isMonthly) {
                key = dateStr.slice(0, 7); // yyyy-MM
            } else {
                key = dateStr;
            }

            if (groupedData[key]) {
                groupedData[key].Lucro -= e.amount;
            } else {
                let label = '';
                let orderWeight = 0;
                if (isMonthly) {
                    const dummyDate = new Date(`${key}-01T12:00:00`);
                    label = format(dummyDate, 'MMM yyyy', { locale: pt });
                    orderWeight = dummyDate.getTime();
                } else if (isHourly) {
                    label = '00:00';
                    orderWeight = new Date(`${dateStr}T00:00:00`).getTime();
                } else {
                    const dummyDate = new Date(`${dateStr}T12:00:00`);
                    label = format(dummyDate, 'dd MMM', { locale: pt });
                    orderWeight = dummyDate.getTime();
                }
                groupedData[key] = { name: label, Agendamentos: 0, Faturacao: 0, Lucro: -e.amount, timestamp: orderWeight };
            }
        });

        // 3. Finalizar Cálculo: Lucro = Faturação (se houver) + Lucro (onde subtraímos as despesas)
        Object.values(groupedData).forEach(item => {
            item.Lucro = item.Faturacao + item.Lucro; // ex: Lucro = 100 + (-20) = 80
        });

        // Sort by timestamp
        return Object.values(groupedData).sort((a, b) => a.timestamp - b.timestamp);
    }, [allBookings, expenses, filter]);


    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl shadow-2xl">
                    <p className="text-white font-bold mb-2 uppercase tracking-widest text-[10px]">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs my-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-white/70">{entry.name}:</span>
                            <span className="text-white font-bold">
                                {entry.name === 'Agendamentos' ? entry.value : `€${entry.value.toFixed(2)}`}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in font-montserrat mt-8">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 bg-[#121212] border border-white/5 p-2 rounded-2xl shadow-lg">
                {FILTERS.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`flex-1 min-w-[80px] py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${filter === f.value
                            ? 'bg-braz-gold text-black shadow-lg shadow-braz-gold/20'
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Chart Area */}
            <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl shadow-2xl relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                        <div className="animate-spin w-8 h-8 border-2 border-braz-gold border-t-transparent rounded-full"></div>
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-lg font-black uppercase tracking-widest text-white">Evolução do Estúdio</h2>
                    <p className="text-[10px] text-braz-gold font-bold uppercase tracking-widest mt-1">
                        Análise de {FILTERS.find(f => f.value === filter)?.label}
                    </p>
                </div>

                {chartData.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-white/30 text-xs font-bold uppercase tracking-widest">
                        Não existem dados suficientes neste período temporal.
                    </div>
                ) : (
                    <div className="h-[400px] w-full relative">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#ffffff30"
                                    tick={{ fill: '#ffffff50', fontSize: 10, fontWeight: 'bold' }}
                                    tickMargin={15}
                                    axisLine={false}
                                />
                                <YAxis
                                    yAxisId="left"
                                    stroke="#ffffff30"
                                    tick={{ fill: '#ffffff50', fontSize: 10, fontWeight: 'bold' }}
                                    tickMargin={15}
                                    axisLine={false}
                                    tickFormatter={(val) => `€${val}`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#ffffff30"
                                    tick={{ fill: '#ffffff50', fontSize: 10, fontWeight: 'bold' }}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#C5A059', strokeWidth: 1, strokeDasharray: '5 5' }} />

                                {/* Faturação (Verde na imagem) */}
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="Faturacao"
                                    name="Faturação"
                                    stroke="#14B8A6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#121212', stroke: '#14B8A6', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#14B8A6', stroke: '#121212', strokeWidth: 2 }}
                                />

                                {/* Lucro Líquido (Laranja na imagem) */}
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="Lucro"
                                    name="Lucro Líquido"
                                    stroke="#F59E0B"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#121212', stroke: '#F59E0B', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#F59E0B', stroke: '#121212', strokeWidth: 2 }}
                                />

                                {/* Agendamentos (Azul na imagem) */}
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="Agendamentos"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#121212', stroke: '#3B82F6', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#3B82F6', stroke: '#121212', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <p className="text-center text-white/20 text-[10px] uppercase tracking-widest py-4">
                Powered by Recharts Analytics Engine
            </p>
        </div>
    );
};

export default StatisticsView;
