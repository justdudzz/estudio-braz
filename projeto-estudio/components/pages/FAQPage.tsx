import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BUSINESS_INFO } from '../../utils/constants';

interface FAQItem { q: string; a: string; }
interface FAQCategory { name: string; items: FAQItem[]; }

const faqData: FAQCategory[] = [
    {
        name: '🧖‍♀️ Serviços & Tratamentos',
        items: [
            { q: 'Que serviços oferecem no Studio Braz?', a: 'Oferecemos Microblading, Limpeza de Pele, Unhas de Gel, Verniz Gel, Massagens, e Depilação (Laser, Cera e Linha). Conheça todos na nossa página de Serviços.' },
            { q: 'O Microblading dói?', a: 'É aplicado anestésico tópico para minimizar o desconforto. A maioria das clientes descreve a sensação como um leve arranhão. A sessão dura cerca de 2h30.' },
            { q: 'Quanto tempo dura o resultado do Microblading?', a: 'O resultado dura entre 12 a 18 meses, dependendo do tipo de pele e cuidados. Recomendamos um retoque após 30 dias para garantir o resultado perfeito.' },
            { q: 'As unhas de gel estragam as unhas naturais?', a: 'Não, desde que sejam aplicadas e removidas por uma profissional qualificada. No Studio Braz usamos técnicas e produtos que respeitam a saúde da unha natural.' },
            { q: 'A limpeza de pele é adequada para todos os tipos de pele?', a: 'Sim. Adaptamos o tratamento ao tipo de pele de cada cliente. Antes de iniciar, fazemos uma avaliação para personalizar o protocolo.' },
        ]
    },
    {
        name: '📅 Marcações & Cancelamentos',
        items: [
            { q: 'Como posso agendar uma marcação?', a: 'Pode agendar diretamente no nosso website na página de Marcações, ou contactar-nos via WhatsApp.' },
            { q: 'Posso cancelar ou reagendar a minha marcação?', a: 'Sim. Pedimos que nos avise com pelo menos 24 horas de antecedência para que possamos disponibilizar o horário a outra cliente.' },
            { q: 'Existe lista de espera?', a: 'Sim. Se o horário desejado não estiver disponível, pode contactar-nos via WhatsApp e ficará numa lista de espera prioritária.' },
        ]
    },
    {
        name: '💳 Pagamento & Preços',
        items: [
            { q: 'Que métodos de pagamento aceitam?', a: 'Aceitamos pagamento em dinheiro, MB Way, e transferência bancária. O pagamento é efetuado no dia do tratamento.' },
            { q: 'Os preços incluem IVA?', a: 'Sim, todos os preços apresentados no website já incluem IVA.' },
            { q: 'Oferecem cartões presente?', a: 'Sim! Temos cartões presente de vários valores. Pode encomendar diretamente no nosso website ou contactar-nos.' },
        ]
    },
    {
        name: '🏠 O Estúdio',
        items: [
            { q: 'Onde fica o Studio Braz?', a: `Estamos localizados em ${BUSINESS_INFO.address}. Temos estacionamento gratuito nas proximidades.` },
            { q: 'Qual é o horário de funcionamento?', a: 'Segunda a Sexta das 9:00 às 20:00, Sábado das 9:00 às 13:00. Domingo encerrado.' },
            { q: 'Grávidas podem fazer tratamentos?', a: 'Alguns tratamentos como massagens relaxantes são seguros. No entanto, tratamentos como Microblading e certos procedimentos faciais não são recomendados durante a gravidez. Consulte-nos para mais informação.' },
        ]
    },
];

const FAQPage: React.FC = () => {
    useEffect(() => { document.title = `Perguntas Frequentes | ${BUSINESS_INFO.name}`; }, []);
    const [openIdx, setOpenIdx] = useState<string | null>(null);

    const toggle = (id: string) => setOpenIdx(prev => prev === id ? null : id);

    return (
        <>
            {/* Hero */}
            <section className="pt-12 pb-16 bg-gradient-to-b from-[#0A0A0A] to-[#080808]">
                <div className="container mx-auto px-6 text-center">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] mb-3">Tire as Suas Dúvidas</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Perguntas Frequentes</motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/40 text-sm max-w-lg mx-auto">
                        Encontre respostas rápidas às dúvidas mais comuns. Se não encontrar o que procura, contacte-nos.
                    </motion.p>
                </div>
            </section>

            {/* FAQ Cards */}
            <section className="pb-24 bg-[#080808]">
                <div className="container mx-auto px-6 max-w-3xl">
                    {faqData.map((cat, catIdx) => (
                        <div key={catIdx} className="mb-8">
                            <h2 className="text-sm font-bold text-white mb-4">{cat.name}</h2>
                            <div className="space-y-2">
                                {cat.items.map((item, itemIdx) => {
                                    const id = `${catIdx}-${itemIdx}`;
                                    const isOpen = openIdx === id;
                                    return (
                                        <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: itemIdx * 0.03 }}
                                            className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
                                            <button onClick={() => toggle(id)} className="w-full flex items-center justify-between px-5 py-4 text-left group">
                                                <span className="text-sm text-white/80 font-semibold pr-4">{item.q}</span>
                                                <ChevronDown size={16} className={`text-white/20 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#C5A059]' : ''}`} />
                                            </button>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                                                        <div className="px-5 pb-4 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-3">{item.a}</div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Still have questions? */}
                    <div className="text-center mt-12 bg-[#121212] p-8 rounded-2xl border border-white/5">
                        <HelpCircle className="text-[#C5A059] mx-auto mb-3" size={24} />
                        <p className="text-white font-bold mb-2">Ainda tem dúvidas?</p>
                        <p className="text-white/40 text-sm mb-4">Estamos sempre disponíveis para ajudar.</p>
                        <Link to="/contacto" className="inline-flex items-center gap-2 bg-[#C5A059] text-black px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white transition-all">
                            Contactar
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default FAQPage;
