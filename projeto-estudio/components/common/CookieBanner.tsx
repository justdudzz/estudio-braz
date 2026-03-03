import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import { initializeScriptsByConsent } from '../../utils/externalScripts';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Estado para as preferências detalhadas
  const [preferences, setPreferences] = useState({
    essential: true,   // Sempre verdadeiro
    analytics: true,
    marketing: false
  });

  const navigate = useNavigate();
  const cookieConsentKey = 'braz_cookies_preferences';

  useEffect(() => {
    const savedPreferences = localStorage.getItem(cookieConsentKey);
    if (!savedPreferences) {
      // Atraso de 2 segundos para não sobrecarregar o utilizador mal entra
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: typeof preferences) => {
    localStorage.setItem(cookieConsentKey, JSON.stringify(prefs));
    setIsVisible(false);
    setShowConfig(false);

    // 2. ATIVAÇÃO IMEDIATA: Chama a inicialização logo após guardar
    initializeScriptsByConsent();
  };

  const handleAcceptAll = () => {
    const allIn = { essential: true, analytics: true, marketing: true };
    savePreferences(allIn);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-[#050505] text-white py-6 px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border-t border-braz-gold/20 font-montserrat"
            role="alert"
            aria-live="polite"
          >
            <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4 flex-1 max-w-3xl text-center lg:text-left">
                <ShieldAlert className="w-8 h-8 text-braz-pink hidden md:block flex-shrink-0" />
                <p className="text-sm text-white/80 leading-relaxed">
                  Utilizamos cookies para personalizar a sua experiência, analisar tráfego e oferecer conteúdo relevante.
                  Pode configurar as suas preferências ou aceitar todas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-6 py-3 border border-braz-pink/50 text-white/70 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all duration-300"
                >
                  Configurar Opcionais
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-8 py-3 bg-braz-pink text-braz-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-lg shadow-braz-pink/20 active:scale-95"
                >
                  Aceitar Tudo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Configuração de Cookies */}
      <Modal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        title="Definições de Cookies"
      >
        <div className="space-y-6 py-2">
          {/* Essenciais - sempre ativos */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-bold text-white">Necessários</p>
              <p className="text-xs text-white/50">Essenciais para o funcionamento do site.</p>
            </div>
            <Check className="text-braz-pink w-5 h-5" />
          </div>

          {/* Estatísticas / Analytics */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-bold text-white">Estatísticas</p>
              <p className="text-xs text-white/50">Ajudam-nos a melhorar a experiência e analisar o tráfego.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={e => setPreferences({ ...preferences, analytics: e.target.checked })}
              className="w-5 h-5 accent-braz-pink cursor-pointer"
            />
          </div>

          {/* Marketing */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-bold text-white">Marketing</p>
              <p className="text-xs text-white/50">Para ofertas personalizadas e publicidade relevante.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={e => setPreferences({ ...preferences, marketing: e.target.checked })}
              className="w-5 h-5 accent-braz-pink cursor-pointer"
            />
          </div>

          <button
            onClick={() => savePreferences(preferences)}
            className="w-full py-4 bg-braz-pink text-braz-black font-bold uppercase text-xs tracking-widest hover:bg-white transition-all duration-300 shadow-lg shadow-braz-pink/20"
          >
            Guardar Preferências
          </button>
        </div>
      </Modal>
    </>
  );
};

export default CookieBanner;