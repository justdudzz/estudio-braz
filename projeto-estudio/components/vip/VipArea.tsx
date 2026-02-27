import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, Clock, Sparkles, ChevronRight } from 'lucide-react';

const ClientVipArea: React.FC = () => {
  // Dados simulados (Até a Base de Dados ligar)
  const [clientInfo] = useState({
    name: "Joana Silva",
    tier: "Gold",
    points: 450,
    nextBooking: {
      service: "Microblading - Retoque",
      date: "15 de Abril, 2026",
      time: "14:30"
    }
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-12 font-montserrat pt-28">
      <div className="max-w-5xl mx-auto">
        
        {/* CABEÇALHO VIP */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
              Olá, {clientInfo.name.split(' ')[0]} <Sparkles className="text-braz-pink" />
            </h1>
            <p className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mt-2">
              Acesso Exclusivo Studio Braz
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-lg">
            <Star className="text-yellow-500" fill="currentColor" size={24} />
            <div>
              <p className="text-[10px] text-yellow-500/70 uppercase tracking-widest font-bold">Nível Atual</p>
              <p className="text-lg font-black text-yellow-500 uppercase tracking-widest">{clientInfo.tier}</p>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CARTÃO DE PONTOS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-[#121212] p-8 rounded-3xl border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-braz-pink/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
            
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-8">O Seu Saldo de Beleza</h2>
            <div className="flex items-end gap-4 mb-8">
              <span className="text-7xl font-black tracking-tighter">{clientInfo.points}</span>
              <span className="text-braz-pink font-bold uppercase tracking-widest mb-3">Pontos</span>
            </div>
            
            <div className="w-full bg-white/5 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-braz-pink to-purple-500 h-2 rounded-full w-[75%]" />
            </div>
            <p className="text-xs text-white/40 font-medium">Faltam apenas 50 pontos para desbloquear um Tratamento Facial de Oferta.</p>
          </motion.div>

          {/* PRÓXIMO AGENDAMENTO */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-braz-pink text-black p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-braz-pink/10"
          >
            <h2 className="text-sm font-bold uppercase tracking-widest mb-8 opacity-70">Próxima Visita</h2>
            <div className="space-y-4">
              <p className="font-black text-xl">{clientInfo.nextBooking.service}</p>
              <div className="flex items-center gap-3 text-sm font-medium opacity-80">
                <Clock size={16} />
                {clientInfo.nextBooking.date} às {clientInfo.nextBooking.time}
              </div>
            </div>
            <button className="mt-8 w-full bg-black text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Gerir Reserva
            </button>
          </motion.div>

          {/* VOUCHERS DISPONÍVEIS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 bg-[#121212] p-8 rounded-3xl border border-white/5"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest">Recompensas Desbloqueadas</h2>
              <Gift className="text-white/20" size={24} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-white/10 rounded-2xl p-6 flex justify-between items-center hover:border-braz-pink/50 cursor-pointer transition-all bg-white/5">
                <div>
                  <h3 className="font-bold text-lg mb-1">-15% em Skincare</h3>
                  <p className="text-xs text-white/40">Válido até 30 de Maio</p>
                </div>
                <ChevronRight className="text-braz-pink" />
              </div>
            </div>
          </motion.div>
        </main>

      </div>
    </div>
  );
};

export default ClientVipArea;