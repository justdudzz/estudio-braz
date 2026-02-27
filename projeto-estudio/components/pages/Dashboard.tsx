import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, Scissors, LogOut, RefreshCw } from 'lucide-react';
import { getAllBookings } from '../services/bookingService';
import { logoutDirector } from '../services/authService';

const Dashboard: React.FC = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 font-montserrat">
      {/* HEADER DO DIRETOR */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Sala de Comando</h1>
          <p className="text-braz-pink text-xs font-bold uppercase tracking-[0.3em]">Gestão Studio Braz</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchBookings} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={logoutDirector} className="p-3 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20 text-white/20">Carregando Agenda Soberana...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-white/30">
                Nenhum agendamento encontrado na base de dados.
              </div>
            ) : (
              bookings.map((booking: any) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={booking._id}
                  className="bg-[#121212] p-6 rounded-2xl border border-white/5 hover:border-braz-pink/30 transition-all shadow-xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-braz-pink/10 p-3 rounded-xl">
                      <Scissors className="text-braz-pink" size={20} />
                    </div>
                    <span className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest text-white/60">
                      {booking.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-1">{booking.client?.name || "Cliente VIP"}</h3>
                  <p className="text-white/40 text-xs mb-6 uppercase tracking-wider">{booking.service}</p>

                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      <Calendar size={14} className="text-braz-pink" />
                      {booking.date.split('-').reverse().join('/')}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      <Clock size={14} className="text-braz-pink" />
                      {booking.time}h
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      <User size={14} className="text-braz-pink" />
                      {booking.client?.phone}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;