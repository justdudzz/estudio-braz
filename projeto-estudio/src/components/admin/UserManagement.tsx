import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Shield, Mail, Phone, Search, Download, Loader2 } from 'lucide-react';
import api from '../../services/api';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'ADMIN_STAFF' });
  const [editingUser, setEditingUser] = useState<any>(null);
  const fetchUsers = async () => {
    try {
      const usersRes = await api.get('/staff');
      setUsers(usersRes.data);
      
      // Obter lista global de serviços (DEDUPLICADA POR ID para evitar repetições no modal)
      const servicesRes = await api.get('/staff/services'); 
      const allPossibleServices = servicesRes.data.flatMap((staff: any) => staff.providedServices || []);
      
      const uniqueServices = Array.from(new Map(allPossibleServices.map((s: any) => [s.id, s])).values()) as any[];
      setServices(uniqueServices);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (email === 'mariana@studiobraz.com') {
      alert("A Mariana é a fundadora e líder suprema. Não é possível remover o acesso principal.");
      return;
    }

    if (window.confirm(`⚠️ AVISO: Deseja remover permanentemente o acesso de ${email}?`)) {
      try {
        await api.delete(`/staff/${id}`);
        await fetchUsers();
      } catch (error: any) {
        alert("Erro ao remover: " + (error.response?.data?.error || "Serviço indisponível"));
      }
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/staff/upsert', newUser);
      setNewUser({ email: '', password: '', role: 'ADMIN_STAFF' });
      fetchUsers();
      alert("Acesso ativado com sucesso para " + newUser.email);
    } catch (error: any) {
      alert("Erro ao criar utilizador: " + (error.response?.data?.error || error.message));
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Usar a mesma rota robusta de Upsert
      await api.post('/staff/upsert', {
        ...editingUser,
        serviceIds: editingUser.services // Mapear para o formato que o backend espera
      });
      setEditingUser(null);
      fetchUsers();
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
    <div className="space-y-8 p-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Gestão de Equipa & VIPs</h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Sala de Recrutamento e Controlo da Mariana</p>
        </div>
        <button onClick={exportClientsCSV} className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
          <Download size={14} /> Exportar Clientes (CSV)
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Criar */}
        <div className="bg-[#121212] p-8 rounded-[2rem] border border-white/5 shadow-2xl space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><UserPlus className="text-braz-gold" /> Novo Membro</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-braz-gold/50" required />
            <input type="password" placeholder="Password Temporária" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-braz-gold/50" required />
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-braz-gold/50 uppercase text-[10px] font-bold">
              <option value="ADMIN_STAFF">Staff (Tatuadora/Estética)</option>
              <option value="ACCOUNTANT">Contabilista</option>
              <option value="SUPER_ADMIN">Diretora (Full Access)</option>
            </select>
            <button type="submit" disabled={isCreating} className="w-full bg-braz-gold text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-braz-gold/20">
              {isCreating ? <Loader2 className="animate-spin mx-auto" /> : 'ATIVAR ACESSO'}
            </button>
          </form>
        </div>

        {/* Lista Users */}
        <div className="lg:col-span-2 bg-[#121212] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Equipa Ativa</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">
                  <th className="p-6">Utilizador</th>
                  <th className="p-6">Nível</th>
                  <th className="p-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        {u.photoUrl ? (
                          <img src={u.photoUrl} alt={u.displayName} className="w-10 h-10 rounded-full object-cover border border-braz-gold/20" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-braz-gold/10 flex items-center justify-center text-braz-gold font-black uppercase text-xs border border-braz-gold/20">
                            {(u.displayName || u.email).charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-white">{u.displayName || u.email.split('@')[0]}</p>
                          <p className="text-[10px] text-white/30 truncate max-w-[150px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'SUPER_ADMIN' ? 'bg-braz-gold text-black' : 'bg-white/5 text-white/50'}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingUser({ ...u, services: u.providedServices?.map((s: any) => s.id) || [] })} className="p-2 text-white/40 hover:text-braz-gold transition-colors font-black text-[10px] uppercase tracking-widest">Editar</button>
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className={`p-2 transition-colors ${u.email === 'mariana@studiobraz.com' ? 'text-white/5 cursor-not-allowed' : 'text-white/20 hover:text-red-500'}`}
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
          </div>
        </div>
      </div>
      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#121212] w-full max-w-2xl rounded-[3rem] border border-white/10 p-10 shadow-2xl space-y-8 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl font-black uppercase tracking-tighter">Editar Profissional</h3>
            
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Nome Profissional (Artístico)</label>
                  <input type="text" value={editingUser.displayName || ''} onChange={e => setEditingUser({...editingUser, displayName: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white" placeholder="Ex: Lara Santos" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">URL Foto de Perfil</label>
                  <input type="text" value={editingUser.photoUrl || ''} onChange={e => setEditingUser({...editingUser, photoUrl: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white" placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Nome Legal (Faturação)</label>
                  <input type="text" value={editingUser.legalName || ''} onChange={e => setEditingUser({...editingUser, legalName: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white" placeholder="Nome Completo" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">NIF</label>
                  <input type="text" value={editingUser.nif || ''} onChange={e => setEditingUser({...editingUser, nif: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white" placeholder="000 000 000" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Serviços Atribuídos</label>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-4 bg-black/50 rounded-2xl border border-white/5">
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
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-white/5 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
                <button type="submit" className="flex-[2] bg-braz-gold text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Guardar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
