import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mail, User, Calendar as CalendarIcon, Clock, Loader2, CheckCircle2, ChevronRight, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BUSINESS_INFO, SERVICES_CONFIG, OPENING_HOURS } from '../../utils/constants';
import { validateEmail, sanitizeInput } from '../../utils/security';
import { saveBookingIntent } from '../../utils/offlineStorage';
import emailjs from '@emailjs/browser';

// --- UTILITÁRIO: Gerar os próximos 14 dias (ignorando Domingos) ---
const generateNextDays = (daysToGenerate: number) => {
  const dates = [];
  const today = new Date();
  
  let added = 0;
  let currentOffset = 0;

  while (added < daysToGenerate) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + currentOffset);
    
    // Ignorar Domingos (0)
    if (nextDate.getDay() !== 0) {
      dates.push(nextDate);
      added++;
    }
    currentOffset++;
  }
  return dates;
};

const BookingForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    phone: '', 
    service: '', 
    date: '', 
    time: ''
  });

  const [availableDates] = useState<Date[]>(generateNextDays(14));
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // === BUSCAR DISPONIBILIDADE ===
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.date || !formData.service) return;
    
      setIsLoadingSlots(true);
      setAvailableSlots([]);

      try {
        const response = await fetch(`/.netlify/functions/schedule?date=${formData.date}`);
        const busyEvents = await response.json();
        const slots = calculateFreeSlots(formData.date, formData.service, Array.isArray(busyEvents) ? busyEvents : []);
        setAvailableSlots(slots);
      } catch (error) {
        console.error("Erro agenda:", error);
        setAvailableSlots(calculateFreeSlots(formData.date, formData.service, []));
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [formData.date, formData.service]);

  // === MOTOR DE CÁLCULO DE HORÁRIOS (UNIFICADO COM PRECISÃO DE LISBOA) ===
  const calculateFreeSlots = (dateStr: string, serviceKey: string, busyEvents: any[]) => {
    const serviceKeyTyped = serviceKey as keyof typeof SERVICES_CONFIG;
    const service = SERVICES_CONFIG[serviceKeyTyped] ?? { duration: 60, buffer: 10 };
    const totalDuration = service.duration + (service.buffer || 10);

    // UNIFICAÇÃO: Formatador com Precisão Geográfica
    const lisbonFormatter = new Intl.DateTimeFormat('pt-PT', {
      timeZone: 'Europe/Lisbon', 
      hour: 'numeric', 
      minute: 'numeric', 
      weekday: 'short', 
      hour12: false
    });

    // EVOLUÇÃO: Precisão Atómica de Lisboa
    const getLisbonMinutes = (isoString: string) => {
      const date = new Date(isoString);
      const parts = lisbonFormatter.formatToParts(date);
      const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      return h * 60 + m; 
    };

    const stableDate = new Date(`${dateStr}T12:00:00Z`);
    const weekDay = lisbonFormatter.formatToParts(stableDate).find(p => p.type === 'weekday')?.value?.toLowerCase();
    
    if (weekDay?.includes('dom')) return [];

    const isWeekend = weekDay?.includes('sáb');
    const startHour = isWeekend ? OPENING_HOURS.weekendStart : OPENING_HOURS.start;
    const endHour = isWeekend ? OPENING_HOURS.weekendEnd : OPENING_HOURS.end;

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Lisbon' }); 
    const isToday = dateStr === todayStr;

    // Cálculo exato dos minutos atuais em Lisboa para a blindagem
    const nowParts = lisbonFormatter.formatToParts(now);
    const currentMinutes = parseInt(nowParts.find(p => p.type === 'hour')?.value || '0') * 60 + 
                           parseInt(nowParts.find(p => p.type === 'minute')?.value || '0');

    const slots: string[] = [];
  
    for (let time = startHour * 60; time + service.duration <= endHour * 60; time += 30) {
      // AJUSTE: Blindagem de Passado (Aumentada para 120min para logística de luxo)
      if (isToday && time < currentMinutes + 120) continue; 

      const slotStartMin = time;
      const slotEndMin = time + totalDuration;

      const isBusy = busyEvents.some((event: any) => {
        const evStartMin = getLisbonMinutes(event.start.dateTime || event.start.date + 'T00:00:00');
        const evEndMin = getLisbonMinutes(event.end.dateTime || event.end.date + 'T23:59:59');
        return (slotStartMin < evEndMin) && (slotEndMin > evStartMin);
      });

      if (!isBusy) {
        const h = Math.floor(time / 60).toString().padStart(2, '0');
        const m = (time % 60).toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }
    return slots;
  };

  // === HANDLERS ===
  const handleNextStep = () => {
    if (step === 1 && !formData.service) return;
    if (step === 2 && (!formData.date || !formData.time)) return;
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => setStep(prev => prev - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
    setFormData(prev => ({ ...prev, phone: numeric }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.trim().length < 3) newErrors.name = "Nome obrigatório (mín. 3 letras).";
    if (!validateEmail(formData.email)) newErrors.email = "Insira um email válido.";
    if (formData.phone.length < 9) newErrors.phone = "Telemóvel inválido (9 dígitos).";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === SUBMISSÃO COM RESILIÊNCIA OFFLINE-FIRST ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStatus('submitting');

    // 1. BLINDAGEM IMEDIATA (Modo Avião / Sem Rede)
    // Se não há internet, guarda no cofre local e garante a conversão visual do cliente.
    if (!navigator.onLine) {
      try {
        await saveBookingIntent(formData);
        setStatus('success'); 
        return;
      } catch (error) {
        console.error("Falha ao gravar localmente:", error);
        setStatus('error');
        return;
      }
    }

    // 2. FLUXO NORMAL (Online)
    try {
      const response = await fetch('/.netlify/functions/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.status === 409) {
        alert("Ups! Horário ocupado neste instante. Escolha outro.");
        setStatus('idle');
        setStep(2);
        setFormData(prev => ({ ...prev, time: '' }));
        return;
      }

      if (!response.ok) throw new Error('Falha no agendamento');

      // Tenta enviar o email, mas não bloqueia a UI se falhar
      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { ...formData, client_name: sanitizeInput(formData.name) },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      ).catch(() => console.log("EmailJS falhou silenciosamente"));

      const msg = `*NOVO AGENDAMENTO*\n--------------------------\n👤 ${formData.name}\n📅 ${formData.date} às ${formData.time}\n✨ ${SERVICES_CONFIG[formData.service as keyof typeof SERVICES_CONFIG]?.label || formData.service}\n📞 ${formData.phone}\n--------------------------\nObrigada! Entraremos em contacto em breve.`;
      window.open(`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');

      setStatus('success');
    } catch (err) {
      // 3. FALLBACK DE RESILIÊNCIA
      // Se a internet falhar exatamente durante o envio (timeout), salvamos localmente
      console.warn("Anomalia de rede detetada. A desviar para o cofre local...");
      try {
        await saveBookingIntent(formData);
        setStatus('success');
      } catch (fallbackErr) {
        setStatus('error');
      }
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  // === UI DE SUCESSO ===
  if (status === 'success') {
    return (
      <section className="py-32 bg-[#0A0A0A] flex items-center justify-center min-h-screen relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-braz-pink/10 rounded-full blur-[100px] pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-[#171717]/80 backdrop-blur-2xl p-12 rounded-[2rem] border border-braz-pink/30 max-w-lg text-center shadow-2xl shadow-braz-pink/10 z-10"
        >
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-tr from-braz-pink to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(197,160,89,0.4)]"
          >
            <CheckCircle2 className="w-12 h-12 text-braz-black" />
          </motion.div>
          <h2 className="text-4xl font-montserrat font-black text-white mb-4 tracking-tight">Experiência Confirmada</h2>
          <p className="text-white/60 mb-10 text-lg leading-relaxed font-light">
            O seu lugar está reservado. <br />Finalize a confirmação no WhatsApp que acabou de abrir.
          </p>
          <button 
            onClick={() => { setStatus('idle'); setStep(1); setFormData({ name: '', email: '', phone: '', service: '', date: '', time: '' }); setErrors({}); }}
            className="text-braz-pink font-bold uppercase tracking-[0.2em] text-sm hover:text-white transition-colors"
          >
            Novo Agendamento
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="agendamento" className="py-24 bg-[#0A0A0A] min-h-screen flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-braz-pink/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-montserrat font-black uppercase tracking-tighter text-white mb-4">
            Reserva <span className="text-braz-pink text-transparent bg-clip-text bg-gradient-to-r from-braz-pink to-yellow-200">Premium</span>
          </h2>
          <div className="flex items-center justify-center space-x-3 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center">
                <motion.div 
                  className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-12 bg-braz-pink' : step > i ? 'w-6 bg-braz-pink/50' : 'w-6 bg-white/10'}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#121212]/80 backdrop-blur-3xl p-6 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl relative min-h-[500px]">
          {status === 'error' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center text-sm z-20 backdrop-blur-md">
              Ocorreu um erro ao comunicar com a agenda. Tente novamente.
            </div>
          )}

          <AnimatePresence>
            {step > 1 && (
              <motion.button
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onClick={handlePrevStep}
                className="absolute top-8 left-8 text-white/40 hover:text-braz-pink transition-colors p-2 rounded-full hover:bg-white/5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest z-10"
              >
                <ArrowLeft size={16} /> Voltar
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="pt-8">
                <h3 className="text-2xl font-bold text-white mb-8 text-center font-montserrat">Qual é a sua necessidade hoje?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(SERVICES_CONFIG).map(([key, service]) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      key={key}
                      onClick={() => { setFormData(prev => ({ ...prev, service: key, time: '' })); setTimeout(handleNextStep, 250); }}
                      className={`p-6 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group ${
                        formData.service === key 
                          ? 'bg-braz-pink/10 border-braz-pink shadow-[0_0_20px_rgba(197,160,89,0.15)]' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <p className={`font-bold text-lg mb-1 ${formData.service === key ? 'text-braz-pink' : 'text-white'}`}>{service.label}</p>
                        <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={12} /> {service.duration} min
                        </p>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                        formData.service === key ? 'bg-braz-pink border-braz-pink text-braz-black' : 'border-white/10 text-white/20 group-hover:border-white/30 group-hover:text-white/50'
                      }`}>
                        <ChevronRight size={16} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="pt-8 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-white mb-8 text-center font-montserrat">Escolha o seu momento</h3>
                
                <div className="mb-10">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Datas Disponíveis</p>
                  <div ref={scrollRef} className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar snap-x scroll-smooth">
                    {availableDates.map((dateObj) => {
                      const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Europe/Lisbon' });
                      const isSelected = formData.date === dateStr;
                      const dayName = dateObj.toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '');
                      const dayNum = dateObj.getDate();
                      const monthName = dateObj.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '');

                      return (
                        <motion.button
                          whileTap={{ scale: 0.9 }} key={dateStr}
                          onClick={() => setFormData(prev => ({ ...prev, date: dateStr, time: '' }))}
                          className={`snap-center flex-shrink-0 w-20 py-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                            isSelected 
                              ? 'bg-braz-pink border-braz-pink text-braz-black shadow-[0_10px_20px_rgba(197,160,89,0.3)]' 
                              : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{dayName}</span>
                          <span className="text-2xl font-black">{dayNum}</span>
                          <span className="text-[10px] uppercase font-bold opacity-70">{monthName}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Horários</p>
                    {isLoadingSlots && <Loader2 className="w-4 h-4 text-braz-pink animate-spin" />}
                  </div>

                  {!formData.date ? (
                    <div className="h-32 flex items-center justify-center text-white/20 text-sm border-2 border-dashed border-white/5 rounded-2xl">Selecione uma data acima</div>
                  ) : isLoadingSlots ? (
                    <div className="h-32 flex items-center justify-center text-braz-pink/50 text-sm border-2 border-dashed border-white/5 rounded-2xl">A sincronizar agenda...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-white/40 text-sm border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">Sem disponibilidade.</div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {availableSlots.map(time => (
                        <button
                          key={time} onClick={() => setFormData(prev => ({ ...prev, time }))}
                          className={`py-3 rounded-xl text-sm font-bold transition-all ${
                            formData.time === time 
                              ? 'bg-gradient-to-r from-braz-pink to-yellow-400 text-braz-black shadow-lg scale-105' 
                              : 'bg-[#1A1A1A] text-white/70 hover:bg-[#222] hover:text-white border border-white/5'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                  <button 
                    onClick={handleNextStep} disabled={!formData.date || !formData.time}
                    className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 disabled:opacity-30 hover:bg-braz-pink transition-colors"
                  >
                    Continuar <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="pt-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white font-montserrat">Último passo</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
                  <div className="relative group">
                    <input 
                      type="text" name="name" id="name" value={formData.name} onChange={handleChange}
                      className={`block w-full px-5 pb-3 pt-7 bg-white/5 border rounded-2xl text-white outline-none peer transition-all ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-braz-pink focus:bg-white/10'}`}
                      placeholder=" "
                    />
                    <label htmlFor="name" className="absolute text-xs uppercase tracking-widest font-bold duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 text-white/40">Nome Completo</label>
                    {errors.name && <p className="text-red-400 text-[10px] mt-1.5 ml-2 flex items-center gap-1"><AlertCircle size={12}/> {errors.name}</p>}
                  </div>

                  <div className="relative group">
                    <input 
                      type="email" name="email" id="email" value={formData.email} onChange={handleChange}
                      className={`block w-full px-5 pb-3 pt-7 bg-white/5 border rounded-2xl text-white outline-none peer transition-all ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-braz-pink focus:bg-white/10'}`}
                      placeholder=" "
                    />
                    <label htmlFor="email" className="absolute text-xs uppercase tracking-widest font-bold duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 text-white/40">Email</label>
                    {errors.email && <p className="text-red-400 text-[10px] mt-1.5 ml-2 flex items-center gap-1"><AlertCircle size={12}/> {errors.email}</p>}
                  </div>

                  <div className="relative group">
                    <input 
                      type="tel" name="phone" id="phone" maxLength={9} value={formData.phone} onChange={handlePhoneChange}
                      className={`block w-full px-5 pb-3 pt-7 bg-white/5 border rounded-2xl text-white outline-none peer transition-all ${errors.phone ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-braz-pink focus:bg-white/10'}`}
                      placeholder=" "
                    />
                    <label htmlFor="phone" className="absolute text-xs uppercase tracking-widest font-bold duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 text-white/40">Telemóvel</label>
                    {errors.phone && <p className="text-red-400 text-[10px] mt-1.5 ml-2 flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>}
                  </div>

                  <div className="bg-braz-black/50 p-4 rounded-xl border border-white/5 mt-6 flex justify-between items-center text-sm">
                    <div>
                      <p className="text-white/50 text-[10px] mb-1">Resumo</p>
                      <p className="text-white font-bold">{SERVICES_CONFIG[formData.service as keyof typeof SERVICES_CONFIG]?.label || formData.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-[10px] mb-1">Data & Hora</p>
                      <p className="text-braz-pink font-bold">{formData.date.split('-').reverse().join('/')} às {formData.time}</p>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={status === 'submitting'}
                    className="w-full bg-gradient-to-r from-braz-pink to-yellow-300 text-black py-5 text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(197,160,89,0.3)] mt-8"
                  >
                    {status === 'submitting' ? <><Loader2 className="animate-spin" size={18} /> A Processar...</> : <><Sparkles size={18} /> Confirmar Reserva</>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
};

export default BookingForm;