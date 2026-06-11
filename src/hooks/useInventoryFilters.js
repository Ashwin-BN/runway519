import { useState, useMemo } from 'react'

const DEFAULT_FILTERS = {
  search: '',
  dept: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'newest',
}

export function useInventoryFilters(items = []) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilter(key) {
    setFilters((prev) => ({ ...prev, [key]: DEFAULT_FILTERS[key] }))
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS)
  }

  // ── Active filter chips (everything except search + sort)
  const activeFilters = useMemo(() => {
    const chips = []
    if (filters.dept) chips.push({ key: 'dept', label: `Dept ${filters.dept}` })
    if (filters.status)
      chips.push({
        key: 'status',
        label: filters.status.charAt(0).toUpperCase() + filters.status.slice(1),
      })
    if (filters.minPrice)
      chips.push({ key: 'minPrice', label: `Min $${filters.minPrice}` })
    if (filters.maxPrice)
      chips.push({ key: 'maxPrice', label: `Max $${filters.maxPrice}` })
    return chips
  }, [filters])

  // ── Apply filters + sort
  const filtered = useMemo(() => {
    let result = [...items]

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (item) =>
          item.brand.toLowerCase().includes(q) ||
          item.style_number.includes(q) ||
          item.dept_code.includes(q) ||
          item.category_code.includes(q)
      )
    }

    // Department
    if (filters.dept) {
      result = result.filter((item) => item.dept_code === filters.dept)
    }

    // Status
    if (filters.status) {
      result = result.filter((item) => item.status === filters.status)
    }

    // Price range — compare against markdown price if active, else original
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice)
      result = result.filter((item) => {
        const price = item.markdown_price ?? item.price
        return price >= min
      })
    }

    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice)
      result = result.filter((item) => {
        const price = item.markdown_price ?? item.price
        return price <= max
      })
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'price_asc':
        result.sort(
          (a, b) =>
            (a.markdown_price ?? a.price) - (b.markdown_price ?? b.price)
        )
        break
      case 'price_desc':
        result.sort(
          (a, b) =>
            (b.markdown_price ?? b.price) - (a.markdown_price ?? a.price)
        )
        break
      case 'brand_az':
        result.sort((a, b) => a.brand.localeCompare(b.brand))
        break
      case 'brand_za':
        result.sort((a, b) => b.brand.localeCompare(a.brand))
        break
    }

    return result
  }, [items, filters])

  return {
    filters,
    setFilter,
    clearFilter,
    clearAll,
    activeFilters,
    filtered,
    hasActiveFilters: activeFilters.length > 0,
  }
}
