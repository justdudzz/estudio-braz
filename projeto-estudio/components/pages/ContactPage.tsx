import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Clock, Instagram, MessageCircle, MapPin } from 'lucide-react';
import { BUSINESS_INFO, OPENING_HOURS } from '../../utils/constants';

const contactInfo = [
    { icon: <Phone size={18} strokeWidth={1.5} />, label: 'Telemóvel', value: '+351 914 843 087', href: `https://wa.me/${BUSINESS_INFO.whatsapp}` },
    { icon: <Mail size={18} strokeWidth={1.5} />, label: 'Email', value: BUSINESS_INFO.email, href: `mailto:${BUSINESS_INFO.email}` },
    { icon: <MapPin size={18} strokeWidth={1.5} />, label: 'Morada', value: BUSINESS_INFO.address, href: BUSINESS_INFO.addressUrl },
    { icon: <Instagram size={18} strokeWidth={1.5} />, label: 'Instagram', value: `@${BUSINESS_INFO.instagram}`, href: BUSINESS_INFO.instagramUrl },
];

const ContactPage: React.FC = () => {
    useEffect(() => { document.title = `Contacto | ${BUSINESS_INFO.name}`; }, []);

    return (
        <>
            {/* Hero */}
            <section className="pt-24 pb-16 bg-gradient-to-b from-braz-black to-[#050505]">
                <div className="container mx-auto px-6 text-center">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-braz-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">Atendimento Exclusivo</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-montserrat font-black text-white uppercase tracking-tighter mb-8">Contacto</motion.h1>
                    <div className="w-12 h-1 bg-braz-gold mx-auto mb-8 rounded-full" />
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/50 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
                        Estamos à sua disposição para esclarecer dúvidas e agendar a sua próxima experiência no Studio Braz.
                    </motion.p>
                </div>
            </section>

            <section className="pb-32 bg-[#050505]">
                <div className="container mx-auto px-6 max-w-2xl">
                    <div className="bg-[#101010]/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden">

                        {/* Subtle background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-braz-gold/5 blur-[100px] pointer-events-none" />

                        {/* Contact Cards */}
                        <div className="space-y-4 mb-12 relative z-10">
                            {contactInfo.map((c, i) => (
                                <motion.a key={i} href={c.href} target="_blank" rel="noopener noreferrer"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                    whileTap={{ scale: 0.97, x: 5 }}
                                    className="flex items-center gap-6 bg-[#121212] p-5 md:p-6 rounded-2xl border border-white/5 hover:border-braz-gold/30 hover:shadow-[0_0_30px_rgba(197,160,89,0.1)] transition-all duration-300 group"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-braz-gold/10 to-transparent rounded-2xl flex items-center justify-center text-braz-gold border border-braz-gold/20 group-hover:bg-braz-gold/20 group-hover:scale-110 transition-all duration-500 shadow-lg">{c.icon}</div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{c.label}</p>
                                        <p className="text-sm md:text-base text-white/90 font-medium group-hover:text-white transition-colors">{c.value}</p>
                                    </div>
                                </motion.a>
                            ))}
                        </div>

                        {/* Opening Hours */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-gradient-to-b from-[#121212] to-[#0A0A0A] p-8 rounded-3xl border border-white/5 mb-8 relative z-10 shadow-inner">
                            <h3 className="text-[11px] font-black font-montserrat tracking-[0.2em] uppercase text-white mb-6 flex items-center gap-3">
                                <Clock size={16} strokeWidth={1.5} className="text-braz-gold" /> Horário de Funcionamento
                            </h3>
                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex justify-between items-center text-white/60 border-b border-white/5 pb-4"><span>Segunda a Sexta</span><span className="text-white text-xs font-bold tracking-widest">{OPENING_HOURS.start}:00 — {OPENING_HOURS.end}:00</span></div>
                                <div className="flex justify-between items-center text-white/60 border-b border-white/5 pb-4"><span>Sábado</span><span className="text-white text-xs font-bold tracking-widest">{OPENING_HOURS.weekendStart}:00 — {OPENING_HOURS.weekendEnd}:00</span></div>
                                <div className="flex justify-between items-center text-white/40 pt-2"><span>Domingo</span><span className="text-red-400/80 text-[10px] uppercase tracking-widest font-black">Encerrado</span></div>
                            </div>
                        </motion.div>

                        {/* WhatsApp CTA */}
                        <motion.a href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${BUSINESS_INFO.whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                            whileTap={{ scale: 0.98 }}
                            className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:shadow-[0_0_40px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 z-10 overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                            <MessageCircle size={20} strokeWidth={1.5} className="relative z-10" /> <span className="relative z-10">Falar no WhatsApp</span>
                        </motion.a>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ContactPage;
