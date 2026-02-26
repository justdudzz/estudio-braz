import React from 'react';
import { Helmet } from 'react-helmet-async'; // Importação adicionada
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Settings, Zap, Star, LayoutDashboard, ArrowRight } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Dados de Demonstração (Mock)
  const stats = [
    { name: 'Agendamentos Hoje', value: 12, icon: Zap, trend: '+20%' },
    { name: 'Clientes Ativos', value: 145, icon: Users, trend: '+5' },
    { name: 'Serviços Ativos', value: 8, icon: Settings, trend: 'Estável' },
  ];

  return (
    <div className="min-h-screen bg-braz-black p-6 md:p-12 font-montserrat">
      
      {/* Gestão de SEO/Meta Tags */}
      <Helmet>
        <title>Painel Administrativo | {BUSINESS_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* 1. UX Polish: Banner de Demonstração Refinado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-600/10 border border-yellow-500/30 text-yellow-500 p-4 mb-10 rounded-xl flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 flex-shrink-0" />
            <p className="font-bold uppercase tracking-widest text-xs">Modo de Visualização - Dados de Teste</p>
        </div>
        <span className="text-[10px] bg-yellow-500/20 px-2 py-1 rounded">V1.0.4</span>
      </motion.div>

      <header className="mb-12 border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <div className="flex items-center space-x-2 text-braz-pink mb-2">
                <LayoutDashboard size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.3em]">Backoffice</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white uppercase tracking-tighter">
                Painel Administrativo
            </h1>
            <p className="text-white/40 mt-1">Gestão centralizada do {BUSINESS_INFO.name}.</p>
        </div>
        <div className="text-right">
            <p className="text-white/20 text-xs uppercase tracking-widest">Sessão iniciada como</p>
            <p className="text-white font-bold">{BUSINESS_INFO.owner}</p>
        </div>
      </header>

      {/* Grelha de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-[#171717] p-8 rounded-2xl shadow-2xl border border-white/5 group hover:border-braz-pink/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-braz-pink/10 rounded-xl text-braz-pink group-hover:bg-braz-pink group-hover:text-braz-black transition-all">
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-braz-pink/50 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <p className="text-sm uppercase text-white/40 font-medium tracking-wider">{stat.name}</p>
            <p className="text-5xl font-bold text-white mt-2 tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Secção de Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#171717] p-8 rounded-2xl shadow-2xl border border-white/5"
        >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-braz-pink rounded-full mr-3" />
                Operações Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="flex items-center justify-between bg-braz-pink text-braz-black p-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white transition-all group">
                    <span>Ver Agendamentos</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                    onClick={() => navigate('/admin/vip')}
                    className="flex items-center justify-between bg-white/5 text-white p-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 border border-white/10 transition-all group"
                >
                    <span>Gestão VIP</span>
                    <Star size={16} className="text-braz-pink" />
                </button>
            </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-braz-pink/5 p-8 rounded-2xl border border-braz-pink/20 flex flex-col justify-center"
        >
            <h3 className="text-white font-bold mb-2">Dica de Performance</h3>
            <p className="text-white/60 text-sm leading-relaxed">
                Tem 5 novos pedidos de Vouchers pendentes. Responda via WhatsApp para garantir a conversão da venda.
            </p>
        </motion.div>
      </div>

    </div>
  );
};

export default AdminDashboard;