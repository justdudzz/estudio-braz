import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Clock, Instagram, MessageCircle, MapPin } from 'lucide-react';
import { BUSINESS_INFO, OPENING_HOURS } from '../../utils/constants';

const contactInfo = [
    { icon: <Phone size={18} />, label: 'Telemóvel', value: '+351 914 843 087', href: `https://wa.me/${BUSINESS_INFO.whatsapp}` },
    { icon: <Mail size={18} />, label: 'Email', value: BUSINESS_INFO.email, href: `mailto:${BUSINESS_INFO.email}` },
    { icon: <MapPin size={18} />, label: 'Morada', value: BUSINESS_INFO.address, href: BUSINESS_INFO.addressUrl },
    { icon: <Instagram size={18} />, label: 'Instagram', value: `@${BUSINESS_INFO.instagram}`, href: BUSINESS_INFO.instagramUrl },
];

const ContactPage: React.FC = () => {
    useEffect(() => { document.title = `Contacto | ${BUSINESS_INFO.name}`; }, []);

    return (
        <>
            {/* Hero */}
            <section className="pt-12 pb-16 bg-gradient-to-b from-[#0A0A0A] to-[#080808]">
                <div className="container mx-auto px-6 text-center">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] mb-3">Fale Connosco</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Contacto</motion.h1>
                </div>
            </section>

            <section className="pb-24 bg-[#080808]">
                <div className="container mx-auto px-6 max-w-xl">
                    {/* Contact Cards */}
                    <div className="space-y-3 mb-8">
                        {contactInfo.map((c, i) => (
                            <motion.a key={i} href={c.href} target="_blank" rel="noopener noreferrer"
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                className="flex items-center gap-4 bg-[#121212] p-5 rounded-2xl border border-white/5 hover:border-[#C5A059]/30 transition-all group"
                            >
                                <div className="w-12 h-12 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-[#C5A059] border border-white/5 group-hover:border-[#C5A059]/30 group-hover:bg-[#C5A059]/10 transition-all">{c.icon}</div>
                                <div>
                                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{c.label}</p>
                                    <p className="text-sm text-white/70 font-semibold">{c.value}</p>
                                </div>
                            </motion.a>
                        ))}
                    </div>

                    {/* Opening Hours */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-[#121212] p-6 rounded-2xl border border-white/5 mb-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Clock size={14} className="text-[#C5A059]" /> Horário de Funcionamento</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-white/60"><span>Segunda a Sexta</span><span className="text-white font-semibold">{OPENING_HOURS.start}:00 — {OPENING_HOURS.end}:00</span></div>
                            <div className="flex justify-between text-white/60"><span>Sábado</span><span className="text-white font-semibold">{OPENING_HOURS.weekendStart}:00 — {OPENING_HOURS.weekendEnd}:00</span></div>
                            <div className="flex justify-between text-white/40"><span>Domingo</span><span className="text-red-400/60 font-semibold">Encerrado</span></div>
                        </div>
                    </motion.div>

                    {/* WhatsApp CTA */}
                    <a href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${BUSINESS_INFO.whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-2xl font-bold uppercase text-sm tracking-wider hover:bg-green-500 transition-all">
                        <MessageCircle size={18} /> Enviar Mensagem no WhatsApp
                    </a>
                </div>
            </section>
        </>
    );
};

export default ContactPage;
