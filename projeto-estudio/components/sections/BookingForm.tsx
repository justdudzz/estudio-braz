  import React, { useState, useEffect } from 'react';
  import { Phone, Mail, User, Calendar, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
  import { motion } from 'framer-motion';
  import { BUSINESS_INFO, SERVICES_CONFIG, OPENING_HOURS } from '../../utils/constants';
  import { validateEmail, sanitizeInput } from '../../utils/security';
  import emailjs from '@emailjs/browser';

  const BookingForm: React.FC = () => {
    const [formData, setFormData] = useState({
      name: '', 
      email: '', 
      phone: '', 
      service: 'Microblading', 
      date: '', 
      time: ''
    });

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // === VALIDAÇÃO (mensagens curtas e claras) ===
    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (formData.name.trim().length < 3) newErrors.name = "Nome obrigatório.";
      if (!validateEmail(formData.email)) newErrors.email = "Email inválido.";
      if (formData.phone.length < 9) newErrors.phone = "Telemóvel inválido.";
      if (!formData.date) newErrors.date = "Escolha uma data.";
      if (!formData.time) newErrors.time = "Escolha um horário.";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // === BUSCAR DISPONIBILIDADE ===
    useEffect(() => {
      const fetchAvailability = async () => {
        if (!formData.date || !formData.service) {
          setAvailableSlots([]);
          return;
        }
      
        setIsLoadingSlots(true);
        setAvailableSlots([]);

        try {
          const response = await fetch(`/.netlify/functions/schedule?date=${formData.date}`);
          const busyEvents = await response.json();

          const slots = calculateFreeSlots(
            formData.date, 
            formData.service, 
            Array.isArray(busyEvents) ? busyEvents : []
          );
          
          setAvailableSlots(slots);
        } catch (error) {
          console.error("Erro ao carregar agenda:", error);
          setAvailableSlots(calculateFreeSlots(formData.date, formData.service, []));
        } finally {
          setIsLoadingSlots(false);
        }
      };

      fetchAvailability();
    }, [formData.date, formData.service]);

    // === MOTOR DE CÁLCULO DE SLOTS (FUSO HORÁRIO DE LISBOA) ===
    const calculateFreeSlots = (dateStr: string, serviceKey: string, busyEvents: any[]) => {
      const serviceKeyTyped = serviceKey as keyof typeof SERVICES_CONFIG;
      const service = SERVICES_CONFIG[serviceKeyTyped] ?? { duration: 60, buffer: 10 };

      const totalDuration = service.duration + (service.buffer || 10);

      const lisbonFormatter = new Intl.DateTimeFormat('pt-PT', {
        timeZone: 'Europe/Lisbon',
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'short',
        hour12: false
      });

      const getLisbonMinutes = (isoString: string) => {
        const date = new Date(isoString);
        const parts = lisbonFormatter.formatToParts(date);
        const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
        const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
        return h * 60 + m;
      };

      const stableDate = new Date(`${dateStr}T12:00:00Z`);
      const parts = lisbonFormatter.formatToParts(stableDate);
      const weekDay = parts.find(p => p.type === 'weekday')?.value?.toLowerCase();

      if (weekDay?.includes('dom')) return [];

      const isWeekend = weekDay?.includes('sáb');
      const startHour = isWeekend ? OPENING_HOURS.weekendStart : OPENING_HOURS.start;
      const endHour = isWeekend ? OPENING_HOURS.weekendEnd : OPENING_HOURS.end;

      const startMin = startHour * 60;
      const endMin = endHour * 60;
      const slots: string[] = [];
    
      for (let time = startMin; time + service.duration <= endMin; time += 30) {
        const slotStartMin = time;
        const slotEndMin = time + totalDuration;

        const isBusy = busyEvents.some((event: any) => {
          const evStartStr = event.start.dateTime || event.start.date + 'T00:00:00';
          const evEndStr = event.end.dateTime || event.end.date + 'T23:59:59';
          
          const evStartMin = getLisbonMinutes(evStartStr);
          const evEndMin = getLisbonMinutes(evEndStr);

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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (errors[name]) {
        setErrors(prev => {
          const n = { ...prev };
          delete n[name];
          return n;
        });
      }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numeric = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
      setFormData(prev => ({ ...prev, phone: numeric }));
      
      if (errors.phone) {
        setErrors(prev => {
          const n = { ...prev };
          delete n.phone;
          return n;
        });
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setStatus('submitting');

      try {
        const response = await fetch('/.netlify/functions/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.status === 409) {
          alert("Ups! Esse horário acabou de ser ocupado. Atualize a página e escolha outro.");
          setStatus('idle');
          setFormData(prev => ({ ...prev, time: '' }));
          return;
        }

        if (!response.ok) throw new Error('Falha no agendamento');

        // EmailJS Backup
        const templateParams = {
          client_name: sanitizeInput(formData.name),
          client_email: formData.email,
          client_phone: formData.phone,
          service: formData.service,
          date: formData.date,
          time: formData.time,
        };

        emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        ).catch(err => console.log("EmailJS falhou, mas agendamento Google OK"));

        // WhatsApp Confirmação
        const msg = `*AGENDAMENTO CONFIRMADO*\n--------------------------\n👤 ${formData.name}\n📅 ${formData.date} às ${formData.time}\n✨ ${formData.service}\n📞 ${formData.phone}\n--------------------------\nObrigada! Entraremos em contacto em breve.`;
        
        window.open(`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');

        setStatus('success');

      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    // === TELA DE SUCESSO (design bonito + motion) ===
    if (status === 'success') {
      return (
        <section id="agendamento" className="py-32 bg-[#0A0A0A] flex items-center justify-center min-h-[70vh]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#171717] p-12 md:p-16 rounded-3xl border border-braz-pink/30 max-w-lg text-center"
          >
            <CheckCircle2 className="w-24 h-24 text-braz-pink mx-auto mb-8" />
            <h2 className="text-4xl font-montserrat font-bold text-white mb-4">Agendamento Confirmado!</h2>
            <p className="text-white/70 mb-10 text-lg leading-relaxed">
              Já está na nossa agenda.<br />
              Abrimos o WhatsApp para finalizar a confirmação.
            </p>
            <button 
              onClick={() => {
                setStatus('idle');
                setFormData({ name: '', email: '', phone: '', service: 'Microblading', date: '', time: '' });
                setAvailableSlots([]);
                setErrors({});
              }}
              className="text-braz-pink font-bold uppercase tracking-widest border-b border-braz-pink pb-1 hover:text-white transition-colors"
            >
              Novo Agendamento
            </button>
          </motion.div>
        </section>
      );
    }

    return (
      <section id="agendamento" className="py-32 bg-[#0A0A0A]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-montserrat font-extrabold uppercase tracking-tighter text-white mb-3">Agendamento</h2>
            <div className="w-20 h-1 bg-braz-pink mx-auto mb-6" />
            <p className="text-white/60 font-light text-lg">Selecione o serviço e veja os horários disponíveis em tempo real.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#171717] p-8 md:p-14 rounded-3xl border border-white/5 shadow-2xl">
            {status === 'error' && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-center text-sm">
                Ocorreu um erro ao comunicar com a agenda. Tente novamente.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-10">
              {/* ESQUERDA: DADOS */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3 font-montserrat">
                  <User className="text-braz-pink" size={26} /> Seus Dados
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">Nome Completo</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full p-4 bg-[#0A0A0A] border rounded-2xl text-white focus:border-braz-pink outline-none transition-all ${errors.name ? 'border-red-500' : 'border-white/10'}`}
                      placeholder="Maria Silva"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full p-4 bg-[#0A0A0A] border rounded-2xl text-white focus:border-braz-pink outline-none transition-all ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                      placeholder="maria@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">Telemóvel</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      required
                      maxLength={9}
                      className={`w-full p-4 bg-[#0A0A0A] border rounded-2xl text-white focus:border-braz-pink outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-white/10'}`}
                      placeholder="912345678"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* DIREITA: DISPONIBILIDADE */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3 font-montserrat">
                  <Calendar className="text-braz-pink" size={26} /> Disponibilidade
                </h3>

                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">Serviço</label>
                  <select 
                    name="service" 
                    value={formData.service} 
                    onChange={handleChange}
                    className="w-full p-4 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white focus:border-braz-pink outline-none appearance-none"
                  >
                    {Object.entries(SERVICES_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label} ({config.duration} min)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">Data</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-4 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white focus:border-braz-pink outline-none invert-calendar-icon"
                  />
                  {errors.date && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.date}
                    </p>
                  )}
                </div>

                {/* HORÁRIOS */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest block">Horários Disponíveis</label>
                    {availableSlots.length > 0 && (
                      <span className="text-[10px] text-braz-pink uppercase tracking-widest font-bold">Fuso: Europa/Lisbon</span>
                    )}
                  </div>
                  
                  {!formData.date ? (
                    <div className="h-40 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl text-white/40 text-sm">
                      Selecione uma data para ver os horários
                    </div>
                  ) : isLoadingSlots ? (
                    <div className="flex flex-col items-center justify-center h-40 text-braz-pink">
                      <Loader2 className="animate-spin w-9 h-9 mb-3" />
                      <span className="uppercase tracking-widest text-sm">A verificar agenda...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto custom-scrollbar p-1">
                        {availableSlots.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, time }))}
                            className={`py-3.5 text-sm font-medium rounded-xl transition-all ${
                              formData.time === time 
                                ? 'bg-braz-pink text-braz-black scale-105 shadow-lg shadow-braz-pink/30 ring-2 ring-white/30' 
                                : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl text-center">
                      <p className="text-red-400 font-bold">Dia completo</p>
                      <p className="text-red-400/70 text-sm mt-1">Por favor escolha outra data.</p>
                    </div>
                  )}

                  {errors.time && (
                    <p className="text-red-500 text-xs mt-3 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.time}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <button
                type="submit"
                disabled={status === 'submitting' || !formData.time}
                className="w-full bg-braz-pink hover:bg-white text-braz-black py-6 text-lg font-black uppercase tracking-[1.5px] rounded-2xl transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-3 shadow-xl shadow-braz-pink/20"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" />
                    A CONFIRMAR AGENDAMENTO...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    CONFIRMAR AGENDAMENTO
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  };

  export default BookingForm;