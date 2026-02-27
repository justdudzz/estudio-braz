import React, { useState, useEffect } from 'react';
import { User, Calendar as CalendarIcon, Loader2, CheckCircle2, ChevronRight, ChevronLeft, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { BUSINESS_INFO, SERVICES_CONFIG, OPENING_HOURS } from '../../utils/constants';
import { validateEmail } from '../../utils/security';
import { createNewBooking } from '../../src/services/bookingService'; // Importação Soberana
import api from '../../src/services/api'; // Para verificar disponibilidade

const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', date: '', time: '' });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today || date.getDay() === 0;
  };

  // --- BUSCA DE DISPONIBILIDADE NA SUA API PRIVADA ---
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.date || !formData.service) return;
      setIsLoadingSlots(true);
      setAvailableSlots([]);

      try {
        // Agora consulta a sua própria base de dados de agendamentos
        const response = await api.get(`/bookings/check?date=${formData.date}`);
        const busyBookings = response.data; // Lista de horários já ocupados
        
        setAvailableSlots(calculateFreeSlots(formData.date, formData.service, busyBookings));
      } catch (error) {
        // Em caso de erro (ex: DB ainda a ligar), mostra slots padrão para não quebrar o UX
        setAvailableSlots(calculateFreeSlots(formData.date, formData.service, []));
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchAvailability();
  }, [formData.date, formData.service]);

  const calculateFreeSlots = (dateStr: string, serviceKey: string, busyTimes: string[]) => {
    const service = SERVICES_CONFIG[serviceKey as keyof typeof SERVICES_CONFIG] ?? { duration: 60, buffer: 10 };
    const totalDuration = service.duration + (service.buffer || 10);
    
    // Lógica de horários baseada nas suas OPENING_HOURS
    const stableDate = new Date(`${dateStr}T12:00:00Z`);
    const weekDay = stableDate.getDay(); 
    if (weekDay === 0) return []; // Domingo fechado

    const isWeekend = weekDay === 6; // Sábado
    const startHour = isWeekend ? OPENING_HOURS.weekendStart : OPENING_HOURS.start;
    const endHour = isWeekend ? OPENING_HOURS.weekendEnd : OPENING_HOURS.end;
    const slots: string[] = [];

    for (let time = startHour * 60; time + totalDuration <= endHour * 60; time += 30) {
      const h = Math.floor(time / 60).toString().padStart(2, '0');
      const m = (time % 60).toString().padStart(2, '0');
      const timeStr = `${h}:${m}`;

      // Verifica se o horário já existe na sua base de dados soberana
      if (!busyTimes.includes(timeStr)) {
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.trim().length < 3) newErrors.name = "Nome obrigatório.";
    if (!validateEmail(formData.email)) newErrors.email = "Email inválido.";
    if (formData.phone.length !== 9) newErrors.phone = "Telemóvel inválido (9 dígitos).";
    if (!formData.service) newErrors.service = "Selecione um serviço.";
    if (!formData.date) newErrors.date = "Selecione uma data.";
    if (!formData.time) newErrors.time = "Selecione um horário.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- SUBMISSÃO PARA O CÉREBRO AUTÓNOMO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStatus('submitting');

    try {
      // Chama o seu serviço privado
      await createNewBooking(formData);
      setStatus('success');
    } catch (error: any) {
      console.error("Erro no agendamento soberano:", error);
      alert(error || "Erro ao processar o agendamento. Verifique se o Cérebro está ativo.");
      setStatus('idle');
    }
  };

  // ... (Resto do componente - Calendário e Renderização - mantidos para garantir o design de luxo) ...

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => {
    const now = new Date();
    const target = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (target.getMonth() >= now.getMonth() || target.getFullYear() > now.getFullYear()) setCurrentMonth(target);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startingEmptyCells = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    weekDays.forEach((day, idx) => days.push(<div key={`h-${idx}`} className="text-center text-[11px] font-bold text-white/30 uppercase py-2">{day}</div>));
    for (let i = 0; i < startingEmptyCells; i++) days.push(<div key={`empty-${i}`} className="p-2"></div>);

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDisabled = isDateDisabled(currentDate);
      const isSelected = formData.date === dateStr;

      days.push(
        <button
          key={d} type="button" disabled={isDisabled}
          onClick={() => setFormData(prev => ({ ...prev, date: dateStr, time: '' }))}
          className={`h-10 w-full flex items-center justify-center rounded-lg text-sm transition-all duration-300 ${isDisabled ? 'opacity-20 cursor-not-allowed text-white/40'
            : isSelected ? 'bg-white text-braz-black font-bold shadow-md scale-[1.05]'
              : 'text-white/80 hover:bg-white/10 border border-transparent'
            }`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  if (status === 'success') {
    return (
      <section className="py-32 bg-[#0A0A0A] flex items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#121212] p-12 rounded-[2rem] border border-white/10 text-center max-w-lg shadow-2xl">
          <CheckCircle2 className="w-20 h-20 text-braz-pink mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">Reserva Confirmada</h2>
          <p className="text-white/60 mb-8">Soberania Digital ativada. O seu agendamento foi registado com sucesso no servidor do Studio Braz.</p>
          <button onClick={() => { setStatus('idle'); setFormData({ name: '', email: '', phone: '', service: '', date: '', time: '' }); setErrors({}); }} className="text-white border border-white/20 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">Novo Agendamento</button>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="agendamento" className="py-24 bg-[#0A0A0A] min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 md:px-8 max-w-[1200px]">
        <div className="bg-[#121212] p-8 md:p-14 rounded-3xl border border-white/5 shadow-2xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* COLUNA ESQUERDA: Dados Pessoais */}
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-10 border-b border-white/5 pb-4">
                  <User className="text-braz-pink w-6 h-6" />
                  <h3 className="text-2xl font-bold text-white tracking-tight">Seus Dados</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Nome Completo</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full p-4 bg-white/5 rounded-xl text-white outline-none border transition-all ${errors.name ? 'border-red-500/50' : 'border-white/5 focus:border-braz-pink'}`} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full p-4 bg-white/5 rounded-xl text-white outline-none border transition-all ${errors.email ? 'border-red-500/50' : 'border-white/5 focus:border-braz-pink'}`} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Telemóvel</label>
                    <input
                      type="tel"
                      name="phone"
                      maxLength={9}
                      value={formData.phone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, phone: val.slice(0, 9) }));
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      className={`w-full p-4 bg-white/5 rounded-xl text-white outline-none border transition-all ${errors.phone ? 'border-red-500/50' : 'border-white/5 focus:border-braz-pink'}`}
                      placeholder="912345678"
                    />
                  </div>
                </div>
              </div>

              <div className="hidden lg:block mt-8">
                <button type="submit" disabled={status === 'submitting'} className="w-full bg-braz-pink text-black py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                  {status === 'submitting' ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Agendamento'}
                </button>
              </div>
            </div>

            {/* COLUNA DIREITA: Data & Hora */}
            <div className="bg-[#1A1A1A] p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col">
              <div className="flex items-center space-x-3 mb-6">
                <CalendarIcon className="text-braz-pink w-5 h-5" />
                <h3 className="text-xl font-bold text-white">Dia & Hora</h3>
              </div>

              <div className="mb-6">
                <select name="service" value={formData.service} onChange={handleChange} className={`w-full p-4 bg-[#121212] rounded-xl text-white outline-none border appearance-none transition-all ${errors.service ? 'border-red-500/50' : 'border-white/5 focus:border-braz-pink'}`}>
                  <option value="" className="text-black">Selecionar Serviço...</option>
                  {Object.entries(SERVICES_CONFIG).map(([key, s]: any) => (
                    <option key={key} value={key} className="text-black">{s.label} ({s.duration} min)</option>
                  ))}
                </select>
              </div>

              <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <button type="button" onClick={prevMonth} className="p-2 text-white/50 hover:text-white rounded-lg bg-white/5"><ChevronLeft size={16} /></button>
                  <span className="text-white font-medium capitalize text-sm">{currentMonth.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}</span>
                  <button type="button" onClick={nextMonth} className="p-2 text-white/50 hover:text-white rounded-lg bg-white/5"><ChevronRight size={16} /></button>
                </div>

                <div className="flex items-center justify-center gap-2 mb-4 bg-white/5 py-1.5 rounded-full w-max mx-auto px-4">
                  <Globe size={12} className="text-braz-pink" />
                  <span className="text-[10px] text-white/60 font-medium">Europe/Lisbon</span>
                </div>

                <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                  {renderCalendar()}
                </div>
              </div>

              <div className="flex-grow">
                {isLoadingSlots ? (
                  <div className="flex justify-center items-center py-10"><Loader2 className="w-6 h-6 text-braz-pink animate-spin" /></div>
                ) : !formData.date ? (
                  <div className="text-center py-10 text-white/30 text-xs">Selecione um dia acima</div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-10 text-white/30 text-xs">Sem horários disponíveis</div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-white/70 mb-4">{formData.date.split('-').reverse().join('/')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableSlots.map(t => (
                        <button type="button" key={t} onClick={() => { setFormData(prev => ({ ...prev, time: t })); setErrors(prev => ({ ...prev, time: '' })); }}
                          className={`py-3 rounded-lg text-sm font-medium transition-all ${formData.time === t ? 'bg-braz-pink text-black font-bold border-transparent' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {errors.time && <p className="text-red-400 text-xs mt-2 text-center">{errors.time}</p>}
              </div>
            </div>

            <div className="lg:hidden mt-4">
              <button type="submit" disabled={status === 'submitting'} className="w-full bg-braz-pink text-black py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                {status === 'submitting' ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Agendamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;