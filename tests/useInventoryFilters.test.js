import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInventoryFilters } from '../src/hooks/useInventoryFilters'

const mockItems = [
  {
    id: '1',
    brand: 'Calvin Klein',
    dept_code: '04',
    category_code: '1042',
    style_number: '111111',
    price: 49.99,
    markdown_price: null,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    brand: 'Ralph Lauren',
    dept_code: '16',
    category_code: '2010',
    style_number: '222222',
    price: 129.99,
    markdown_price: 89.0,
    status: 'markdown',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    brand: 'Calvin Klein',
    dept_code: '04',
    category_code: '1099',
    style_number: '333333',
    price: 79.99,
    markdown_price: null,
    status: 'sold',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

describe('useInventoryFilters', () => {
  it('returns all items with no filters', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    expect(result.current.filtered.length).toBe(3)
  })

  it('filters by search term on brand', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    act(() => result.current.setFilter('search', 'calvin'))
    expect(result.current.filtered.length).toBe(2)
    expect(
      result.current.filtered.every((i) => i.brand.includes('Calvin'))
    ).toBe(true)
  })

  it('filters by department code', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    act(() => result.current.setFilter('dept', '16'))
    expect(result.current.filtered.length).toBe(1)
    expect(result.current.filtered[0].brand).toBe('Ralph Lauren')
  })

  it('filters by status', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    act(() => result.current.setFilter('status', 'active'))
    expect(result.current.filtered.length).toBe(1)
    expect(result.current.filtered[0].id).toBe('1')
  })

  it('filters by min price', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    act(() => result.current.setFilter('minPrice', '80'))
    // Only ralph lauren at $89 markdown price qualifies
    expect(result.current.filtered.length).toBe(1)
  })

  it('filters by max price', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    act(() => result.current.setFilter('maxPrice', '60'))
    expect(result.current.filtered.length).toBe(1)
    expect(result.current.filtered[0].price).toBe(49.99)
  })

  it('clears a specific filter', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    act(() => result.current.setFilter('status', 'active'))
    expect(result.current.filtered.length).toBe(1)
    act(() => result.current.clearFilter('status'))
    expect(result.current.filtered.length).toBe(3)
  })

  it('clears all filters', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    act(() => {
      result.current.setFilter('status', 'active')
      result.current.setFilter('dept', '04')
    })
    expect(result.current.filtered.length).toBe(1)
    act(() => result.current.clearAll())
    expect(result.current.filtered.length).toBe(3)
  })

  it('tracks active filter chips', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    act(() => {
      result.current.setFilter('dept', '04')
      result.current.setFilter('status', 'active')
    })
    expect(result.current.activeFilters.length).toBe(2)
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('sorts by price ascending', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    act(() => result.current.setFilter('sortBy', 'price_asc'))
    const prices = result.current.filtered.map(
      (i) => i.markdown_price ?? i.price
    )
    expect(prices[0]).toBeLessThanOrEqual(prices[1])
    expect(prices[1]).toBeLessThanOrEqual(prices[2])
  })

  it('sorts by brand A-Z', () => {
    const { result } = renderHook(() => useInventoryFilters(mockItems))
    act(() => result.current.setFilter('sortBy', 'brand_az'))
    const brands = result.current.filtered.map((i) => i.brand)
    expect(brands[0] <= brands[1]).toBe(true)
  })
})
