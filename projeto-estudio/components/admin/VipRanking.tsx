import React from 'react';
import { Trophy } from 'lucide-react';

interface VipClient {
    name: string;
    points: number;
    tier: string;
}

interface VipRankingProps {
    clients: VipClient[];
}

const VipRanking: React.FC<VipRankingProps> = ({ clients }) => {
    if (clients.length === 0) return null;

    return (
        <section className="bg-[#111] border border-white/5 p-6 md:p-8 rounded-2xl max-w-2xl mx-auto">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3">
                <Trophy className="text-braz-pink" size={22} /> Ranking de Fidelidade
            </h2>
            <div className="space-y-3">
                {clients.map((client, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-braz-pink/5 border border-transparent hover:border-braz-pink/20 transition-all">
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-black text-white/10 w-8">#{index + 1}</span>
                            <span className="font-bold text-sm">{client.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-braz-pink font-black text-sm">{client.points} PTS</span>
                            <span className="bg-braz-pink/10 text-braz-pink px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                {client.tier}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default VipRanking;
