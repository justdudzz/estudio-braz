import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub: string;
    color: string;
    bg: string;
}

export const MetricCard = ({ icon, label, value, sub, color, bg }: MetricCardProps) => (
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

interface GrowthCardProps {
    label: string;
    value: string | number;
    growth: number;
    color?: string;
    icon?: React.ReactNode;
    disableGrowth?: boolean;
    flipGrowth?: boolean;
}

export const GrowthCard = ({ label, value, growth, color = 'text-white', icon, disableGrowth = false, flipGrowth = false }: GrowthCardProps) => {
    const isPositive = growth >= 0;
    const growthGood = flipGrowth ? !isPositive : isPositive;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] rounded-2xl border border-white/5 p-6 flex items-center justify-between"
        >
            <div className="flex flex-col gap-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1 flex items-center gap-2">
                    {icon} {label}
                </div>
                <p className={`text-3xl font-black tracking-tighter ${color}`}>{value}</p>
            </div>
            {!disableGrowth && (
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${growthGood ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(growth)}%
                </div>
            )}
        </motion.div>
    );
};

interface StatusCardProps {
    label: string;
    count: number;
    total: number;
    color: string;
}

export const StatusCard = ({ label, count, total, color }: StatusCardProps) => {
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
