import React from 'react';
import { Euro, Clock, Sparkles } from 'lucide-react';

interface MetricsData {
    revenue: number;
    confirmedCount: number;
    pendingCount: number;
    totalBookings: number;
}

interface DashboardMetricsProps {
    metrics: MetricsData;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Faturação */}
            <div className="bg-[#171717] p-5 md:p-6 rounded-2xl border border-braz-gold/20 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Faturação Estimada</span>
                    <Euro className="text-braz-gold w-4 h-4" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">€ {metrics.revenue}</p>
                <p className="text-[9px] text-braz-gold mt-2 uppercase tracking-widest">
                    {metrics.confirmedCount} serviço{metrics.confirmedCount !== 1 ? 's' : ''} confirmado{metrics.confirmedCount !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Pendentes */}
            <div className="bg-[#171717] p-5 md:p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Aguardam Decisão</span>
                    <Clock className="text-white/20 w-4 h-4" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{metrics.pendingCount}</p>
                <p className="text-[9px] text-white/20 mt-2 uppercase tracking-widest">Pedidos Pendentes</p>
            </div>

            {/* Total */}
            <div className="bg-[#171717] p-5 md:p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Total de Experiências</span>
                    <Sparkles className="text-white/20 w-4 h-4" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{metrics.totalBookings}</p>
                <p className="text-[9px] text-white/20 mt-2 uppercase tracking-widest">Desde o início</p>
            </div>
        </div>
    );
};

export default DashboardMetrics;
