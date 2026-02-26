import React, { useState, useEffect } from 'react';
import { User, Calendar as CalendarIcon, Loader2, CheckCircle2, ChevronRight, ChevronLeft, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { BUSINESS_INFO, SERVICES_CONFIG, OPENING_HOURS } from '../../utils/constants';
import { validateEmail, sanitizeInput } from '../../utils/security';
import { saveBookingIntent } from '../../utils/offlineStorage';
import emailjs from '@emailjs/browser';

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

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.date || !formData.service) return;
      setIsLoadingSlots(true);
      setAvailableSlots([]);

      try {
        const response = await fetch(`/.netlify/functions/schedule?date=${formData.date}`);
        if (!response.ok) throw new Error();
        const busyEvents = await response.json();
        setAvailableSlots(calculateFreeSlots(formData.date, formData.service, Array.isArray(busyEvents) ? busyEvents : []));
      } catch {
        setAvailableSlots(calculateFreeSlots(formData.date, formData.service, []));
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchAvailability();
  }, [formData.date, formData.service]);

  const calculateFreeSlots = (dateStr: string, serviceKey: string, busyEvents: any[]) => {
    const service = SERVICES_CONFIG[serviceKey as keyof typeof SERVICES_CONFIG] ?? { duration: 60, buffer: 10 };
    const totalDuration = service.duration + (service.buffer || 10);
    const lisbonFormatter = new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false });

    const stableDate = new Date(`${dateStr}T12:00:00Z`);
    const weekDay = lisbonFormatter.formatToParts(stableDate).find(p => p.type === 'weekday')?.value?.toLowerCase();
    if (weekDay?.includes('dom')) return [];

    const isWeekend = weekDay?.includes('sáb');
    const startHour = isWeekend ? OPENING_HOURS.weekendStart : OPENING_HOURS.start;
    const endHour = isWeekend ? OPENING_HOURS.weekendEnd : OPENING_HOURS.end;
    const slots: string[] = [];

    for (let time = startHour * 60; time + totalDuration <= endHour * 60; time += 30) {
      const slotStartMin = time;
      const slotEndMin = time + totalDuration;

      const lisbonTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
        timeZone: 'Europe/Lisbon',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const isBusy = busyEvents.some((event: any) => {
        const startStr = event.start?.dateTime || event.start?.date + 'T00:00:00';
        const endStr = event.end?.dateTime || event.end?.date + 'T23:59:59';

        const evStart = new Date(startStr);
        const evEnd = new Date(endStr);

        const [startH, startM] = lisbonTimeFormatter.format(evStart).split(':').map(Number);
        const [endH, endM] = lisbonTimeFormatter.format(evEnd).split(':').map(Number);

        const evStartMins = startH * 60 + startM;
        const evEndMins = endH * 60 + endM;

        return (slotStartMin < evEndMins) && (slotEndMin > evStartMins);
      });

      if (!isBusy) {
        const h = Math.floor(time / 60).toString().padStart(2, '0');
        const m = (time % 60).toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStatus('submitting');

    try {
      if (!navigator.onLine) throw new Error("Offline");
      const response = await fetch('/.netlify/functions/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.status === 409) {
        alert("Ups! Horário ocupado neste instante. Escolha outro.");
        setStatus('idle'); setFormData(prev => ({ ...prev, time: '' })); return;
      }

      const resData = await response.json();
      if (!response.ok || resData.mockFallback) throw new Error('API Fallback');

      // ✅ BLOCO ATUALIZADO: Remoção do WhatsApp e envio apenas por EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          client_name: sanitizeInput(formData.name),
          email: formData.email,
          phone: formData.phone,
          service: SERVICES_CONFIG[formData.service as keyof typeof SERVICES_CONFIG]?.label || formData.service,
          date: formData.date,
          time: formData.time
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus('success');
    } catch (error) {
      console.error("Erro no agendamento:", error);
      await saveBookingIntent(formData);
      setStatus('success');
    }
  };

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
          <h2 className="text-3xl font-black text-white mb-4">Reserva Recebida</h2>
          <p className="text-white/60 mb-8">Obrigada! Recebemos o seu pedido. Enviaremos um e-mail de confirmação em breve com os detalhes da sua marcação.</p>
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
                      maxLength={15}
                      value={formData.phone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.startsWith('351') && val.length > 9) val = val.slice(3);
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
                  {Object.entries(SERVICES_CONFIG).map(([key, s]) => (
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
                          className={`py-3 rounded-lg text-sm font-medium transition-all ${formData.time === t ? 'bg-[#3b82f6] text-white border-transparent' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
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