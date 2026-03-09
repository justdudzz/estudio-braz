import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, RefreshCcw, Scale, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { BUSINESS_INFO } from '../../utils/constants';

const TermsAndConditions: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-braz-black pt-32 pb-20 font-montserrat">
      <Helmet>
        <title>Termos e Condições | {BUSINESS_INFO.name}</title>
      </Helmet>

      <div className="container mx-auto px-6 max-w-4xl">
        <motion.header 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 border-b border-braz-gold/30 pb-6"
        >
          <FileText className="w-16 h-16 text-braz-gold mx-auto mb-4" />
          <h1 className="text-5xl font-extrabold text-white uppercase tracking-tighter">Termos e Condições</h1>
        </motion.header>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="bg-[#171717] p-8 md:p-12 rounded-2xl border border-white/5 text-white/80 space-y-10 leading-relaxed"
        >
          <section>
            <h2 className="text-xl font-bold text-braz-gold mb-4 flex items-center">
              <RefreshCcw className="mr-3" size={20} /> 1. Direito de Livre Resolução (Devoluções)
            </h2>
            <p>
              Em conformidade com o Decreto-Lei n.º 24/2014, o consumidor tem o direito de resolver o contrato (cancelar a compra de Vouchers) no prazo de <strong>14 dias seguidos</strong>, sem necessidade de indicar o motivo, desde que o voucher não tenha sido ainda usufruído.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-braz-gold mb-4 flex items-center">
              <ShieldCheck className="mr-3" size={20} /> 2. Garantia de Conformidade
            </h2>
            <p>
              Nos termos do Decreto-Lei n.º 84/2021, os bens e serviços prestados gozam de uma garantia de conformidade de <strong>3 anos</strong>. Qualquer desconformidade deve ser comunicada ao Estúdio para a respetiva correção.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-braz-gold mb-4 flex items-center">
              <Scale className="mr-3" size={20} /> 3. Preços e IVA
            </h2>
            <p>
              O {BUSINESS_INFO.name} está <strong>isento de IVA ao abrigo do Artigo 53.º do CIVA</strong>. Os preços apresentados no site são os valores finais. As faturas/recibos são emitidos após a prestação do serviço.
            </p>
          </section>

          {/* NOVA SECÇÃO: VALIDADE DOS VOUCHERS */}
          <section>
            <h2 className="text-xl font-bold text-braz-gold mb-4 flex items-center">
              <Clock className="mr-3" size={20} /> 4. Validade e Utilização de Vouchers
            </h2>
            <p>
              Os Vouchers de Oferta adquiridos através do site têm uma <strong>validade de 6 meses</strong> a contar da data de emissão, com um valor máximo de <strong>200€</strong>. 
              Findo este prazo, o voucher expira automaticamente sem direito a reembolso. 
              O cartão é <strong>físico</strong> e deve ser levantado presencialmente no Studio Braz em Águeda.
              A utilização do voucher está sujeita a marcação prévia e disponibilidade de agenda.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
