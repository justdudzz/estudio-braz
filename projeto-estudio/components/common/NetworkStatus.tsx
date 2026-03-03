// components/common/NetworkStatus.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react'; // Trocámos CloudSync por RefreshCw
import { getPendingBookings, clearPendingBookings } from '../../utils/offlineStorage';
import api from '../../src/services/api'; // Importamos a nossa API privada

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const pending = await getPendingBookings();
      if (pending.length > 0) {
        setIsSyncing(true);
        try {
          // Processar fila de agendamentos feitos enquanto estava offline
          for (const booking of pending) {
            // Agora enviamos diretamente para o seu servidor (Porta 5000)
            await api.post('/bookings', booking);
          }
          await clearPendingBookings();
          console.log("✅ Sincronização concluída com sucesso.");
        } catch (error) {
          console.error("❌ Falha na sincronização pós-conexão:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {/* Aviso de Offline */}
      {!isOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 z-50 bg-[#0A0A0A]/90 backdrop-blur-md text-white p-5 rounded-xl border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center space-x-4"
        >
          <WifiOff className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-bold text-sm tracking-widest uppercase text-red-400 text-[10px]">Ligação Perdida</p>
            <p className="text-[10px] text-white/60 mt-1 uppercase font-bold">Modo Offline Ativo. Agendamentos guardados localmente.</p>
          </div>
        </motion.div>
      )}

      {/* Aviso de Sincronização */}
      {isOnline && isSyncing && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 z-50 bg-[#0A0A0A]/90 backdrop-blur-md text-white p-5 rounded-xl border border-braz-pink/50 shadow-[0_0_30px_rgba(197,160,89,0.2)] flex items-center space-x-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <RefreshCw className="w-6 h-6 text-braz-pink" />
          </motion.div>
          <div>
            <p className="font-bold text-[10px] tracking-widest uppercase text-braz-pink">A Sincronizar</p>
            <p className="text-[10px] text-white/60 mt-1 uppercase font-bold">A enviar dados para o servidor...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatus;