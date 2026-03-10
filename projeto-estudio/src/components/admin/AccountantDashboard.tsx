import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Filter, Calendar, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AccountantDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const targetStaffId = queryParams.get('targetStaffId');
  const targetName = queryParams.get('targetName');
  const initialNif = queryParams.get('targetNif') || '';

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [nif, setNif] = useState(initialNif);
  const [isExporting, setIsExporting] = useState(false);
  const [report, setReport] = useState<any>(null);

  // Atualizar NIF se mudar a funcionária no menu lateral
  useEffect(() => {
    setNif(initialNif);
    setReport(null);
  }, [initialNif, targetStaffId]);

  const handleFetchReport = async () => {
    try {
      const url = targetStaffId 
        ? `/billing/report?month=${month}&year=${year}&staffId=${targetStaffId}`
        : `/billing/report?month=${month}&year=${year}`;
      const response = await api.get(url);
      setReport(response.data);
    } catch (error) {
      alert("Erro ao carregar relatório.");
    }
  };

  const handleDownloadSaft = async () => {
    if (!nif) return alert("Por favor, insira o NIF para a extração SAFT-T.");
    setIsExporting(true);
    try {
      window.open(`${api.defaults.baseURL}/billing/saft?month=${month}&year=${year}&nif=${nif}`, '_blank');
    } catch (error) {
      alert("Erro na exportação.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8 space-y-10">
      <header>
        <h2 className="text-3xl font-black uppercase text-white tracking-tighter">
          {targetName ? `Contabilidade: ${targetName}` : 'Contabilidade Geral'}
        </h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">
          {targetName ? `Faturação e Relatórios de Elite para ${targetName}` : 'Extração de Dados SAFT-T e Relatórios por NIF'}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#121212] p-8 rounded-3xl border border-white/5 shadow-xl">
        <div>
          <label className="block text-[10px] font-black uppercase text-white/30 mb-2">Mês</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('pt-PT', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-white/30 mb-2">Ano</label>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-white/30 mb-2">Filtrar por NIF (Obrigatório para SAFT)</label>
          <input type="text" placeholder="Ex: 123456789" value={nif} onChange={e => setNif(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none" />
        </div>
        <div className="flex items-end">
          <button onClick={handleFetchReport} className="w-full bg-braz-gold text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
            <Filter size={14} /> Carregar Gestão
          </button>
        </div>
      </div>

      {report && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#121212] p-10 rounded-[2rem] border border-white/5 shadow-2xl space-y-8">
           <div className="flex justify-between items-center border-b border-white/5 pb-8">
             <div>
               <p className="text-4xl font-black text-white">{report.revenue.toFixed(2)}€</p>
               <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Faturação Total (Bruta)</p>
             </div>
             {user?.role !== 'ACCOUNTANT' && (
               <div className="text-right">
                 <p className="text-2xl font-black text-braz-gold">{report.profit.toFixed(2)}€</p>
                 <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Resultado Líquido Estimado</p>
               </div>
             )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button onClick={handleDownloadSaft} disabled={isExporting} className="bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
               <Download size={16} /> Extrair SAFT-T ({nif || 'NIF em falta'})
             </button>
             <button className="bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
               <FileText size={16} /> Relatórios Financeiros (PDF)
             </button>
           </div>
        </motion.div>
      )}
    </div>
  );
};

export default AccountantDashboard;
