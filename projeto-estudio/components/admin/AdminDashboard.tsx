import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, LogOut, 
  RefreshCw, AlertCircle, Check, X, MessageCircle, Star, Lock, Trophy 
} from 'lucide-react';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../src/services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../src/services/api';

const AdminDashboard: React.FC = () => {
  // --- 1. ESTADOS DA PÁGINA ---
  const [bookings, setBookings] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockData, setBlockData] = useState({ date: '', time: '', reason: '', fullDay: true });
  
  const { logout, user } = useAuth(); 
  const navigate = useNavigate();

  const diretorNome = user?.email ? user.email.split('@')[0] : 'Rafa';

  // --- 2. CARREGAR DADOS ---
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, vipsRes] = await Promise.all([
        getAllBookings(),
        api.get('/bookings/top-clients') 
      ]);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.data || []);
      setTopClients(vipsRes.data || []);
    } catch (err) {
      console.error("Erro na sincronização com a fortaleza", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 3. FUNÇÃO DE TRANCAR A AGENDA ---
  const handleBlockSubmit = async () => {
    if (!blockData.date) {
      alert("Por favor, selecione um dia para bloquear.");
      return;
    }

    try {
      await api.post('/bookings/block', blockData);
      alert(`Agenda trancada para o dia ${blockData.date}!`);
      setIsBlockModalOpen(false);
      setBlockData({ date: '', time: '', reason: '', fullDay: true }); 
      fetchAllData();
    } catch (err) {
      alert("Erro ao trancar a agenda.");
    }
  };

  // --- 4. AÇÕES DE RESERVA ---
  const handleConfirm = async (id: string) => {
    try {
      await updateBookingStatus(id, 'confirmed');
      await fetchAllData(); 
    } catch (err) {
      alert("Erro na confirmação.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Diretor ${diretorNome}, deseja eliminar esta reserva?`)) {
      try {
        await deleteBooking(id);
        await fetchAllData();
      } catch (err) {
        alert("Erro ao eliminar.");
      }
    }
  };

  const openWhatsApp = (client: any, booking: any) => {
    if (!client?.phone) return alert("Cliente sem contacto.");
    const msg = `Olá ${client.name}! ✨ Studio Braz aqui. Confirmamos para ${booking.service} dia ${booking.date} às ${booking.time}?`;
    window.open(`https://wa.me/351${client.phone.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-braz-black text-white p-4 md:p-10 font-montserrat relative">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER ELITE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Sala de Comando</h1>
            <p className="text-braz-pink text-xs font-bold uppercase tracking-[0.4em] mt-2">
              Diretor <span className="text-white capitalize">{diretorNome}</span> • Gestão Soberana
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setIsBlockModalOpen(true)}
              className="flex items-center gap-2 bg-orange-500/10 text-orange-400 px-6 py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all border border-orange-500/20"
            >
              <Lock size={16} /> TRANCAR AGENDA
            </button>

            <button onClick={fetchAllData} className="p-4 bg-white/5 rounded-2xl hover:text-braz-pink border border-white/5 transition-all">
              <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
            </button>
            
            <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-500/10 text-red-500 px-8 py-4 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* GRELHA DE RESERVAS */}
        <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
          <Clock className="text-braz-pink" /> Próximas Marcações
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <AnimatePresence>
            {bookings.map((booking: any) => (
              <motion.div
                key={booking.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`p-8 rounded-[2rem] border transition-all ${booking.status === 'confirmed' ? 'bg-green-500/5 border-green-500/30' : 'bg-[#111] border-white/5 shadow-2xl'}`}
              >
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase ${booking.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/50'}`}>
                    {booking.status}
                  </span>
                  <div className="flex gap-2">
                    {booking.status !== 'confirmed' && (
                      <button onClick={() => handleConfirm(booking.id)} className="p-2 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"><Check size={18}/></button>
                    )}
                    <button onClick={() => handleDelete(booking.id)} className="p-2 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={18}/></button>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-braz-pink font-bold uppercase mb-1">{booking.service}</p>
                  <h3 className="text-2xl font-black text-white mb-3">{booking.client?.name || 'Cliente (Admin)'}</h3>
                  <div className="flex items-center gap-2 text-white/40 text-xs font-bold">
                    <Star size={14} className="text-braz-pink" /> {booking.client?.points || 0} PTS | <span className="text-braz-pink">{booking.client?.tier || 'N/A'}</span>
                  </div>
                </div>

                <button onClick={() => openWhatsApp(booking.client, booking)} className="w-full py-4 bg-green-500/10 text-green-500 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-3 hover:bg-green-500 hover:text-white transition-all border border-green-500/20 mb-6">
                  <MessageCircle size={18} /> WhatsApp
                </button>

                <div className="flex justify-between items-center pt-4 border-t border-white/5 font-black text-xs text-white/60">
                  <span className="flex items-center gap-2"><Calendar size={14} /> {booking.date}</span>
                  <span className="flex items-center gap-2"><Clock size={14} /> {booking.time}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* RANKING VIP */}
        <section className="bg-[#111] border border-white/5 p-8 md:p-10 rounded-[3rem]">
          <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
            <Trophy className="text-braz-pink" /> Ranking de Fidelidade (Top 5)
          </h2>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl hover:bg-braz-pink/5 border border-transparent hover:border-braz-pink/20 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-white/10">#0{index + 1}</span>
                  <span className="font-bold">{client.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-braz-pink font-black">{client.points} PTS</span>
                  <span className="bg-braz-pink/10 text-braz-pink px-3 py-1 rounded-full text-xs font-bold uppercase">{client.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* MODAL DE TRANCAGEM */}
      <AnimatePresence>
        {isBlockModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121212] border border-white/10 p-10 rounded-[2.5rem] max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                <AlertCircle className="text-orange-500" /> Trancar Fortaleza
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase block mb-2 tracking-widest">Dia a Fechar</label>
                  <input type="date" value={blockData.date} className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-orange-500 text-white [color-scheme:dark]" 
                    onChange={(e) => setBlockData({...blockData, date: e.target.value})} />
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl cursor-pointer" onClick={() => setBlockData({...blockData, fullDay: !blockData.fullDay})}>
                  <input type="checkbox" checked={blockData.fullDay} readOnly className="w-5 h-5 accent-orange-500" />
                  <span className="text-sm font-bold uppercase tracking-wider">Fechar Dia Inteiro</span>
                </div>

                {!blockData.fullDay && (
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase block mb-2 tracking-widest">Hora Específica</label>
                    <input type="time" value={blockData.time} className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-orange-500 text-white [color-scheme:dark]"
                      onChange={(e) => setBlockData({...blockData, time: e.target.value})} />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-white/40 uppercase block mb-2 tracking-widest">Motivo do Fecho</label>
                  <textarea value={blockData.reason} className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-orange-500 h-24 text-white"
                    placeholder="Ex: Formação, Férias, Manutenção..."
                    onChange={(e) => setBlockData({...blockData, reason: e.target.value})} />
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsBlockModalOpen(false)} className="flex-1 py-4 text-xs font-bold uppercase text-white/40 hover:text-white transition-colors">Cancelar</button>
                  <button onClick={handleBlockSubmit} className="flex-1 bg-orange-500 text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all">
                    Confirmar Fecho
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;