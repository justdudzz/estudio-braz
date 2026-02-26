import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
          className="fixed bottom-8 right-8 z-50 bg-red-600/80 backdrop-blur-sm text-pure-white p-5 rounded-xl shadow-lg-subtle flex items-center space-x-4 border border-red-700"
          role="alert"
          aria-live="polite"
        >
          <WifiOff className="w-7 h-7 text-pure-white" aria-hidden="true" />
          <div>
            <p className="font-semibold text-lg">Ligação instável</p>
            <p className="text-md text-text-secondary">O seu progresso está guardado.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NetworkStatus
