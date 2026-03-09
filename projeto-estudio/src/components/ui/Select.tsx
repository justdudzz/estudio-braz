import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  id: string
  options: { value: string; label: string }[]
  error?: string
  className?: string
}

const Select: React.FC<SelectProps> = ({ label, id, options, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col space-y-2">
      {label && (
        <label htmlFor={id} className="text-white text-lg font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`block w-full px-5 py-3 bg-braz-charcoal border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-braz-gold transition-all duration-300 text-[16px] ${error ? 'border-red-500' : ''
            } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default Select
