import React, { useState } from 'react';
import { Gift, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BUSINESS_INFO } from '../../utils/constants';
import { sanitizeInput } from '../../utils/security';
import emailjs from '@emailjs/browser';

const GiftCards: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGiftCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name || !email || !phone) {
      alert("Por favor, preencha todos os campos para podermos preparar o seu voucher.");
      return;
    }

    setIsSubmitting(true);
    setStatus('loading');

    const now = new Date();
    const templateParams = {
      client_name: sanitizeInput(name),
      email: email, // Corrigido para bater certo com o template unificado
      phone: phone, // Corrigido para bater certo com o template unificado
      service: `Voucher de Oferta (€${amount})`,
      date: now.toLocaleDateString('pt-PT'),
      time: now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus('success');
      setIsSubmitting(false);
    } catch (error) {
      console.error("Erro ao enviar email do Voucher:", error);
      setStatus('error');
      setIsSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <section id="giftcards" className="py-32 bg-braz-black">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#171717] p-16 text-center shadow-2xl rounded-xl border-t-8 border-braz-pink"
          >
            <CheckCircle2 className="w-20 h-20 text-braz-pink mx-auto mb-6 animate-bounce" />
            <h2 className="text-4xl font-montserrat font-bold text-white uppercase mb-4 tracking-tight">Pedido Recebido!</h2>
            <p className="text-white/70 font-montserrat mb-8 text-lg leading-relaxed">
              O seu pedido de voucher foi gerado. <br />
              <p className="text-white/70 font-montserrat mb-8 text-lg leading-relaxed">O seu pedido de voucher foi registado com sucesso.<br /><strong>Enviámos um e-mail</strong> com os próximos passos.</p>
            </p>
            <button
              onClick={() => {
                setStatus('idle');
                setName('');
                setEmail('');
                setPhone('');
                setAmount(50);
              }}
              className="text-braz-pink font-montserrat font-bold uppercase tracking-widest hover:text-white transition-colors border border-braz-pink px-8 py-4 hover:bg-braz-pink hover:text-braz-black shadow-lg shadow-braz-pink/10"
            >
              Comprar Outro Voucher
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="giftcards" className="py-32 bg-braz-black">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-montserrat font-extrabold uppercase tracking-tighter mb-4 text-white">
            Cartões Presente
          </h2>
          <div className="w-20 h-1 bg-braz-pink mx-auto mb-6" />
          <p className="text-lg text-white/60 font-montserrat">Ofereça um momento de puro luxo e bem-estar.</p>
        </motion.div>

        <div className="bg-[#171717] p-8 md:p-12 rounded-xl shadow-2xl border border-white/5 grid lg:grid-cols-2 gap-12">

          {/* Lado Visual do Voucher */}
          <div className="relative flex flex-col justify-center items-center p-8 bg-braz-black rounded-2xl border border-braz-pink/20 shadow-inner">
            <Gift className="w-20 h-20 text-braz-pink mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest text-center">Voucher {BUSINESS_INFO.name}</h3>
            <p className="text-white/50 mb-8 text-center text-sm">O presente perfeito para quem merece excelência.</p>

            <div className="text-center p-6 bg-[#171717] rounded-xl w-full max-w-xs border border-white/5 shadow-2xl">
              <p className="text-xs uppercase text-white/40 tracking-[0.2em] mb-2">Valor do Mimo</p>
              <p className="text-5xl font-extrabold text-braz-pink">€{amount}</p>
              <p className="text-xs text-white/60 mt-1.5 font-medium">IVA incluído à taxa legal</p>
            </div>

            <div className="mt-8 text-[10px] text-white/20 uppercase tracking-widest">Digital Gift Card • Valid for 6 Months</div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleGiftCardSubmit} className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-3 flex items-center">
              <span className="w-2 h-2 bg-braz-pink rounded-full mr-3" />
              Personalizar Voucher
            </h3>

            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm text-center font-bold">
                Ocorreu um erro ao processar o seu pedido. Por favor, tente novamente.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="gc-name" className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Seu Nome</label>
                <input
                  id="gc-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3.5 bg-braz-black border border-white/10 rounded-lg text-white focus:border-braz-pink transition-all outline-none"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label htmlFor="gc-email" className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email de Envio</label>
                <input
                  id="gc-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3.5 bg-braz-black border border-white/10 rounded-lg text-white focus:border-braz-pink transition-all outline-none"
                  placeholder="exemplo@email.com"
                />
              </div>

              <div>
                <label htmlFor="gc-phone" className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Telemóvel</label>
                <input
                  id="gc-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 9))}
                  required
                  maxLength={9}
                  className="w-full p-3.5 bg-braz-black border border-white/10 rounded-lg text-white focus:border-braz-pink transition-all outline-none"
                  placeholder="912 345 678"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="gc-amount" className="block text-xs font-bold text-white/50 uppercase tracking-wider">Valor do Voucher</label>
                  <span className="text-braz-pink font-bold">€{amount}</span>
                </div>
                <input
                  id="gc-amount"
                  type="range"
                  min="25"
                  max="500"
                  step="25"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-braz-pink"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || status === 'loading'}
              className="w-full bg-braz-pink text-braz-black py-4 font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl shadow-braz-pink/10 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <><Loader2 className="animate-spin" size={20} /><span>A preparar...</span></>
              ) : (
                <><Gift className="w-5 h-5" /><span>Finalizar via WhatsApp</span></>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default GiftCards;