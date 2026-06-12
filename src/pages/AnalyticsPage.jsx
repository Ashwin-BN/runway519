import { useEffect } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import KpiCard from '../components/charts/KpiCard'
import SlowMovers from '../components/charts/SlowMovers'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Package,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Tag,
  ShoppingBag,
  BarChart2,
  RefreshCw,
} from 'lucide-react'

export default function AnalyticsPage() {
  const { data, loading, error, fetchAnalytics } = useAnalytics()

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div
            className="w-8 h-8 border-4 border-pink-500 border-t-transparent
                          rounded-full animate-spin mx-auto mb-2"
          />
          <p className="text-xs text-gray-400">Crunching numbers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 rounded-2xl p-6
                      text-center"
      >
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-3 text-sm text-red-500 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) return null

  const {
    kpis,
    statusBreakdown,
    itemsByDay,
    topBrands,
    deptBreakdown,
    slowMovers,
    priceDistribution,
  } = data

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Live inventory insights
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100
                     hover:bg-gray-200 rounded-xl text-sm text-gray-600
                     font-medium transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="Total Inventory Value"
          value={`$${kpis.totalValue.toLocaleString('en-CA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          sub={`${kpis.activeCount} active items`}
          icon={<DollarSign size={16} />}
          color="green"
        />
        <KpiCard
          label="Total Items"
          value={kpis.totalItems.toLocaleString()}
          sub={`${kpis.soldCount} sold`}
          icon={<Package size={16} />}
          color="blue"
        />
        <KpiCard
          label="Markdown Rate"
          value={`${kpis.markdownRate}%`}
          sub={`${kpis.markdownCount} items marked down`}
          icon={<TrendingDown size={16} />}
          color="yellow"
        />
        <KpiCard
          label="Avg Item Price"
          value={`$${kpis.avgPrice.toFixed(2)}`}
          sub={`Sell-through ${kpis.sellThroughRate}%`}
          icon={<Tag size={16} />}
          color="pink"
        />
        <KpiCard
          label="Markdown Floor Value"
          value={`$${kpis.markdownValue.toLocaleString('en-CA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          sub="Current markdown inventory"
          icon={<ShoppingBag size={16} />}
          color="purple"
        />
        <KpiCard
          label="Total Customer Savings"
          value={`$${kpis.totalSavings.toLocaleString('en-CA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          sub="Across all markdowns"
          icon={<TrendingUp size={16} />}
          color="green"
        />
      </div>

      {/* Status Breakdown — Donut */}
      {statusBreakdown.length > 0 && (
        <ChartCard title="Inventory Status" icon={<BarChart2 size={15} />}>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} items`]} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {statusBreakdown.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.fill }}
                  />
                  <span className="text-xs text-gray-600 flex-1">{s.name}</span>
                  <span className="text-xs font-bold text-gray-800">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      )}

      {/* Items added over time — Line */}
      <ChartCard title="Items Added (Last 14 Days)">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={itemsByDay}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="items"
              stroke="#ec4899"
              strokeWidth={2.5}
              dot={{ fill: '#ec4899', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Top Brands — Bar */}
      {topBrands.length > 0 && (
        <ChartCard title="Top Brands by Volume">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={topBrands}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  fontSize: '12px',
                }}
                formatter={(v) => [`${v} items`]}
              />
              <Bar dataKey="count" fill="#ec4899" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Department Breakdown — Bar */}
      {deptBreakdown.length > 0 && (
        <ChartCard title="Items by Department">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={deptBreakdown}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  fontSize: '12px',
                }}
                formatter={(v) => [`${v} items`]}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Price Distribution — Bar */}
      <ChartCard title="Price Distribution">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={priceDistribution}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                fontSize: '12px',
              }}
              formatter={(v) => [`${v} items`]}
            />
            <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Slow Movers */}
      <SlowMovers items={slowMovers} />

      {/* Bottom padding for mobile nav */}
      <div className="h-4" />
    </div>
  )
}

// ── Reusable chart wrapper card
function ChartCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {title && (
        <h3
          className="text-sm font-semibold text-gray-700 mb-4 flex
                       items-center gap-2"
        >
          {icon}
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
