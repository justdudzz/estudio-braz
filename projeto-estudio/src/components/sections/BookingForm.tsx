import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { createNewBooking, getBusySlots } from '../../services/bookingService';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', serviceIds: [] as string[], staffId: '', date: '', time: '' });
  const [staffList, setStaffList] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingStep, setBookingStep] = useState(0); // 0: Staff, 1: Services, 2: Date/Time, 3: Contact, 4: Summary
  const [hpValue, setHpValue] = useState(''); // Honeypot trap
  const { user } = useAuth();

  // 🚀 CEO Smooth Scroll: Garantir que o utilizador vê sempre o topo do passo atual
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [bookingStep]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get('/staff/services');
        setStaffList(response.data);
      } catch (error) {
        console.error("Erro ao carregar staff:", error);
      }
    };
    fetchStaff();
  }, []);

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const isDateDisabled = (year: number, month: number, day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCompare = new Date(year, month, day);
    dateToCompare.setHours(0, 0, 0, 0);
    const dayOfWeek = dateToCompare.getDay();
    // Segunda-feira (1) = Folga da Mariana, Domingo (0) = Encerrado
    return dateToCompare <= today || dayOfWeek === 0 || dayOfWeek === 1;
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.date || formData.serviceIds.length === 0 || !formData.staffId) return;
      setIsLoading(true);
      try {
        const selectedStaff = staffList.find(s => s.id === formData.staffId);
        const totalDuration = selectedStaff?.providedServices
          .filter((s: any) => formData.serviceIds.includes(s.id))
          .reduce((acc: number, s: any) => acc + s.duration, 0) || 30;

        const slots = await getBusySlots(formData.date, formData.staffId, (user as any)?.clientId, totalDuration);
        setAvailableSlots(slots);
      } catch (error) {
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [formData.date, formData.serviceIds, formData.staffId]);

  const toggleService = (id: string) => {
    setFormData(prev => {
      const alreadySelected = prev.serviceIds.includes(id);
      if (alreadySelected) {
        return { ...prev, serviceIds: prev.serviceIds.filter(sid => sid !== id) };
      } else {
        return { ...prev, serviceIds: [...prev.serviceIds, id] };
      }
    });
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 0 && !formData.staffId) newErrors.staffId = "Escolha um profissional.";
    if (step === 1 && formData.serviceIds.length === 0) newErrors.serviceIds = "Escolha pelo menos um serviço.";
    if (step === 2 && (!formData.date || !formData.time)) newErrors.dateTime = "Escolha data e hora.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(bookingStep)) setBookingStep(prev => prev + 1);
  }

  const prevStep = () => setBookingStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hpValue) return; // Silent reject if honeypot is filled
    setStatus('submitting');
    try {
      await createNewBooking({ ...formData, honeypot: hpValue } as any);
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
      <div key={`h-${idx}`} className="text-center text-[10px] font-bold text-white/30 uppercase py-2">{day}</div>
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
          className={`h-10 w-full flex items-center justify-center rounded-xl text-sm transition-all relative overflow-hidden ${
            isDisabled 
              ? 'opacity-20 cursor-not-allowed bg-white/[0.02]' 
              : isSelected 
                ? 'bg-braz-gold text-black font-bold shadow-[0_0_15px_rgba(197,160,89,0.3)]' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          {d}
          {isDisabled && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-white/10 -rotate-45" /></div>}
        </button>
      );
    }
    return days;
  };

  if (status === 'success') {
    return (
      <section className="py-32 bg-[#080808] flex items-center justify-center min-h-screen">
        <div className="bg-[#121212] p-16 rounded-[2rem] border border-white/10 text-center max-w-lg shadow-2xl">
          <CheckCircle2 className="w-20 h-20 text-braz-gold mx-auto mb-8" />
          <h2 className="text-3xl font-black text-white mb-4 uppercase">Reserva Recebida</h2>
          <p className="text-white/50 mb-10 text-sm">A sua marcação no Studio Braz foi registada com sucesso.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-braz-gold text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest">
            Novo Agendamento
          </button>
        </div>
      </section>
    );
  }

  const selectedStaff = staffList.find(s => s.id === formData.staffId);

  return (
    <section className="py-20 bg-[#080808] min-h-screen text-white flex items-center justify-center p-6">
      <div className="container max-w-4xl bg-[#101010]/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        
        {/* Step Indicator */}
        <div className="flex gap-4 mb-14">
          {[0, 1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${bookingStep >= s ? 'bg-braz-gold shadow-[0_0_15px_rgba(197,160,89,0.5)]' : 'bg-white/5'}`}></div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {bookingStep === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <h3 className="text-4xl font-black uppercase tracking-tighter">Quem a irá atender?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staffList.map((s: any) => (
                  <button key={s.id} type="button" onClick={() => { setFormData(prev => ({ ...prev, staffId: s.id, serviceIds: [] })); nextStep(); }} className={`p-8 rounded-3xl border transition-all text-left flex items-center space-x-6 ${formData.staffId === s.id ? 'border-braz-gold bg-braz-gold/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                    {s.photoUrl ? (
                      <img src={s.photoUrl} alt={s.displayName || s.email} className="w-20 h-20 rounded-2xl object-cover border border-braz-gold/20" />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-braz-gold/20 to-transparent rounded-2xl flex items-center justify-center text-braz-gold font-black text-2xl uppercase border border-braz-gold/20">
                        {(s.displayName || s.email).charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xl font-bold">{s.displayName || s.email.split('@')[0]}</p>
                      <p className="text-white/40 text-xs uppercase tracking-widest">{s.role === 'SUPER_ADMIN' ? 'Diretora' : 'Especialista'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {bookingStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <div className="flex justify-between items-end">
                <h3 className="text-4xl font-black uppercase tracking-tighter">Escolha os Serviços</h3>
                <p className="text-braz-gold text-[10px] font-black uppercase tracking-widest bg-braz-gold/10 px-4 py-2 rounded-full border border-braz-gold/20">Profissional: {selectedStaff?.displayName || selectedStaff?.email.split('@')[0]}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedStaff?.providedServices.map((s: any) => (
                  <button key={s.id} type="button" onClick={() => toggleService(s.id)} className={`p-6 rounded-2xl border transition-all text-left flex justify-between items-center ${formData.serviceIds.includes(s.id) ? 'border-braz-gold bg-braz-gold/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                    <div>
                      <p className="font-bold">{s.label}</p>
                      <p className="text-white/40 text-xs">{s.duration} min • {s.price}€</p>
                    </div>
                    {formData.serviceIds.includes(s.id) && <CheckCircle2 className="text-braz-gold" size={20} />}
                  </button>
                ))}
              </div>
              <div className="flex space-x-4">
                <button type="button" onClick={prevStep} className="flex-1 border border-white/10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white/20 hover:text-white transition-all">Voltar</button>
                <button type="button" onClick={nextStep} className="flex-[2] bg-braz-gold text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Continuar</button>
              </div>
            </motion.div>
          )}

          {bookingStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <h3 className="text-4xl font-black uppercase tracking-tighter">O Momento</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/5 shadow-inner">
                  <div className="flex justify-between items-center mb-8">
                    <button type="button" onClick={() => changeMonth(-1)} className="p-2 hover:text-braz-gold transition-colors"><ChevronLeft size={20} /></button>
                    <span className="uppercase font-black text-xs tracking-widest font-montserrat">{currentMonth.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}</span>
                    <button type="button" onClick={() => changeMonth(1)} className="p-2 hover:text-braz-gold transition-colors"><ChevronRight size={20} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Horários Disponíveis</p>
                  {isLoading ? <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-braz-gold" /></div> : (
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.length > 0 ? availableSlots.map(t => (
                        <button key={t} type="button" onClick={() => setFormData(p => ({ ...p, time: t }))} className={`py-4 rounded-xl text-[11px] font-bold border transition-all ${formData.time === t ? 'bg-braz-gold text-black border-braz-gold shadow-[0_0_15px_rgba(197,160,89,0.3)]' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}>{t}</button>
                      )) : (
                        <div className="col-span-3 text-center py-10 text-white/20 text-xs italic">Sem vagas para esta data.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-4">
                <button type="button" onClick={prevStep} className="flex-1 border border-white/10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white/20 hover:text-white transition-all">Voltar</button>
                <button type="button" onClick={nextStep} className="flex-[2] bg-braz-gold text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Confirmar Horário</button>
              </div>
            </motion.div>
          )}

          {bookingStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <h3 className="text-4xl font-black uppercase tracking-tighter">Seus Contactos</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Nome Completo</label>
                  <input type="text" placeholder="Nome" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl outline-none focus:border-braz-gold transition-all text-white shadow-inner" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">E-mail</label>
                    <input type="email" placeholder="email@exemplo.pt" value={formData.email || ''} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl outline-none focus:border-braz-gold transition-all text-white shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Telemóvel</label>
                    <input 
                      type="tel" 
                      placeholder="9XX XXX XXX" 
                      value={formData.phone || ''} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '').slice(0, 9);
                        if (val.length > 6) val = `${val.slice(0, 3)} ${val.slice(3, 6)} ${val.slice(6)}`;
                        else if (val.length > 3) val = `${val.slice(0, 3)} ${val.slice(3)}`;
                        setFormData(p => ({ ...p, phone: val }));
                      }} 
                      className="w-full bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl outline-none focus:border-braz-gold transition-all text-white shadow-inner font-mono tracking-widest" 
                    />
                  </div>
                </div>
                {/* Honeypot Trap */}
                <input type="text" name="b_name" className="hp-field" value={hpValue} onChange={e => setHpValue(e.target.value)} tabIndex={-1} autoComplete="off" />
              </div>
              <div className="flex space-x-4">
                <button type="button" onClick={prevStep} className="flex-1 border border-white/10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white/20 hover:text-white transition-all">Voltar</button>
                <button type="button" onClick={nextStep} className="flex-[2] bg-braz-gold text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Rever Marcação</button>
              </div>
            </motion.div>
          )}

          {bookingStep === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <h3 className="text-4xl font-black uppercase tracking-tighter">Resumo Final</h3>
              
              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-6">
                 <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Profissional</p>
                        <p className="font-bold text-lg text-braz-gold">{selectedStaff?.displayName || selectedStaff?.email.split('@')[0]}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Data & Hora</p>
                        <p className="font-bold text-lg text-white">{formData.date} às {formData.time}</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Serviços Selecionados</p>
                    {selectedStaff?.providedServices.filter((s:any) => formData.serviceIds.includes(s.id)).map((s:any) => (
                      <div key={s.id} className="flex justify-between text-sm">
                        <span className="text-white/60">{s.label}</span>
                        <span className="font-bold">€{s.price}</span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest text-braz-gold">Valor Total</span>
                        <span className="text-2xl font-black">
                            €{selectedStaff?.providedServices
                                .filter((s: any) => formData.serviceIds.includes(s.id))
                                .reduce((acc: number, s: any) => acc + s.price, 0)}
                        </span>
                    </div>
                 </div>

                 <div className="bg-braz-gold/5 border border-braz-gold/10 p-4 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-braz-gold/60 mb-1">Contacto de Confirmação</p>
                    <p className="text-xs font-bold text-white/80">{formData.name} • {formData.phone}</p>
                 </div>
              </div>

              <div className="flex space-x-4">
                <button type="button" onClick={prevStep} className="flex-1 border border-white/10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white/20 hover:text-white transition-all">Editar</button>
                <button type="submit" disabled={status === 'submitting'} className="flex-[3] bg-braz-gold text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_10px_30px_rgba(197,160,89,0.3)] flex items-center justify-center gap-3">
                  {status === 'submitting' ? <Loader2 className="animate-spin text-black" /> : <><CheckCircle2 size={16} /> Confirmar Marcação</>}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </section>
  );
};

export default BookingForm;
