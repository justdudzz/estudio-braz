import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  id: string
  error?: string
  className?: string
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col space-y-2">
      {label && (
        <label htmlFor={id} className="text-pure-white text-lg font-medium">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={`w-full px-5 py-3 bg-braz-charcoal border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-braz-gold transition-all duration-300 text-[16px] ${error ? 'border-red-500' : ''
          } ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default Textarea
