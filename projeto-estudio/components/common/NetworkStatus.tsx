// components/common/NetworkStatus.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, CloudSync } from 'lucide-react';
import { getPendingBookings, clearPendingBookings } from '../../utils/offlineStorage';

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
          // Processar fila de requisições acumuladas em background
          for (const booking of pending) {
            await fetch('/.netlify/functions/schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(booking),
            });
          }
          await clearPendingBookings();
        } catch (error) {
          console.error("Falha na sincronização pós-conexão:", error);
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
      {!isOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 z-50 bg-[#0A0A0A]/90 backdrop-blur-md text-white p-5 rounded-xl border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center space-x-4"
        >
          <WifiOff className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-bold text-sm tracking-widest uppercase text-red-400">Ligação Perdida</p>
            <p className="text-xs text-white/60 mt-1">Modo Offline Ativo. Acionámos o cofre de dados local.</p>
          </div>
        </motion.div>
      )}
      {isOnline && isSyncing && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 z-50 bg-[#0A0A0A]/90 backdrop-blur-md text-white p-5 rounded-xl border border-braz-pink/50 shadow-[0_0_30px_rgba(197,160,89,0.2)] flex items-center space-x-4"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <CloudSync className="w-6 h-6 text-braz-pink" />
          </motion.div>
          <div>
            <p className="font-bold text-sm tracking-widest uppercase text-braz-pink">A Sincronizar</p>
            <p className="text-xs text-white/60 mt-1">A enviar agendamentos pendentes...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatus;