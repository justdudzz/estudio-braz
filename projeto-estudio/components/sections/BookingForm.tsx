import React, { useState, useEffect, useCallback } from 'react';
import { User, Calendar as CalendarIcon, Loader2, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BUSINESS_INFO, SERVICES_CONFIG, OPENING_HOURS } from '../../utils/constants';
import { validateEmail } from '../../utils/security';
import { createNewBooking } from '../../src/services/bookingService'; 
import api from '../../src/services/api';

const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', date: '', time: '' });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calculateFreeSlots = useCallback((dateStr: string, serviceKey: string, busyTimes: string[]) => {
    const service = SERVICES_CONFIG[serviceKey as keyof typeof SERVICES_CONFIG] ?? { duration: 60, buffer: 10 };
    const totalDuration = service.duration + (service.buffer || 10);
    const stableDate = new Date(`${dateStr}T12:00:00Z`);
    const weekDay = stableDate.getDay(); 
    
    if (weekDay === 0) return []; 

    const isWeekend = weekDay === 6;
    const startHour = isWeekend ? OPENING_HOURS.weekendStart : OPENING_HOURS.start;
    const endHour = isWeekend ? OPENING_HOURS.weekendEnd : OPENING_HOURS.end;
    const slots: string[] = [];

    for (let time = startHour * 60; time + totalDuration <= endHour * 60; time += 30) {
      const h = Math.floor(time / 60).toString().padStart(2, '0');
      const m = (time % 60).toString().padStart(2, '0');
      const timeStr = `${h}:${m}`;

      if (!busyTimes.includes(timeStr)) {
        slots.push(timeStr);
      }
    }
    return slots;
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.date || !formData.service) return;
      setIsLoadingSlots(true);
      try {
        const response = await api.get(`/bookings/check?date=${formData.date}`);
        const busyBookings = response.data;
        const free = calculateFreeSlots(formData.date, formData.service, busyBookings);
        setAvailableSlots(free);
      } catch (error) {
        setAvailableSlots(calculateFreeSlots(formData.date, formData.service, []));
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchAvailability();
  }, [formData.date, formData.service, calculateFreeSlots]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.trim().length < 3) newErrors.name = "Nome muito curto.";
    if (!validateEmail(formData.email)) newErrors.email = "Email inválido.";
    if (formData.phone.length !== 9) newErrors.phone = "9 dígitos necessários.";
    if (!formData.service) newErrors.service = "Selecione um serviço.";
    if (!formData.date) newErrors.date = "Escolha uma data.";
    if (!formData.time) newErrors.time = "Escolha um horário.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStatus('submitting');
    try {
      await createNewBooking(formData);
      setStatus('success');
    } catch (error: any) {
      alert(error || "Erro ao processar.");
      setStatus('idle');
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startingEmptyCells = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    weekDays.forEach((day, idx) => days.push(
      <div key={`h-${idx}`} className="text-center text-[10px] font-luxury text-white/20 uppercase py-2">{day}</div>
    ));
    
    for (let i = 0; i < startingEmptyCells; i++) days.push(<div key={`empty-${i}`} className="p-2"></div>);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDisabled = new Date(year, month, d) <= new Date() || new Date(year, month, d).getDay() === 0;
      const isSelected = formData.date === dateStr;

      days.push(
        <button
          key={d} type="button" disabled={isDisabled}
          onClick={() => setFormData(prev => ({ ...prev, date: dateStr, time: '' }))}
          className={`h-10 w-full flex items-center justify-center rounded-golden text-sm transition-all duration-300 ${isDisabled ? 'opacity-10 cursor-not-allowed' : isSelected ? 'bg-braz-gold text-black font-luxury shadow-lg scale-105' : 'text-white/60 hover:bg-white/5 border border-white/5'}`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  if (status === 'success') {
    return (
      <section className="py-32 bg-braz-black flex items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#121212] p-12 rounded-golden-lg border border-white/10 text-center max-w-lg shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-braz-gold mx-auto mb-6" />
          <h2 className="text-2xl font-luxury text-white mb-4 uppercase tracking-widest">Reserva Confirmada</h2>
          <p className="text-white/40 mb-8 text-sm">Aguardamos por si para uma experiência de pura soberania.</p>
          <button onClick={() => window.location.reload()} className="bg-gold-gradient text-black px-8 py-4 rounded-xl font-luxury text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Novo Agendamento</button>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="agendamento" className="py-24 bg-braz-black min-h-screen flex items-center justify-center p-4">
      <div className="container mx-auto max-w-[1100px]">
        <div className="bg-[#121212] p-6 md:p-14 rounded-golden-lg border border-white/5 shadow-2xl relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            
            {/* ESQUERDA: Dados do Cliente */}
            <div className="space-y-8">
              <div className="flex items-center space-x-3 border-b border-white/5 pb-4">
                <User className="text-braz-gold w-5 h-5" />
                <h3 className="text-xl font-luxury text-white uppercase tracking-tighter">Sua Identidade</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-luxury text-white/30 uppercase tracking-[0.2em] mb-2 block">Nome</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-gold/50 transition-all text-sm" placeholder="Nome Completo" />
                </div>
                <div>
                  <label className="text-[10px] font-luxury text-white/30 uppercase tracking-[0.2em] mb-2 block">E-mail</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-gold/50 transition-all text-sm" placeholder="exemplo@email.com" />
                </div>
                <div>
                  <label className="text-[10px] font-luxury text-white/30 uppercase tracking-[0.2em] mb-2 block">Contacto</label>
                  <input type="tel" name="phone" maxLength={9} value={formData.phone} onChange={(e) => setFormData(p => ({...p, phone: e.target.value.replace(/\D/g, '').slice(0,9)}))} className="w-full p-4 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-gold/50 transition-all text-sm" placeholder="912 345 678" />
                </div>
              </div>

              <div className="hidden lg:block pt-4">
                <button type="submit" disabled={status === 'submitting'} className="w-full bg-gold-gradient text-black py-5 rounded-xl font-luxury uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-braz-gold/10">
                  {status === 'submitting' ? <Loader2 className="animate-spin mx-auto" /> : 'Solicitar Horário'}
                </button>
              </div>
            </div>

            {/* DIREITA: Agenda e Serviço (Mobile First) */}
            <div className="bg-[#1A1A1A] p-6 md:p-8 rounded-golden-lg border border-white/5 flex flex-col h-full min-h-[500px]">
              
              {/* PASSO 1: Seleção de Serviço (Obrigatório) */}
              <div className="mb-6">
                <label className="text-[10px] font-luxury text-white/30 uppercase tracking-[0.2em] mb-2 block">1. Selecione a Experiência</label>
                <select name="service" value={formData.service} onChange={handleChange} className={`w-full p-4 bg-[#121212] rounded-xl text-white border outline-none cursor-pointer transition-all text-sm ${errors.service ? 'border-red-500/50' : 'border-white/5 focus:border-braz-gold'}`}>
                  <option value="">Escolher Serviço...</option>
                  {Object.entries(SERVICES_CONFIG).map(([key, s]: any) => (
                    <option key={key} value={key}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* LÓGICA DE DESBLOQUEIO */}
              <AnimatePresence mode="wait">
                {formData.service ? (
                  <motion.div key="calendar-active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    {/* Mini Calendário */}
                    <div className="bg-[#121212] p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()-1)))} className="p-2 text-white/20 hover:text-white transition-colors"><ChevronLeft size={16}/></button>
                        <span className="text-white text-[10px] font-luxury tracking-widest uppercase">{currentMonth.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}</span>
                        <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()+1)))} className="p-2 text-white/20 hover:text-white transition-colors"><ChevronRight size={16}/></button>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                      </div>
                    </div>

                    {/* Slots de Horário - Grelha Responsiva (2 colunas mobile, 3 desktop) */}
                    <div className="min-h-[150px]">
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center pt-10"><Loader2 className="animate-spin text-braz-gold" /></div>
                      ) : formData.date ? (
                        availableSlots.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableSlots.map((t) => (
                              <button key={t} type="button" onClick={() => setFormData(p => ({...p, time: t}))} className={`py-3 rounded-lg text-[11px] font-luxury transition-all border ${formData.time === t ? 'bg-braz-gold text-black border-braz-gold shadow-lg shadow-braz-gold/20' : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 border border-white/5 rounded-2xl bg-white/5">
                            <p className="text-braz-gold text-[10px] font-luxury uppercase">Agenda Esgotada</p>
                            <p className="text-white/20 text-[9px] mt-1">Tente outra data disponível</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-10 opacity-20">
                          <p className="text-[10px] uppercase font-bold tracking-widest italic">2. Escolha o dia no calendário</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="calendar-locked" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="flex-grow flex flex-col items-center justify-center text-white/40 text-center p-8 border border-dashed border-white/10 rounded-2xl">
                    <CalendarIcon size={32} className="mb-4 opacity-20" />
                    <Sparkles size={16} className="mb-2 text-braz-gold animate-pulse" />
                    <p className="text-[10px] uppercase font-luxury tracking-[0.2em] leading-relaxed">
                      Selecione um serviço para<br/>desbloquear a agenda real
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botão de submissão versão Mobile (aparece apenas no fim) */}
              <div className="lg:hidden mt-8">
                <button type="submit" disabled={status === 'submitting'} className="w-full bg-gold-gradient text-black py-5 rounded-xl font-luxury uppercase tracking-widest active:scale-95 transition-all shadow-lg">
                  {status === 'submitting' ? <Loader2 className="animate-spin mx-auto" /> : 'Confirmar Reserva'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;