import React from 'react';

export const MetricSkeleton = () => (
    <div className="bg-[#121212] rounded-2xl border border-white/5 p-6 flex flex-col items-start min-h-[140px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="w-10 h-10 rounded-xl bg-white/5 mb-4" />
        <div className="w-24 h-4 rounded-full bg-white/5 mb-2" />
        <div className="w-16 h-8 rounded-full bg-white/10" />
    </div>
);

export const AgendaSkeleton = () => (
    <div className="bg-[#121212] rounded-2xl border border-white/5 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="flex justify-between items-center mb-6">
            <div className="w-32 h-6 bg-white/5 rounded-full" />
            <div className="w-8 h-8 bg-white/5 rounded-lg" />
        </div>
        <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="w-1/3 h-4 bg-white/10 rounded-full" />
                        <div className="w-1/4 h-3 bg-white/5 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const TableSkeleton = () => (
    <div className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden w-full relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
        <div className="px-6 py-6 border-b border-white/5 bg-white/[0.02]">
            <div className="w-1/4 h-5 bg-white/5 rounded-full" />
        </div>
        <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="w-2/3 h-3.5 bg-white/10 rounded-full" />
                            <div className="w-1/2 h-2.5 bg-white/5 rounded-full" />
                        </div>
                    </div>
                    <div className="hidden md:block w-32 h-3.5 bg-white/5 rounded-full" />
                    <div className="hidden md:block w-24 h-3.5 bg-white/5 rounded-full" />
                    <div className="w-20 h-6 bg-white/5 rounded-full" />
                    <div className="w-24 h-8 bg-white/5 rounded-lg" />
                </div>
            ))}
        </div>
    </div>
);
