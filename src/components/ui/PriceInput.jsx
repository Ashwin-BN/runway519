import { forwardRef, useState } from 'react'

// type: 'active' → enforces .99 | 'markdown' → enforces .00
const PriceInput = forwardRef(function PriceInput(
  { label, error, type = 'active', onChange, value, ...props },
  ref
) {
  const suffix = type === 'active' ? '.99' : '.00'
  const placeholder = type === 'active' ? '49.99' : '39.00'
  const hint =
    type === 'active'
      ? 'Original price — must end in .99'
      : 'Markdown price — must end in .00'

  // Strip cents and re-apply the correct suffix on blur
  function handleBlur(e) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (raw) {
      const formatted = `${parseInt(raw, 10)}${suffix}`
      onChange({ target: { value: formatted } })
    }
  }

  // Only allow digits and one decimal point while typing
  function handleChange(e) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    onChange({ target: { value: raw } })
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 
                         text-gray-400 font-medium text-sm"
        >
          $
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full pl-7 pr-16 py-2.5 border rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-pink-400
                      transition-colors
                      ${
                        error
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
          {...props}
        />
        <span
          className={`absolute right-3 top-1/2 -translate-y-1/2 
                          text-xs font-semibold px-1.5 py-0.5 rounded
                          ${
                            type === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
        >
          {suffix}
        </span>
      </div>
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
    </div>
  )
})

export default PriceInput
