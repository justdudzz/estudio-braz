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

  // Validação do Formulário
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
      <div key={`h-${idx}`} className="text-center text-[10px] font-bold font-montserrat text-white/30 uppercase py-2">{day}</div>
    ));

    for (let i = 0; i < startingEmptyCells; i++) days.push(<div key={`empty-${i}`} className="p-2"></div>);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDisabled = isDateDisabled(year, month, d);
      const isSelected = formData.date === dateStr;

      days.push(
        <motion.button
          whileTap={{ scale: 0.95 }}
          key={d} type="button" disabled={isDisabled}
          onClick={() => setFormData(prev => ({ ...prev, date: dateStr, time: '' }))}
          className={`h-10 w-full flex items-center justify-center rounded-xl text-sm font-montserrat transition-all duration-300 ${isDisabled ? 'opacity-10 cursor-not-allowed' : isSelected ? 'bg-gradient-to-br from-braz-gold to-[#e3c178] text-black font-black shadow-[0_0_20px_rgba(197,160,89,0.4)] scale-[1.05]' : 'text-white/60 hover:bg-white/5 border border-white/5 hover:border-braz-gold/30 hover:text-white'}`}
        >
          {d}
        </motion.button>
      );
    }
    return days;
  };

  if (status === 'success') {
    return (
      <section className="py-32 bg-gradient-to-b from-braz-black to-[#050505] flex items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#121212]/90 backdrop-blur-xl p-12 md:p-16 rounded-[2rem] border border-white/10 text-center max-w-lg shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-braz-gold to-transparent opacity-50" />
          <CheckCircle2 className="w-20 h-20 text-braz-gold mx-auto mb-8 drop-shadow-[0_0_15px_rgba(197,160,89,0.5)]" strokeWidth={1.5} />
          <h2 className="text-3xl font-montserrat font-black text-white mb-4 uppercase tracking-tighter">Reserva Confirmada</h2>
          <p className="text-white/50 mb-10 text-sm leading-relaxed font-medium">A sua marcação no Studio Braz foi registada com sucesso.<br />A nossa equipa entrará em contacto muito brevemente.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-gradient-to-r from-braz-gold to-[#e3c178] text-black px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
            Novo Agendamento
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="agendamento" className="py-32 bg-gradient-to-b from-[#080808] to-braz-black relative flex items-center justify-center p-4 min-h-screen">
      {/* Decoração de Fundo */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-braz-gold/5 blur-[150px] pointer-events-none z-0"></div>

      <div className="container mx-auto max-w-[1200px] relative z-10">

        {/* Cabeçalho Luxuoso do Agendamento */}
        <div className="text-center mb-20 pt-10">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-braz-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            Concierge
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-montserrat font-black text-white uppercase tracking-tighter mb-8 relative z-20">
            Reserva <span className="text-transparent bg-clip-text bg-gradient-to-r from-braz-gold to-[#e3c178] drop-shadow-sm">Exclusiva</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/50 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed relative z-20">
            Garanta o seu momento de cuidado no Studio Braz. Preencha os detalhes abaixo para aceder à nossa agenda oficial e confirmar o seu horário.
          </motion.p>
        </div>

        <div className="bg-[#101010]/80 backdrop-blur-2xl p-8 lg:p-14 rounded-[2.5rem] border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden group">

          {/* Brilho hover subconsciente */}
          <div className="absolute inset-0 bg-gradient-to-br from-braz-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10">

            <div className="space-y-12">
              {/* Passo 1 - Progresso */}
              <div className="flex gap-2 mb-10 hidden">
                <div className="h-1 flex-1 bg-braz-gold rounded-full shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>
                <div className="h-1 w-8 bg-white/10 rounded-full"></div>
                <div className="h-1 w-8 bg-white/10 rounded-full"></div>
              </div>

              {/* Passo 1 */}
              <div>
                <div className="flex items-center space-x-5 border-b border-white/5 pb-6 mb-10">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-braz-gold/20 to-transparent flex items-center justify-center text-braz-gold font-black text-sm border border-braz-gold/30 shadow-[0_0_15px_rgba(197,160,89,0.1)]">1</div>
                  <h3 className="text-2xl font-montserrat font-black text-white uppercase tracking-tighter">Sua Identidade</h3>
                </div>

                <div className="space-y-8">
                  <div className="relative group/input">
                    <label className="text-[10px] font-black font-montserrat text-white/50 uppercase tracking-[0.2em] mb-4 block group-focus-within/input:text-braz-gold transition-colors">Nome Completo *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-5 bg-[#0A0A0A] rounded-2xl text-white outline-none border border-white/5 focus:border-braz-gold focus:shadow-[0_0_20px_rgba(197,160,89,0.15)] transition-all text-[16px] placeholder:text-white/20 font-medium" placeholder="Como prefere ser chamada?" />
                    {errors.name && <p className="text-red-500 text-xs mt-2 font-medium">{errors.name}</p>}
                  </div>

                  <div className="relative group/input">
                    <label className="text-[10px] font-black font-montserrat text-white/50 uppercase tracking-[0.2em] mb-4 block group-focus-within/input:text-braz-gold transition-colors">
                      E-mail {formData.phone.length > 8 ? '(Opcional)' : '*'}
                    </label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-5 bg-[#0A0A0A] rounded-2xl text-white outline-none border border-white/5 focus:border-braz-gold focus:shadow-[0_0_20px_rgba(197,160,89,0.15)] transition-all text-[16px] placeholder:text-white/20 font-medium" placeholder="geral@exemplo.pt" />
                    {errors.email && <p className="text-red-500 text-xs mt-2 font-medium">{errors.email}</p>}
                  </div>

                  <div className="relative group/input">
                    <label className="text-[10px] font-black font-montserrat text-white/50 uppercase tracking-[0.2em] mb-4 block group-focus-within/input:text-braz-gold transition-colors">
                      Telemóvel {formData.email.includes('@') ? '(Opcional)' : '*'}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full p-5 bg-[#0A0A0A] rounded-2xl text-white outline-none border border-white/5 focus:border-braz-gold focus:shadow-[0_0_20px_rgba(197,160,89,0.15)] transition-all text-[16px] placeholder:text-white/20 font-medium"
                      placeholder="+351 900 000 000"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-2 font-medium">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="hidden lg:block pt-12">
                <button type="submit" disabled={status === 'submitting'} className="w-full bg-gradient-to-r from-braz-gold to-[#e3c178] text-black py-6 rounded-2xl font-black font-montserrat uppercase tracking-[0.2em] text-[11px] hover:shadow-[0_0_40px_rgba(197,160,89,0.4)] active:scale-95 transition-all duration-300 flex items-center justify-center">
                  {status === 'submitting' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Solicitar Horário'}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#0A0A0A] to-[#050505] p-8 lg:p-12 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col h-full min-h-[600px] relative">
              {/* Subtle top glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Passo 2 */}
              <div className="mb-10 border-b border-white/5 pb-10">
                <div className="flex items-center space-x-5 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-braz-gold/20 to-transparent flex items-center justify-center text-braz-gold font-black text-sm border border-braz-gold/30 shadow-[0_0_15px_rgba(197,160,89,0.1)]">2</div>
                  <h3 className="text-2xl font-montserrat font-black text-white uppercase tracking-tighter">A Experiência</h3>
                </div>

                <div className="relative group/select">
                  <select name="service" value={formData.service} onChange={handleChange} className={`w-full p-5 bg-[#121212] rounded-2xl text-white border outline-none cursor-pointer transition-all text-[16px] font-medium appearance-none group-hover/select:border-braz-gold/50 ${errors.service ? 'border-red-500/50' : 'border-white/10 focus:border-braz-gold focus:shadow-[0_0_20px_rgba(197,160,89,0.15)]'}`}>
                    <option value="" className="text-white/20">Selecione o Tratamento Desejado...</option>
                    {Object.entries(SERVICES_CONFIG).map(([key, s]: any) => (
                      <option key={key} value={key} className="bg-[#121212] py-2">{s.label}</option>
                    ))}
                  </select>
                  <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 rotate-90 pointer-events-none group-hover/select:text-braz-gold transition-colors" />
                </div>
                {errors.service && <p className="text-red-500 text-xs mt-2 font-medium">{errors.service}</p>}
              </div>

              {/* Passo 3 */}
              <AnimatePresence mode="wait">
                {formData.service ? (
                  <motion.div key="calendar-active" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-8 flex-grow">

                    <div className="flex items-center space-x-5 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-braz-gold/20 to-transparent flex items-center justify-center text-braz-gold font-black text-sm border border-braz-gold/30 shadow-[0_0_15px_rgba(197,160,89,0.1)]">3</div>
                      <h3 className="text-2xl font-montserrat font-black text-white uppercase tracking-tighter">O Horário</h3>
                    </div>

                    <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 shadow-xl">
                      <div className="flex justify-between items-center mb-8">
                        <button type="button" onClick={() => changeMonth(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/60 hover:text-braz-gold hover:border-braz-gold/30 hover:bg-braz-gold/5 transition-all outline-none"><ChevronLeft size={16} strokeWidth={1.5} /></button>
                        <span className="text-white text-[11px] font-black font-montserrat tracking-[0.2em] uppercase">{currentMonth.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}</span>
                        <button type="button" onClick={() => changeMonth(1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/60 hover:text-braz-gold hover:border-braz-gold/30 hover:bg-braz-gold/5 transition-all outline-none"><ChevronRight size={16} strokeWidth={1.5} /></button>
                      </div>
                      <div className="grid grid-cols-7 gap-y-3 gap-x-1">
                        {renderCalendar()}
                      </div>
                      {errors.date && <p className="text-red-500 text-center text-xs mt-4 font-medium">{errors.date}</p>}
                    </div>

                    <div className="min-h-[150px]">
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center pt-10"><Loader2 className="animate-spin w-8 h-8 text-braz-gold" /></div>
                      ) : formData.date ? (
                        availableSlots.length > 0 ? (
                          <>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3">
                              {availableSlots.map((t) => (
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  key={t}
                                  type="button"
                                  onClick={() => setFormData(p => ({ ...p, time: t }))}
                                  className={`py-4 rounded-xl text-[12px] font-black font-montserrat transition-all border ${formData.time === t ? 'bg-gradient-to-br from-braz-gold to-[#e3c178] text-black border-braz-gold shadow-[0_0_20px_rgba(197,160,89,0.4)] scale-[1.05]' : 'bg-[#121212] text-white/60 border-white/5 hover:border-braz-gold/40 hover:text-white'}`}
                                >
                                  {t}
                                </motion.button>
                              ))}
                            </div>
                            {errors.time && <p className="text-red-500 text-center text-xs mt-4 font-medium">{errors.time}</p>}
                          </>
                        ) : (
                          <div className="text-center py-12 border border-white/5 rounded-3xl bg-[#121212]">
                            <p className="text-braz-gold text-[10px] font-black uppercase tracking-[0.2em]">Agenda Esgotada</p>
                            <p className="text-white/40 text-xs mt-3 font-medium">Os nossos especialistas não têm vagas neste dia.<br />Tente selecionar outra data.</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-16 opacity-40 flex flex-col items-center border border-dashed border-white/10 rounded-3xl bg-[#121212]/30">
                          <p className="text-[10px] uppercase font-black tracking-[0.3em] mb-3 text-braz-gold">Horários em Tempo Real</p>
                          <p className="text-sm font-medium">Selecione o dia no calendário acima</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="calendar-locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-grow flex flex-col items-center justify-center text-white/30 text-center p-12 border border-dashed border-white/10 rounded-3xl bg-[#121212]/30">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-braz-gold/20 blur-2xl rounded-full" />
                      <CalendarIcon size={50} className="relative z-10 opacity-30 text-braz-gold" strokeWidth={1.5} />
                      <Sparkles size={20} className="absolute -top-2 -right-2 text-braz-gold animate-pulse z-20" />
                    </div>
                    <p className="text-[11px] font-black font-montserrat uppercase tracking-[0.2em] leading-loose text-white/50">
                      Selecione uma experiência<br />para revelar os horários exclusivos
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="lg:hidden mt-8">
                <button type="submit" disabled={status === 'submitting'} className="w-full bg-gradient-to-r from-braz-gold to-[#e3c178] text-black py-6 rounded-2xl font-black font-montserrat uppercase tracking-[0.2em] text-[11px] shadow-[0_0_30px_rgba(197,160,89,0.3)] active:scale-95 transition-all flex justify-center items-center">
                  {status === 'submitting' ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Confirmar Reserva'}
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
