import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, LogOut, RefreshCw, AlertCircle, 
  Check, X, MessageCircle, Star, Lock, Trophy, ChevronLeft, ChevronRight, Euro, Sparkles 
} from 'lucide-react';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../src/services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../src/services/api';
// 🌟 IMPORTAÇÃO DA NOSSA FONTE DE VERDADE
import { SERVICES_CONFIG } from '../../utils/constants';

const AdminDashboard: React.FC = () => {
  // --- ESTADOS DA PÁGINA ---
  const [bookings, setBookings] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do Calendário e Modais
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDayDetails, setSelectedDayDetails] = useState<string | null>(null);
  
  // Estados do Bloqueio Rápido
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockData, setBlockData] = useState({ date: '', time: '', reason: '', fullDay: true });
  
  const { logout, user } = useAuth(); 
  const navigate = useNavigate();
  const diretorNome = user?.email ? user.email.split('@')[0] : 'Rafa';

  // --- CARREGAR DADOS ---
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
      console.error("Erro na sincronização", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // 🌟 CÁLCULO DE MÉTRICAS SOBERANAS
  const calculateMetrics = () => {
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const pending = bookings.filter(b => b.status === 'pending');
    
    // Soma o preço de cada serviço confirmado lendo o constants.ts
    const totalRevenue = confirmed.reduce((acc, b) => {
      // Procura o serviço na configuração. Se tiver preço, soma; caso contrário, soma 0.
      const servicePrice = SERVICES_CONFIG[b.service]?.price || 0;
      return acc + servicePrice;
    }, 0);

    return {
      revenue: totalRevenue,
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      totalBookings: bookings.filter(b => b.status !== 'blocked').length
    };
  };

  const metrics = calculateMetrics();

  // --- AÇÕES DO DIRETOR ---
  const handleBlockSubmit = async () => {
    if (!blockData.date) return alert("Por favor, selecione um dia para bloquear.");
    try {
      await api.post('/bookings/block', blockData);
      alert("Horário trancado na Fortaleza. Nenhuma cliente poderá entrar.");
      setIsBlockModalOpen(false);
      setBlockData({ date: '', time: '', reason: '', fullDay: true }); 
      fetchAllData();
    } catch (err) { alert("Erro ao trancar na fortaleza."); }
  };

  const handleConfirm = async (id: string) => {
    try {
      await updateBookingStatus(id, 'confirmed');
      await fetchAllData(); 
    } catch (err) { alert("Erro na confirmação."); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Deseja eliminar esta reserva?`)) {
      try {
        await deleteBooking(id);
        await fetchAllData();
      } catch (err) { alert("Erro ao eliminar."); }
    }
  };

  const openWhatsApp = (client: any, booking: any) => {
    if (!client?.phone) return alert("Cliente sem contacto.");
    let cleanNumber = client.phone.replace(/\D/g, '');
    if (cleanNumber.length === 9) cleanNumber = '351' + cleanNumber;
    const msg = `Olá ${client.name}! ✨ Studio Braz aqui. Confirmamos para ${SERVICES_CONFIG[booking.service]?.label || booking.service} dia ${booking.date} às ${booking.time}?`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- LÓGICA DO CALENDÁRIO ---
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const days = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      });
    }
    return days;
  }, [currentDate]);

  const renderMasterCalendar = () => {
    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    return (
      <div className="bg-[#121212] rounded-golden-lg border border-white/5 p-4 md:p-8 shadow-2xl mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-luxury text-braz-gold uppercase tracking-widest text-lg">Agenda Soberana</h3>
            <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:text-braz-gold transition-colors"><ChevronLeft size={18}/></button>
              <span className="px-4 text-[10px] font-luxury uppercase tracking-tighter">
                {currentDate.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:text-braz-gold transition-colors"><ChevronRight size={18}/></button>
            </div>
          </div>
          <button 
            onClick={() => setIsBlockModalOpen(true)}
            className="bg-gold-gradient text-black px-6 py-3 rounded-xl font-luxury text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-braz-gold/10"
          >
            Trancar Horário Manual
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[9px] font-luxury text-white/20 uppercase pb-4">{d}</div>
          ))}
          
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="min-h-[100px] opacity-0" />;
            
            const dayBookings = bookings.filter(b => b.date === day.dateStr);
            const isToday = new Date().toISOString().split('T')[0] === day.dateStr;

            return (
              <div 
                key={day.dateStr} 
                onClick={() => setSelectedDayDetails(day.dateStr)}
                className={`min-h-[120px] bg-white/[0.02] rounded-2xl p-3 border transition-all cursor-pointer hover:bg-white/[0.08] hover:scale-[1.02] ${isToday ? 'border-braz-gold/50 bg-braz-gold/5' : 'border-white/5'}`}
              >
                <span className={`text-[10px] font-luxury ${isToday ? 'text-braz-gold' : 'text-white/20'} uppercase`}>
                  {day.day}
                </span>
                
                <div className="mt-3 space-y-1">
                  {dayBookings.slice(0, 4).map(b => (
                    <div 
                      key={b.id} 
                      className={`p-1.5 rounded-lg text-[8px] font-bold uppercase truncate border ${
                        b.status === 'confirmed' ? 'border-green-500/30 text-green-400 bg-green-500/5' :
                        b.status === 'blocked' ? 'border-orange-500/30 text-orange-400 bg-orange-500/5' :
                        'border-braz-gold/30 text-braz-gold bg-braz-gold/5'
                      }`}
                    >
                      {b.time} {b.client?.name.split(' ')[0] || 'ADMIN'}
                    </div>
                  ))}
                  {dayBookings.length > 4 && (
                    <p className="text-[8px] text-center text-white/20 font-bold">+{dayBookings.length - 4} MAIS</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-braz-black text-white p-4 md:p-10 font-montserrat relative">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Sala de Comando</h1>
            <p className="text-braz-pink text-xs font-bold uppercase tracking-[0.4em] mt-2">
              Diretor <span className="text-white capitalize">{diretorNome}</span> • Gestão Soberana
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchAllData} className="p-4 bg-white/5 rounded-2xl hover:text-braz-pink border border-white/5 transition-all">
              <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-500/10 text-red-500 px-8 py-4 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all">
              Sair da Fortaleza
            </button>
          </div>
        </header>

        {/* 🌟 MÉTRICAS SOBERANAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#171717] p-6 rounded-golden-lg border border-braz-gold/20 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-luxury text-white/40 uppercase">Faturação Estimada</span>
              <Euro className="text-braz-gold w-4 h-4" />
            </div>
            <p className="text-3xl font-luxury text-white">€ {metrics.revenue}</p>
            <p className="text-[9px] text-braz-gold mt-2 uppercase tracking-widest">Baseado em {metrics.confirmedCount} serviços confirmados</p>
          </div>

          <div className="bg-[#171717] p-6 rounded-golden-lg border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-luxury text-white/40 uppercase">Aguardam Decisão</span>
              <Clock className="text-white/20 w-4 h-4" />
            </div>
            <p className="text-3xl font-luxury text-white">{metrics.pendingCount}</p>
            <p className="text-[9px] text-white/20 mt-2 uppercase tracking-widest">Pedidos Pendentes</p>
          </div>

          <div className="bg-[#171717] p-6 rounded-golden-lg border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-luxury text-white/40 uppercase">Total de Experiências</span>
              <Sparkles className="text-white/20 w-4 h-4" />
            </div>
            <p className="text-3xl font-luxury text-white">{metrics.totalBookings}</p>
            <p className="text-[9px] text-white/20 mt-2 uppercase tracking-widest">Desde o início</p>
          </div>
        </div>

        {/* CALENDÁRIO MASTER */}
        {renderMasterCalendar()}

        {/* RANKING VIP */}
        <section className="bg-[#111] border border-white/5 p-8 md:p-10 rounded-[3rem] max-w-2xl mx-auto">
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

      {/* MODAL DE DETALHES DO DIA SELECIONADO */}
      <AnimatePresence>
        {selectedDayDetails && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDayDetails(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121212] border border-white/10 p-8 rounded-[2.5rem] max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <Calendar className="text-braz-gold" /> Agenda: {selectedDayDetails}
                </h2>
                <button onClick={() => setSelectedDayDetails(null)} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {bookings.filter(b => b.date === selectedDayDetails).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">A agenda está livre neste dia.</p>
                  </div>
                ) : (
                  bookings.filter(b => b.date === selectedDayDetails)
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(booking => (
                    <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-white/10 transition-colors">
                      <div>
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : booking.status === 'blocked' ? 'bg-orange-500/20 text-orange-400' : 'bg-braz-gold/20 text-braz-gold'}`}>
                          {booking.status}
                        </span>
                        <h4 className="text-xl font-black mt-3 text-white">
                          {booking.time} <span className="text-braz-pink font-medium text-sm ml-2">| {SERVICES_CONFIG[booking.service]?.label || booking.service}</span>
                        </h4>
                        <p className="text-white/60 text-sm mt-1">{booking.client?.name || 'BLOQUEIO DE DIRETOR'} {booking.client?.phone && `• ${booking.client.phone}`}</p>
                      </div>
                      
                      <div className="flex gap-2 w-full md:w-auto">
                        {booking.status !== 'confirmed' && booking.status !== 'blocked' && (
                          <button onClick={() => handleConfirm(booking.id)} className="flex-1 md:flex-none p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"><Check size={20} className="mx-auto" /></button>
                        )}
                        {booking.client?.phone && (
                          <button onClick={() => openWhatsApp(booking.client, booking)} className="flex-1 md:flex-none p-3 bg-white/5 text-white/60 rounded-xl hover:bg-green-500 hover:text-white transition-all"><MessageCircle size={20} className="mx-auto" /></button>
                        )}
                        <button onClick={() => handleDelete(booking.id)} className="flex-1 md:flex-none p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={20} className="mx-auto" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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