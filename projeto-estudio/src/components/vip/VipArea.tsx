import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Gift, Clock, ShieldCheck, Trophy, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const VipArea: React.FC = () => {
  // 1. ESTADOS DA PÁGINA
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. CARREGAR DADOS DO CONTEXTO (já foram salvos no login)
  useEffect(() => {
    // Os dados do cliente VIP já vêm do AuthContext (guardados no localStorage no login)
    if (user) {
      setData(user);
    }

    // Simulação de histórico (Enquanto não criamos a rota real de histórico no backend)
    setHistory([
      { service: 'Manicure Gel', date: '10 Fev 2026', time: '14:30' },
      { service: 'Pedicure', date: '28 Jan 2026', time: '10:00' }
    ] as any);

    setLoading(false);
  }, [user]);

  // 3. ECRÃ DE CARREGAMENTO DE LUXO
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-montserrat">
        <div className="flex flex-col items-center gap-4 text-braz-gold">
          <Crown className="animate-pulse" size={48} strokeWidth={1.5} />
          <p className="text-xs font-bold uppercase tracking-[0.3em]">A preparar o seu Salão VIP...</p>
        </div>
      </div>
    );
  }

  // Cálculos para a barra de progresso
  const points = data?.points || 0;
  const progressPercentage = (points % 100);
  const pointsToNextTier = 100 - progressPercentage;

  // 4. ECRÃ PRINCIPAL
  return (
    <div className="min-h-screen bg-[#050505] text-white font-montserrat p-4 md:p-12 pt-24">
      <div className="max-w-5xl mx-auto">

        {/* Header de Boas-Vindas */}
        <header className="mb-12">
          <p className="text-braz-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-2">Bem-vinda ao Salão VIP</p>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
            Olá, {data?.name?.split(' ')[0] || 'Cliente'}!
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cartão de Pontos (Design Cartão de Crédito Black) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            {/* Decoração da Coroa em marca de água */}
            <div className="absolute -top-10 -right-10 p-10 opacity-5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-10 pointer-events-none">
              <Crown size={250} />
            </div>

            <div className="flex justify-between items-start mb-16 relative z-10">
              <ShieldCheck className="text-braz-gold" size={32} strokeWidth={1.5} />
              <span className="text-[10px] font-bold bg-gold-gradient text-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-braz-gold/20">
                Status {data?.tier || 'Silver'}
              </span>
            </div>

            <div className="mb-10 relative z-10">
              <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-2">Pontos Acumulados</p>
              <div className="flex items-end gap-3">
                <span className="text-6xl md:text-7xl font-black tracking-tighter">{points}</span>
                <span className="text-braz-gold font-bold pb-2 md:pb-3 text-sm uppercase tracking-widest">Pontos</span>
              </div>
            </div>

            {/* Barra de Progresso para o próximo Nível */}
            <div className="relative z-10">
              <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gold-gradient shadow-[0_0_15px_rgba(197,160,89,0.5)] rounded-full"
                />
              </div>
              <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest flex justify-between">
                <span>Progresso Atual</span>
                <span>Faltam <strong className="text-white">{pointsToNextTier} pts</strong> para nova oferta</span>
              </p>
            </div>
          </motion.div>

          {/* Widget de Recompensas Rápidas */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111] p-6 md:p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
              <Trophy className="text-braz-gold mb-4" size={24} strokeWidth={1.5} />
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-white/80">Próximo Mimo</h3>
              <p className="text-white/40 text-[11px] leading-relaxed">Aos 100 pontos ganha um <strong>Design de Sobrancelha</strong> gratuito. Continue a brilhar!</p>
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-braz-gold/10 to-transparent p-6 md:p-8 rounded-3xl border border-braz-gold/20 hover:border-braz-gold/40 transition-colors cursor-pointer group active:scale-95"
            >
              <Gift className="text-braz-gold mb-4 group-hover:scale-110 transition-transform" size={24} strokeWidth={1.5} />
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-braz-gold">Oferta Especial</h3>
              <p className="text-white/60 text-[11px] leading-relaxed">Traga uma amiga na próxima visita e ganhe <strong>20 pontos extra</strong> na hora!</p>
            </motion.div>
          </div>
        </div>

        {/* Histórico Recente */}
        <section className="mt-16">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3">
            <Clock className="text-braz-gold" strokeWidth={1.5} /> As Suas Visitas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.length > 0 ? history.map((h: any, i) => (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + (i * 0.1) }} key={i} className="bg-white/5 p-6 rounded-2xl flex justify-between items-center border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                <div>
                  <p className="font-bold text-sm uppercase tracking-wider mb-1 text-white/90">{h.service}</p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                    {h.date} <span className="w-1 h-1 bg-white/20 rounded-full"></span> {h.time}
                  </p>
                </div>
                <div className="bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-500/20 shadow-lg">
                  +10 PTS
                </div>
              </motion.div>
            )) : (
              <p className="text-white/20 text-xs uppercase font-bold tracking-widest italic col-span-full py-8 text-center border border-white/5 rounded-3xl border-dashed">
                A sua jornada de beleza começa agora. Faça a sua primeira marcação!
              </p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default VipArea;
