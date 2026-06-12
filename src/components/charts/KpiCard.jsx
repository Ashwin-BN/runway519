export default function KpiCard({
  label,
  value,
  sub,
  icon,
  color = 'pink',
  trend,
}) {
  const colors = {
    pink: 'bg-pink-50 text-pink-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-gray-500 leading-tight">
          {label}
        </p>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center
                         shrink-0 ${colors[color]}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 leading-none mb-1">
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {trend !== undefined && (
        <p
          className={`text-xs font-medium mt-1
                       ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}
        >
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
        </p>
      )}
    </div>
  )
}
