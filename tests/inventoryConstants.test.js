import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  toActivePrice,
  toMarkdownPrice,
  DEPARTMENTS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../src/constants/inventoryConstants'

describe('formatPrice', () => {
  it('formats a number to dollar string', () => {
    expect(formatPrice(49.99)).toBe('$49.99')
  })

  it('formats a whole number with .00', () => {
    expect(formatPrice(39)).toBe('$39.00')
  })

  it('formats a string number', () => {
    expect(formatPrice('29.99')).toBe('$29.99')
  })
})

describe('toActivePrice', () => {
  it('converts whole number to .99 price', () => {
    expect(toActivePrice(49)).toBe('49.99')
  })

  it('strips existing cents and applies .99', () => {
    expect(toActivePrice(49.5)).toBe('49.99')
  })
})

describe('toMarkdownPrice', () => {
  it('converts whole number to .00 price', () => {
    expect(toMarkdownPrice(39)).toBe('39.00')
  })

  it('strips existing cents and applies .00', () => {
    expect(toMarkdownPrice(39.99)).toBe('39.00')
  })
})

describe('DEPARTMENTS', () => {
  it('has entries with code and label', () => {
    expect(DEPARTMENTS.length).toBeGreaterThan(0)
    DEPARTMENTS.forEach((dept) => {
      expect(dept).toHaveProperty('code')
      expect(dept).toHaveProperty('label')
      expect(dept.code).toMatch(/^\d{2}$/)
    })
  })
})

describe('STATUS_COLORS and STATUS_LABELS', () => {
  const statuses = ['active', 'markdown', 'sold', 'archived']

  it('has color for every status', () => {
    statuses.forEach((s) => {
      expect(STATUS_COLORS[s]).toBeDefined()
    })
  })

  it('has label for every status', () => {
    statuses.forEach((s) => {
      expect(STATUS_LABELS[s]).toBeDefined()
    })
  })
})
