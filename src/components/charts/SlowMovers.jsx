import { formatPrice } from '../../constants/inventoryConstants'
import { useNavigate } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'

export default function SlowMovers({ items }) {
  const navigate = useNavigate()

  if (!items?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3
          className="text-sm font-semibold text-gray-700 mb-3 flex
                       items-center gap-2"
        >
          <Clock size={15} className="text-orange-500" />
          Slow Movers (30+ days)
        </h3>
        <p className="text-sm text-gray-400 text-center py-4">
          No slow movers 🎉 Everything is moving well
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3
        className="text-sm font-semibold text-gray-700 mb-3 flex
                     items-center gap-2"
      >
        <Clock size={15} className="text-orange-500" />
        Slow Movers
        <span className="ml-auto text-xs font-normal text-gray-400">
          Active 30+ days
        </span>
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/inventory/${item.id}`)}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50
                       cursor-pointer transition-colors group"
          >
            {/* Days badge */}
            <div
              className={`w-12 h-12 rounded-xl flex flex-col items-center
                             justify-center shrink-0 text-center
                             ${
                               item.daysOnFloor >= 60
                                 ? 'bg-red-100 text-red-600'
                                 : 'bg-orange-100 text-orange-600'
                             }`}
            >
              <span className="text-sm font-bold leading-none">
                {item.daysOnFloor}
              </span>
              <span className="text-[9px] font-medium">days</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {item.brand}
              </p>
              <p className="text-xs text-gray-400">
                #{item.style_number} · Dept {item.dept_code}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-bold text-gray-700">
                {formatPrice(item.markdown_price ?? item.price)}
              </p>
              <StatusBadge status={item.status} />
            </div>

            <ArrowRight
              size={14}
              className="text-gray-300 group-hover:text-pink-400
                         transition-colors shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
