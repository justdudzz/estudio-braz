import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Hash, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '../common/Toast';
import api from '../../src/services/api';
import ClientProfileModal from './ClientProfileModal';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tier: string;
  points: number;
  createdAt?: string;
  _count?: { bookings: number };
}

type SortKey = 'points' | 'name' | 'bookings' | 'createdAt';
type SortDir = 'asc' | 'desc';

const SYSTEM_EMAILS = ['system@studiobraz.internal'];

const AdminClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const { showToast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/clients');
      setClients(res.data || []);
    } catch {
      showToast('Erro ao carregar clientes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  // Filtrar: excluir SISTEMA ADMIN e aplicar pesquisa
  const filtered = clients
    .filter(c => !SYSTEM_EMAILS.includes(c.email || ''))
    .filter(c => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
      );
    });

  // Ordenação
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortKey) {
      case 'points': return (a.points - b.points) * dir;
      case 'name': return (a.name || '').localeCompare(b.name || '') * dir;
      case 'bookings': return ((a._count?.bookings || 0) - (b._count?.bookings || 0)) * dir;
      case 'createdAt': return ((a.createdAt || '').localeCompare(b.createdAt || '')) * dir;
      default: return 0;
    }
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return <ChevronUp size={10} className="text-white/10" />;
    return sortDir === 'desc' ? <ChevronDown size={10} className="text-[#C5A059]" /> : <ChevronUp size={10} className="text-[#C5A059]" />;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Users className="text-[#C5A059]" size={24} /> Clientes
          </h1>
          <p className="text-white/30 text-xs mt-1">
            {filtered.length} cliente{filtered.length !== 1 ? 's' : ''} registado{filtered.length !== 1 ? 's' : ''}
            {' • '}Ordenados por {sortKey === 'points' ? 'marcações confirmadas' : sortKey === 'name' ? 'nome' : sortKey === 'bookings' ? 'total visitas' : 'data de registo'}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou telemóvel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-[#C5A059]/50 transition-all placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: 'points' as SortKey, label: 'Confirmações' },
          { key: 'name' as SortKey, label: 'Nome' },
          { key: 'bookings' as SortKey, label: 'Total Visitas' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => handleSort(opt.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${sortKey === opt.key
                ? 'border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059]'
                : 'border-white/5 text-white/30 hover:text-white/60'
              }`}
          >
            {opt.label} <SortIcon field={opt.key} />
          </button>
        ))}
      </div>

      {/* Client Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#C5A059]" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-[#121212] rounded-2xl border border-white/5 p-16 text-center">
          <Users className="mx-auto text-white/10 mb-3" size={40} />
          <p className="text-white/30 text-sm">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-white/20 border-b border-white/5">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-3">Cliente</div>
            <div className="col-span-3">Contacto</div>
            <div className="col-span-2 text-center">Confirmações</div>
            <div className="col-span-2 text-center">Total Visitas</div>
            <div className="col-span-1 text-center">Registo</div>
          </div>

          {/* Rows */}
          {sorted.map((client, idx) => (
            <div
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-all ${idx < 3 ? 'bg-[#C5A059]/[0.02]' : ''
                }`}
            >
              {/* Rank */}
              <div className="hidden md:flex col-span-1 items-center justify-center">
                <span className={`text-sm font-black ${idx < 3 ? 'text-lg' : 'text-white/15'}`}>
                  {getRankBadge(idx)}
                </span>
              </div>

              {/* Name + Avatar */}
              <div className="col-span-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black uppercase ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                      idx === 2 ? 'bg-amber-700/20 text-amber-500' :
                        'bg-[#C5A059]/10 text-[#C5A059]'
                  }`}>
                  {client.name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{client.name}</p>
                  <p className="md:hidden text-[10px] text-white/30 truncate">
                    {client.email || client.phone || 'Sem contacto'}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="hidden md:flex col-span-3 flex-col justify-center gap-1">
                {client.email && (
                  <span className="text-[10px] text-white/40 flex items-center gap-1.5 truncate">
                    <Mail size={10} className="shrink-0" /> {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="text-[10px] text-white/40 flex items-center gap-1.5">
                    <Phone size={10} className="shrink-0" /> {client.phone}
                  </span>
                )}
                {!client.email && !client.phone && (
                  <span className="text-[10px] text-white/15 italic">Sem contacto</span>
                )}
              </div>

              {/* Points (confirmed bookings) */}
              <div className="hidden md:flex col-span-2 items-center justify-center">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-[#C5A059]">{client.points}</span>
                  <span className="text-[8px] text-white/20 uppercase">pts</span>
                </div>
              </div>

              {/* Total bookings */}
              <div className="hidden md:flex col-span-2 items-center justify-center">
                <span className="text-sm font-semibold text-white/50">{client._count?.bookings || 0}</span>
              </div>

              {/* Created */}
              <div className="hidden md:flex col-span-1 items-center justify-center">
                {client.createdAt && (
                  <span className="text-[9px] text-white/20">
                    {new Date(client.createdAt).toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' })}
                  </span>
                )}
              </div>

              {/* Mobile stats */}
              <div className="md:hidden flex items-center gap-4 mt-1">
                <span className="text-xs font-black text-[#C5A059]">{client.points} pts</span>
                <span className="text-[10px] text-white/30">{client._count?.bookings || 0} visitas</span>
                <span className="text-lg">{getRankBadge(idx)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Client Profile Modal */}
      <AnimatePresence>
        {selectedClientId && (
          <ClientProfileModal
            clientId={selectedClientId}
            onClose={() => setSelectedClientId(null)}
            onUpdated={fetchClients}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminClientList;