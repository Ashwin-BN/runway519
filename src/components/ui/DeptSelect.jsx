import { DEPARTMENTS } from '../../constants/inventoryConstants'
import { forwardRef } from 'react'

const DeptSelect = forwardRef(function DeptSelect(
  { label, error, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label ?? 'Department'}
      </label>
      <select
        ref={ref}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-pink-400
                    bg-white transition-colors
                    ${
                      error
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
        {...props}
      >
        <option value="">Select department...</option>
        {DEPARTMENTS.map((dept) => (
          <option key={dept.code} value={dept.code}>
            {dept.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

export default DeptSelect
