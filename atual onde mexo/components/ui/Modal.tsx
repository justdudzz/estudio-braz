import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent scrolling when modal is open
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-deep-black bg-opacity-80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            className={`relative bg-surface-dark rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-auto border border-border-dark ${className}`}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 id="modal-title" className="text-3xl font-bold text-pure-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-pastel-pink transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pastel-pink rounded-full p-2"
                aria-label="Fechar modal"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            <div className="text-pure-white text-lg">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal
