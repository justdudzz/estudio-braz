import React, { useState, useEffect, useCallback } from 'react';
import { User, Calendar as CalendarIcon, Loader2, CheckCircle2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
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
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const isDateDisabled = (year: number, month: number, day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const dateToCompare = new Date(year, month, day);
    dateToCompare.setHours(0, 0, 0, 0); 

    return dateToCompare <= today || dateToCompare.getDay() === 0;
  };

  const calculateFreeSlots = useCallback((dateStr: string, serviceKey: string, busyTimes: string[]) => {
    const service = SERVICES_CONFIG[serviceKey as keyof typeof SERVICES_CONFIG] ?? { duration: 60, buffer: 10 };
    const totalDuration = service.duration + (service.buffer || 0); 
    
    const stableDate = new Date(`${dateStr}T12:00:00Z`);
    const weekDay = stableDate.getDay(); 
    
    if (weekDay === 0) return [];

    const isWeekend = weekDay === 6;
    const startHour = isWeekend ? OPENING_HOURS.weekendStart : OPENING_HOURS.start;
    const endHour = isWeekend ? OPENING_HOURS.weekendEnd : OPENING_HOURS.end;
    const slots: string[] = [];

    for (let time = startHour * 60; time + totalDuration <= endHour * 60; time += 30) {
      let canBook = true;

      for (let checkTime = time; checkTime < time + totalDuration; checkTime += 30) {
        const checkH = Math.floor(checkTime / 60).toString().padStart(2, '0');
        const checkM = (checkTime % 60).toString().padStart(2, '0');
        const checkTimeStr = `${checkH}:${checkM}`;

        if (busyTimes.includes(checkTimeStr)) {
          canBook = false;
          break; 
        }
      }

      if (canBook) {
        const h = Math.floor(time / 60).toString().padStart(2, '0');
        const m = (time % 60).toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
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

  // 🌟 A TUA CORREÇÃO SOBERANA DE UX: Validação Inteligente
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 1. Nome continua a ser a única exigência absoluta inicial
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = "Nome muito curto";
    }

    // 2. A REGRA DE OURO: Se a cliente não forneceu nem email, nem telemóvel
    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.phone = "Introduza pelo menos um contacto (E-mail ou Telemóvel).";
      newErrors.email = "Introduza pelo menos um contacto (E-mail ou Telemóvel).";
    }

    // 3. Validação de Formato (Só é ativada se a cliente tiver escrito algo no campo)
    if (formData.email.trim() && !validateEmail(formData.email)) {
      newErrors.email = "Formato de e-mail inválido.";
    }

    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 9) {
        newErrors.phone = "Telemóvel inválido (mínimo 9 dígitos).";
      }
    }

    // 4. Validação da Agenda
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
    
    const weekDays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

    weekDays.forEach((day, idx) => days.push(
      <div key={`h-${idx}`} className="text-center text-[10px] font-luxury text-white/20 uppercase py-2">{day}</div>
    ));
    
    for (let i = 0; i < startingEmptyCells; i++) days.push(<div key={`empty-${i}`} className="p-2"></div>);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDisabled = isDateDisabled(year, month, d);
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
            
            <div className="space-y-8">
              <div className="flex items-center space-x-3 border-b border-white/5 pb-4">
                <User className="text-braz-gold w-5 h-5" />
                <h3 className="text-xl font-luxury text-white uppercase tracking-tighter">Sua Identidade</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-luxury text-white/30 uppercase tracking-[0.2em] mb-2 block">Nome *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-gold/50 transition-all text-sm" placeholder="Nome Completo" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Indicação visual suave de que são opcionais se o outro for preenchido */}
                <div>
                  <label className="text-[10px] font-luxury text-white/30 uppercase tracking-[0.2em] mb-2 block">
                    E-mail {formData.phone.length > 8 ? '(Opcional)' : '*'}
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-gold/50 transition-all text-sm" placeholder="exemplo@email.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="text-[10px] font-luxury text-white/30 uppercase tracking-[0.2em] mb-2 block">
                    Contacto {formData.email.includes('@') ? '(Opcional)' : '*'}
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData(p => ({...p, phone: e.target.value}))} 
                    className="w-full p-4 bg-white/5 rounded-xl text-white outline-none border border-white/5 focus:border-braz-gold/50 transition-all text-sm" 
                    placeholder="+351 912 345 678" 
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="hidden lg:block pt-4">
                <button type="submit" disabled={status === 'submitting'} className="w-full bg-gold-gradient text-black py-5 rounded-xl font-luxury uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-braz-gold/10">
                  {status === 'submitting' ? <Loader2 className="animate-spin mx-auto" /> : 'Solicitar Horário'}
                </button>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-6 md:p-8 rounded-golden-lg border border-white/5 flex flex-col h-full min-h-[500px]">
              
              <div className="mb-6">
                <label className="text-[10px] font-luxury text-white/30 uppercase tracking-[0.2em] mb-2 block">1. Selecione a Experiência</label>
                <select name="service" value={formData.service} onChange={handleChange} className={`w-full p-4 bg-[#121212] rounded-xl text-white border outline-none cursor-pointer transition-all text-sm ${errors.service ? 'border-red-500/50' : 'border-white/5 focus:border-braz-gold'}`}>
                  <option value="">Escolher Serviço...</option>
                  {Object.entries(SERVICES_CONFIG).map(([key, s]: any) => (
                    <option key={key} value={key}>{s.label}</option>
                  ))}
                </select>
                {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
              </div>

              <AnimatePresence mode="wait">
                {formData.service ? (
                  <motion.div key="calendar-active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="bg-[#121212] p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-2 text-white/20 hover:text-white transition-colors"><ChevronLeft size={16}/></button>
                        <span className="text-white text-[10px] font-luxury tracking-widest uppercase">{currentMonth.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}</span>
                        <button type="button" onClick={() => changeMonth(1)} className="p-2 text-white/20 hover:text-white transition-colors"><ChevronRight size={16}/></button>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                      </div>
                      {errors.date && <p className="text-red-500 text-center text-xs mt-2">{errors.date}</p>}
                    </div>

                    <div className="min-h-[150px]">
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center pt-10"><Loader2 className="animate-spin text-braz-gold" /></div>
                      ) : formData.date ? (
                        availableSlots.length > 0 ? (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {availableSlots.map((t) => (
                                <button key={t} type="button" onClick={() => setFormData(p => ({...p, time: t}))} className={`py-3 rounded-lg text-[11px] font-luxury transition-all border ${formData.time === t ? 'bg-braz-gold text-black border-braz-gold shadow-lg shadow-braz-gold/20' : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'}`}>
                                  {t}
                                </button>
                              ))}
                            </div>
                            {errors.time && <p className="text-red-500 text-center text-xs mt-2">{errors.time}</p>}
                          </>
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