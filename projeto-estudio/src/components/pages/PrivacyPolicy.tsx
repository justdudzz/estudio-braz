import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { BUSINESS_INFO } from '../../utils/constants';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-braz-black pt-32 pb-20 font-montserrat">
      <Helmet>
        <title>Política de Privacidade | {BUSINESS_INFO.name}</title>
        <meta name="description" content="Saiba como o Estúdio Braz protege os seus dados pessoais em conformidade com o RGPD." />
      </Helmet>

      <div className="container mx-auto px-6 max-w-4xl">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 border-b border-braz-gold/30 pb-6"
        >
          <ShieldCheck className="w-16 h-16 text-braz-gold mx-auto mb-4" />
          <h1 className="text-5xl font-extrabold text-white uppercase tracking-tighter">Privacidade e RGPD</h1>
          <p className="text-lg text-white/60 mt-2">A sua confiança é a base dos nossos serviços.</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#171717] p-8 md:p-12 rounded-2xl shadow-2xl border border-white/5 text-white/80 space-y-10 leading-relaxed"
        >
          <section>
            <h2 className="text-2xl font-bold text-braz-gold mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-braz-gold mr-3 rounded-full" />
              1. Responsável pelo Tratamento
            </h2>
            <p>
              O <strong className="text-white">{BUSINESS_INFO.name}</strong>, representado por <strong className="text-white">Mariana Isabel Braz Teixeira</strong>, NIF {BUSINESS_INFO.nif}, com sede em {BUSINESS_INFO.address}, é a entidade responsável pela recolha e tratamento dos seus dados pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-braz-gold mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-braz-gold mr-3 rounded-full" />
              2. Dados e Finalidades
            </h2>
            <p className="mb-4">Recolhemos apenas os dados estritamente necessários para:</p>
            <ul className="space-y-3 list-disc list-inside ml-4">
              <li><strong className="text-white">Gestão de Agendamentos:</strong> Nome e telemóvel para marcação e confirmação de serviços.</li>
              <li><strong className="text-white">Comunicações de Marketing:</strong> Email (apenas com o seu consentimento explícito).</li>
              <li><strong className="text-white">Obrigações Legais:</strong> Dados de faturação para cumprimento fiscal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-braz-gold mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-braz-gold mr-3 rounded-full" />
              3. Os Seus Direitos (RGPD)
            </h2>
            <p className="mb-4">Nos termos da legislação europeia, tem o direito de:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white/5 p-6 rounded-xl border border-white/5">
              <p>• Acesso e retificação dos dados</p>
              <p>• Apagamento ("Direito ao esquecimento")</p>
              <p>• Limitação ou oposição ao tratamento</p>
              <p>• Portabilidade dos dados</p>
            </div>

            {/* CORREÇÃO AQUI: Link mailto adicionado */}
            <p className="mt-4">
              Para exercer estes direitos, contacte-nos através do email{' '}
              <motion.a
                whileTap={{ scale: 0.98 }}
                href={`mailto:${BUSINESS_INFO.email}`}
                className="inline-block text-braz-gold font-bold hover:underline transition-colors"
              >
                {BUSINESS_INFO.email}
              </motion.a>.
            </p>
          </section>

          <section className="pt-8 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Reclamações</h2>
            <p className="text-sm">
              Caso considere que o tratamento dos seus dados viola o RGPD, tem o direito de apresentar reclamação à autoridade de controlo em Portugal:
            </p>
            <motion.a
              whileTap={{ x: 3 }}
              href="https://www.cnpd.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-braz-gold hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              Comissão Nacional de Proteção de Dados (CNPD) <ExternalLink size={14} className="ml-2" />
            </motion.a>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
