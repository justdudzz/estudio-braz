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
        className={`w-full px-5 py-3 bg-surface-dark border border-border-dark rounded-xl text-pure-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-pastel-pink transition-all duration-300 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default Textarea
