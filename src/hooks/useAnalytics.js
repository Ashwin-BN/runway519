import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { differenceInDays, format, subDays, eachDayOfInterval } from 'date-fns'

export function useAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*, item_photos(url)')

      if (itemsError) throw itemsError

      setData(processAnalytics(items ?? []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchAnalytics }
}

// ── All processing happens here, not in components
function processAnalytics(items) {
  // ── KPIs
  const totalItems = items.length
  const activeItems = items.filter((i) => i.status === 'active')
  const markdownItems = items.filter((i) => i.status === 'markdown')
  const soldItems = items.filter((i) => i.status === 'sold')
  const archivedItems = items.filter((i) => i.status === 'archived')

  const totalValue = activeItems.reduce((sum, i) => sum + Number(i.price), 0)
  const markdownValue = markdownItems.reduce(
    (sum, i) => sum + Number(i.markdown_price ?? i.price),
    0
  )
  const totalSavings = markdownItems.reduce((sum, i) => {
    return sum + (Number(i.price) - Number(i.markdown_price ?? i.price))
  }, 0)

  const avgPrice =
    totalItems > 0
      ? items.reduce((sum, i) => sum + Number(i.price), 0) / totalItems
      : 0

  const markdownRate =
    totalItems > 0 ? ((markdownItems.length / totalItems) * 100).toFixed(1) : 0

  const sellThroughRate =
    totalItems > 0 ? ((soldItems.length / totalItems) * 100).toFixed(1) : 0

  // ── Status breakdown (donut chart)
  const statusBreakdown = [
    { name: 'Active', value: activeItems.length, fill: '#22c55e' },
    { name: 'Markdown', value: markdownItems.length, fill: '#eab308' },
    { name: 'Sold', value: soldItems.length, fill: '#6b7280' },
    { name: 'Archived', value: archivedItems.length, fill: '#ef4444' },
  ].filter((s) => s.value > 0)

  // ── Items added last 14 days (line chart)
  const today = new Date()
  const fromDate = subDays(today, 13)
  const days = eachDayOfInterval({ start: fromDate, end: today })

  const itemsByDay = days.map((day) => {
    const label = format(day, 'MMM d')
    const count = items.filter((item) => {
      const created = new Date(item.created_at)
      return format(created, 'MMM d yyyy') === format(day, 'MMM d yyyy')
    }).length
    return { date: label, items: count }
  })

  // ── Top 8 brands by item count (bar chart)
  const brandMap = {}
  items.forEach((item) => {
    const brand = item.brand.trim()
    if (!brandMap[brand]) brandMap[brand] = { count: 0, value: 0 }
    brandMap[brand].count++
    brandMap[brand].value += Number(item.price)
  })

  const topBrands = Object.entries(brandMap)
    .map(([name, d]) => ({ name, count: d.count, value: d.value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // ── Department breakdown (bar chart)
  const deptMap = {}
  items.forEach((item) => {
    const dept = `Dept ${item.dept_code}`
    if (!deptMap[dept]) deptMap[dept] = { count: 0, value: 0 }
    deptMap[dept].count++
    deptMap[dept].value += Number(item.price)
  })

  const deptBreakdown = Object.entries(deptMap)
    .map(([name, d]) => ({ name, count: d.count, value: d.value }))
    .sort((a, b) => b.count - a.count)

  // ── Slow movers (active items sitting 30+ days)
  const slowMovers = items
    .filter((item) => {
      if (item.status !== 'active' && item.status !== 'markdown') return false
      const days = differenceInDays(new Date(), new Date(item.created_at))
      return days >= 30
    })
    .map((item) => ({
      ...item,
      daysOnFloor: differenceInDays(new Date(), new Date(item.created_at)),
    }))
    .sort((a, b) => b.daysOnFloor - a.daysOnFloor)
    .slice(0, 5)

  // ── Price distribution buckets
  const buckets = [
    { range: '$0–25', min: 0, max: 25 },
    { range: '$25–50', min: 25, max: 50 },
    { range: '$50–100', min: 50, max: 100 },
    { range: '$100–200', min: 100, max: 200 },
    { range: '$200–500', min: 200, max: 500 },
    { range: '$500+', min: 500, max: Infinity },
  ]

  const priceDistribution = buckets.map((bucket) => ({
    range: bucket.range,
    count: items.filter((item) => {
      const price = Number(item.price)
      return price >= bucket.min && price < bucket.max
    }).length,
  }))

  return {
    kpis: {
      totalItems,
      totalValue,
      markdownValue,
      totalSavings,
      avgPrice,
      markdownRate,
      sellThroughRate,
      activeCount: activeItems.length,
      markdownCount: markdownItems.length,
      soldCount: soldItems.length,
    },
    statusBreakdown,
    itemsByDay,
    topBrands,
    deptBreakdown,
    slowMovers,
    priceDistribution,
  }
}
