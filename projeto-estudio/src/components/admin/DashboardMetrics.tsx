import React from 'react';
import { Euro, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard } from './ui/StatCards';
import { MetricSkeleton } from './ui/Skeletons';

interface MetricsData {
    revenue: number;
    todayCount: number;
    pendingCount: number;
}

interface DashboardMetricsProps {
    metrics: MetricsData;
    isLoading?: boolean;
}



const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
            >
                <MetricCard
                    icon={<Euro size={18} />}
                    label="Esperado Hoje"
                    value={`€${metrics.revenue}`}
                    sub="Receita para o dia de hoje"
                    color="text-braz-gold"
                    bg="bg-braz-gold/10"
                />

                <MetricCard
                    icon={<Clock size={18} />}
                    label="Ação Necessária"
                    value={String(metrics.pendingCount)}
                    sub="Pedidos Pendentes"
                    color="text-yellow-400"
                    bg="bg-yellow-400/10"
                />

                <MetricCard
                    icon={<Sparkles size={18} />}
                    label="Sessões Hoje"
                    value={String(metrics.todayCount)}
                    sub="Marcações confirmadas (não canceladas)"
                    color="text-white"
                    bg="bg-white/10"
                />
            </motion.div>
        </AnimatePresence >
    );
};

export default DashboardMetrics;
