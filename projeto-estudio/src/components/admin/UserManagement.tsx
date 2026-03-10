import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Shield, Mail, Phone, Search, Download, Loader2, BarChart3, Euro, ChevronRight, ChevronLeft, CheckCircle2, Calendar as CalendarIcon, Briefcase, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import { isValidNIF } from '../../utils/validators';
import EmptyState from './ui/EmptyState';
import Copyable from './ui/Copyable';
import PasswordStrength from './ui/PasswordStrength';
import PremiumImage from '../common/PremiumImage';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { staff: users, loading: isLoadingGlobal, refreshData } = useAdminData();
  const [services, setServices] = useState<any[]>([]);
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [isCreatingLoading, setIsCreatingLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [newUser, setNewUser] = useState({ 
    email: '', 
    password: '', 
    role: 'ADMIN_STAFF',
    displayName: '',
    lastName: '',
    birthDate: '',
    nif: '',
    businessName: '',
    serviceIds: [] as string[]
  });
  
  const [editingUser, setEditingUser] = useState<any>(null);

  // Carregar apenas os serviços globais
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRes = await api.get('/staff/services'); 
        const allPossibleServices = servicesRes.data.flatMap((staff: any) => staff.providedServices || []);
        const uniqueServices = Array.from(new Map(allPossibleServices.map((s: any) => [s.id, s])).values()) as any[];
        setServices(uniqueServices);
      } catch (err) {}
    };
    fetchServices();
  }, []);

  const handleDeleteUser = async (id: string, email: string) => {
    if (email === 'mariana@studiobraz.com') {
      alert("A Mariana é a fundadora e líder suprema. Não é possível remover o acesso principal.");
      return;
    }

    if (window.confirm(`⚠️ AVISO: Deseja remover permanentemente o acesso de ${email}?`)) {
      try {
        await api.delete(`/staff/${id}`);
        await refreshData(true);
      } catch (error: any) {
        alert("Erro ao remover: " + (error.response?.data?.error || "Serviço indisponível"));
      }
    }
  };

  const handleCreateUser = async () => {
    if (newUser.nif && !isValidNIF(newUser.nif)) {
      alert("O NIF inserido é matematicamente inválido. Por favor, verifique.");
      return;
    }
    setIsCreatingLoading(true);
    try {
      await api.post('/staff/upsert', newUser);
      setIsCreatingModal(false);
      setNewUser({ 
        email: '', password: '', role: 'ADMIN_STAFF', 
        displayName: '', lastName: '', birthDate: '', 
        nif: '', businessName: '', serviceIds: [] 
      });
      setStep(1);
      await refreshData(true);
      alert("Acesso ativado com sucesso para " + newUser.email);
    } catch (error: any) {
      alert("Erro ao criar utilizador: " + (error.response?.data?.error || error.message));
    } finally {
      setIsCreatingLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser.nif && !isValidNIF(editingUser.nif)) {
      alert("O NIF inserido é matematicamente inválido.");
      return;
    }
    try {
      await api.post('/staff/upsert', {
        ...editingUser,
        serviceIds: editingUser.services 
      });
      setEditingUser(null);
      await refreshData(true);
      alert("Dados da profissional atualizados com sucesso.");
    } catch (error: any) {
      alert("Erro ao atualizar: " + (error.response?.data?.error || error.message));
    }
  };

  const exportClientsCSV = async () => {
    try {
      const response = await api.get('/bookings/clients/export-csv');
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clientes-studiobraz-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      alert("Erro ao exportar CSV.");
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Gestão de Equipa</h2>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Quadro de Recrutamento & VIPs</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={exportClientsCSV} className="flex-1 md:flex-none bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
            <Download size={14} /> VIPs (CSV)
          </button>
          <button 
            onClick={() => setIsCreatingModal(true)} 
            className="flex-1 md:flex-none bg-braz-gold text-black px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all shadow-xl shadow-braz-gold/10"
          >
            <UserPlus size={14} /> Novo Membro
          </button>
        </div>
      </header>

      {/* Lista de Staff Ativo */}
      <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-braz-gold mb-1">Equipa do Estúdio</p>
                <h3 className="text-xl font-bold">Profissionais Ativas</h3>
            </div>
            <div className="flex -space-x-3">
                {users.slice(0, 5).map(u => (
                    <div key={u.id} className="w-10 h-10 rounded-full border-2 border-black bg-braz-gold/10 flex items-center justify-center text-[10px] font-black overflow-hidden ring-1 ring-white/5">
                        {u.photoUrl ? <PremiumImage src={u.photoUrl} alt={u.displayName} className="w-full h-full" /> : (u.displayName || u.email).charAt(0)}
                    </div>
                ))}
                {users.length > 5 && (
                    <div className="w-10 h-10 rounded-full border-2 border-black bg-[#121212] flex items-center justify-center text-[8px] font-black text-white/40 ring-1 ring-white/5">
                        +{users.length - 5}
                    </div>
                )}
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5">
                <th className="p-8">Identidade</th>
                <th className="p-8">Nível / Role</th>
                <th className="p-8">Fiscalidade</th>
                <th className="p-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      {u.photoUrl ? (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 group-hover:border-braz-gold/50 transition-colors">
                            <PremiumImage src={u.photoUrl} alt={u.displayName} className="w-full h-full" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-braz-gold/10 flex items-center justify-center text-braz-gold font-black uppercase text-sm border border-braz-gold/20">
                          {(u.displayName || u.email).charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-black text-white group-hover:text-braz-gold transition-colors">{u.displayName} {u.lastName}</p>
                        <Copyable value={u.email} className="text-[10px] text-white/30 font-medium" />
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        u.role === 'SUPER_ADMIN' ? 'bg-braz-gold text-black border-braz-gold' : 
                        u.role === 'ACCOUNTANT' ? 'bg-blue-500/10 text-blue-400 border-blue-400/20' : 
                        'bg-white/5 text-white/50 border-white/10'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col">
                        {u.nif ? (
                            <Copyable value={u.nif} className="text-xs font-bold text-white/80" />
                        ) : (
                            <span className="text-xs font-bold text-white/30 italic">NIF em falta</span>
                        )}
                        <span className="text-[9px] text-white/20 uppercase font-black">{u.businessName || 'Pessoal'}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-end gap-2 items-center">
                      {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ACCOUNTANT') && (
                        <Link 
                          to={`/dashboard/contabilidade?targetStaffId=${u.id}&targetName=${encodeURIComponent(u.displayName || u.email)}&targetNif=${u.nif || ''}`}
                          className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-braz-gold hover:bg-braz-gold/10 transition-all border border-transparent hover:border-braz-gold/20"
                          title="Auditoria Financeira"
                        >
                          <Euro size={18} />
                        </Link>
                      )}

                      {currentUser?.role === 'SUPER_ADMIN' && (
                        <Link 
                          to={`/dashboard/relatorios?targetStaffId=${u.id}&targetName=${encodeURIComponent(u.displayName || u.email)}`}
                          className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all border border-transparent hover:border-emerald-400/20"
                          title="Estatísticas de Performance"
                        >
                          <BarChart3 size={18} />
                        </Link>
                      )}

                      <div className="w-[1px] h-6 bg-white/5 mx-2" />

                      <button onClick={() => setEditingUser({ ...u, services: u.providedServices?.map((s: any) => s.id) || [] })} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all">Editar</button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        className={`p-3 rounded-xl transition-all ${u.email === 'mariana@studiobraz.com' ? 'text-white/5 cursor-not-allowed' : 'text-white/10 hover:text-red-500 hover:bg-red-500/10'}`}
                        disabled={u.email === 'mariana@studiobraz.com'}
                      >
                        <UserMinus size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !isLoadingGlobal && (
              <div className="p-10">
                  <EmptyState 
                    title="Nenhum membro na equipa" 
                    description="O estúdio ainda não tem profissionais registadas. Clique em 'Novo Membro' para começar o recrutamento."
                    type="inbox"
                    action={{ label: 'Recrutar Agora', onClick: () => setIsCreatingModal(true) }}
                  />
              </div>
          )}
        </div>
      </div>

      {/* MODAL CRIAR (GOOGLE FORM STYLE) */}
      <AnimatePresence>
        {isCreatingModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0f0f0f] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative"
            >
              {/* Progresso */}
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                  className="h-full bg-braz-gold shadow-[0_0_10px_#C5A059]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                />
              </div>

              {/* Cabeçalho Modal */}
              <div className="p-10 pb-0 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-braz-gold">Passo {step} de 3</span>
                  <h3 className="text-3xl font-black uppercase mt-2">Novo Talento</h3>
                </div>
                <button onClick={() => setIsCreatingModal(false)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 transition-all">
                  <ChevronLeft className="rotate-45" size={24} />
                </button>
              </div>

              {/* Conteúdo do Passo */}
              <div className="p-10 min-h-[400px]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-braz-gold/10 flex items-center justify-center text-braz-gold">
                            <CalendarIcon size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Identidade do Staff</h4>
                            <p className="text-[10px] text-white/40 uppercase font-black">Quem é a pessoa que se junta à equipa?</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Primeiro Nome</label>
                           <input type="text" placeholder="Ex: Ana" value={newUser.displayName} onChange={e => setNewUser({...newUser, displayName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-braz-gold/50 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Apelido</label>
                           <input type="text" placeholder="Ex: Silva" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-braz-gold/50 transition-all" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Data de Nascimento (Aniversário)</label>
                        <input type="date" value={newUser.birthDate} onChange={e => setNewUser({...newUser, birthDate: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-braz-gold/50 transition-all [color-scheme:dark]" />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-braz-gold/10 flex items-center justify-center text-braz-gold">
                            <Euro size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Identidade Fiscal</h4>
                            <p className="text-[10px] text-white/40 uppercase font-black">Dados obrigatórios para faturação e SAFT-T.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">NIF da Trabalhadora (Obrigatório)</label>
                           <input 
                             type="text" 
                             placeholder="000 000 000" 
                             value={newUser.nif} 
                             onChange={e => setNewUser({...newUser, nif: e.target.value.replace(/\s/g, '')})} 
                             className={`w-full bg-white/5 border p-5 rounded-2xl text-white outline-none transition-all font-mono ${
                                newUser.nif ? (isValidNIF(newUser.nif) ? 'border-green-500/50 focus:border-green-500' : 'border-red-500/50 focus:border-red-500') : 'border-white/10 focus:border-braz-gold/50'
                             }`} 
                           />
                           {newUser.nif && !isValidNIF(newUser.nif) && <p className="text-[9px] text-red-400 mt-2 font-bold uppercase tracking-wider ml-2">NIF Inválido</p>}
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Nome da Empresa / Recibos Verdes (Opcional)</label>
                           <input type="text" placeholder="Ex: Ana Silva Tatuagens Lda" value={newUser.businessName} onChange={e => setNewUser({...newUser, businessName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-braz-gold/50 transition-all" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-braz-gold/10 flex items-center justify-center text-braz-gold">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Acesso & Funções</h4>
                            <p className="text-[10px] text-white/40 uppercase font-black">Credenciais de login e serviços atribuídos.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">E-mail de Login</label>
                           <input type="email" placeholder="ana@studiobraz.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-braz-gold/50 transition-all" />
                        </div>
                         <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Password Inicial</label>
                           <input type="text" placeholder="Ex: AnaBraz2026" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-braz-gold/50 transition-all" />
                           <PasswordStrength password={newUser.password} />
                         </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Cargo / Nível de Acesso</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['ADMIN_STAFF', 'ACCOUNTANT', 'SUPER_ADMIN'].map(r => (
                                <button 
                                    key={r}
                                    onClick={() => setNewUser({...newUser, role: r})}
                                    className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                                        newUser.role === r ? 'bg-braz-gold text-black border-braz-gold' : 'bg-white/5 text-white/30 border-white/10'
                                    }`}
                                >
                                    {r.replace('ADMIN_', '')}
                                </button>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Serviços que a profissional presta</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                           {services.map(s => (
                               <button 
                                 key={s.id}
                                 onClick={() => {
                                     const current = newUser.serviceIds;
                                     const next = current.includes(s.id) ? current.filter(id => id !== s.id) : [...current, s.id];
                                     setNewUser({...newUser, serviceIds: next});
                                 }}
                                 className={`p-3 rounded-xl text-left text-[9px] font-bold border transition-all flex items-center justify-between ${
                                     newUser.serviceIds.includes(s.id) ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-white/20'
                                 }`}
                               >
                                   {s.label}
                                   {newUser.serviceIds.includes(s.id) && <CheckCircle2 size={12} className="text-braz-gold" />}
                               </button>
                           ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Rodapé Modal */}
              <div className="p-10 pt-0 flex gap-4">
                {step > 1 && (
                    <button 
                        onClick={() => setStep(step - 1)}
                        className="flex-1 bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                        <ChevronLeft size={16} /> Anterior
                    </button>
                )}
                
                {step < 3 ? (
                    <button 
                        onClick={() => setStep(step + 1)}
                        disabled={step === 1 && !newUser.displayName}
                        className="flex-[2] bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-braz-gold transition-all disabled:opacity-50"
                    >
                        Próximo Passo <ChevronRight size={16} />
                    </button>
                ) : (
                    <button 
                        onClick={handleCreateUser}
                        disabled={isCreatingLoading || !newUser.email || !newUser.nif}
                        className="flex-[2] bg-braz-gold text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all shadow-xl shadow-braz-gold/20"
                    >
                        {isCreatingLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} 
                        Criar Conta e Ativar
                    </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Edição (Mantido mais simples para ajustes rápidos) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#0a0a0a] w-full max-w-2xl rounded-[3rem] border border-white/10 p-10 shadow-2xl space-y-8 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl font-black uppercase tracking-tighter">Ficha da Profissional</h3>
            
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Nome Artístico</label>
                  <input type="text" value={editingUser.displayName || ''} onChange={e => setEditingUser({...editingUser, displayName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-braz-gold/40" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Apelido</label>
                  <input type="text" value={editingUser.lastName || ''} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-braz-gold/40" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Data de Nascimento</label>
                  <input type="date" value={editingUser.birthDate || ''} onChange={e => setEditingUser({...editingUser, birthDate: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-braz-gold/40 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">URL Foto Perfil</label>
                  <input type="text" value={editingUser.photoUrl || ''} onChange={e => setEditingUser({...editingUser, photoUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-braz-gold/40" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Identidade Fiscal (NIF)</label>
                  <input type="text" value={editingUser.nif || ''} onChange={e => setEditingUser({...editingUser, nif: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-mono outline-none focus:border-braz-gold/40" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Empresa / Recibos</label>
                  <input type="text" value={editingUser.businessName || ''} onChange={e => setEditingUser({...editingUser, businessName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-braz-gold/40" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Atribuição de Serviços</label>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-4 bg-black/50 rounded-2xl border border-white/5 custom-scrollbar">
                  {services.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-xs text-white/60 cursor-pointer hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={editingUser.services?.includes(s.id)} 
                        onChange={e => {
                          const current = editingUser.services || [];
                          const next = e.target.checked ? [...current, s.id] : current.filter((id: string) => id !== s.id);
                          setEditingUser({...editingUser, services: next});
                        }}
                        className="accent-braz-gold"
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-white/5 text-white py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
                <button type="submit" className="flex-[2] bg-braz-gold text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-braz-gold/10">Guardar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
