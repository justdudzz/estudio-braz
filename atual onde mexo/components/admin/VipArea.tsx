import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async'; // Importação adicionada
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Lock, DollarSign, ArrowLeft, Download, Search, CheckCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';

// Dados simulados movidos para fora para simular uma resposta de API
const VIP_CLIENTS_DATA = [
  { id: 101, name: "Cliente VIP Alpha", lastVisit: "2025-09-15", totalSpent: 1250.00 },
  { id: 102, name: "Cliente VIP Beta", lastVisit: "2025-09-10", totalSpent: 890.50 },
  { id: 103, name: "Cliente VIP Gamma", lastVisit: "2025-08-28", totalSpent: 2100.00 },
];

const AdminVipArea: React.FC = () => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    // Simulação de geração de relatório
    setTimeout(() => {
      setIsExporting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-braz-black p-6 md:p-12 font-montserrat">

      {/* Gestão de SEO/Meta Tags */}
      <Helmet>
        <title>Gestão VIP | {BUSINESS_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Banner de Modo de Demonstração (Padronizado com o Dashboard) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-600/10 border border-yellow-500/30 text-yellow-200 p-4 mb-8 rounded-xl flex items-center space-x-3"
      >
        <Lock className="w-5 h-5 flex-shrink-0 text-yellow-500" />
        <p className="font-bold uppercase tracking-widest text-[10px]">Acesso Restrito: Dados de demonstração do {BUSINESS_INFO.name}.</p>
      </motion.div>

      {/* Navegação e Cabeçalho */}
      <header className="mb-10 border-b border-white/5 pb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2 text-white/40 hover:text-braz-pink transition-colors mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Voltar ao Painel</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white uppercase tracking-tighter flex items-center space-x-3">
              <Star className="w-8 h-8 text-braz-pink" />
              <span>Gestão VIP Exclusiva</span>
            </h1>
            <p className="text-white/40 mt-1">Monitorização de clientes de alta fidelidade.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              placeholder="Procurar cliente..."
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-braz-pink outline-none transition-all w-full md:w-64"
            />
          </div>
        </div>
      </header>

      {/* Tabela de Clientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#171717] rounded-2xl shadow-2xl border border-white/5 overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Lista de Membros</h2>
          <span className="bg-braz-pink/10 text-braz-pink text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {VIP_CLIENTS_DATA.length} Clientes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-white/40 bg-white/5">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Nome do Cliente</th>
                <th className="p-4 font-bold">Última Visita</th>
                <th className="p-4 font-bold flex items-center space-x-1">
                  <DollarSign size={12} className="text-braz-pink" />
                  <span>Total Acumulado</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {VIP_CLIENTS_DATA.map((client, index) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-white/5 transition duration-200"
                >
                  <td className="p-4 font-mono text-xs text-white/30">{client.id}</td>
                  <td className="p-4 font-bold text-white/90">{client.name}</td>
                  <td className="p-4 text-sm text-white/60">{client.lastVisit}</td>
                  <td className="p-4 font-black text-braz-pink">€ {client.totalSpent.toFixed(2)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela com Ações */}
        <div className="p-6 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/20 uppercase tracking-widest">
            Dados atualizados em tempo real via CRM {BUSINESS_INFO.name}
          </p>

          <div className="flex items-center space-x-3">
            <AnimatePresence>
              {showSuccess && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-green-400 text-xs font-bold flex items-center space-x-1"
                >
                  <CheckCircle size={14} />
                  <span>Relatório Gerado</span>
                </motion.span>
              )}
            </AnimatePresence>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center space-x-2 bg-transparent border border-braz-pink text-braz-pink px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-braz-pink hover:text-braz-black transition-all active:scale-95 disabled:opacity-50"
            >
              {isExporting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Download size={16} />
                </motion.div>
              ) : <Download size={16} />}
              <span>{isExporting ? 'A Exportar...' : 'Exportar Lista VIP'}</span>
            </button>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default AdminVipArea;