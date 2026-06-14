import { describe, it, expect } from 'vitest'
import { itemSchemaWithRefinement } from '../src/utils/itemSchema'

describe('Item Schema Validation', () => {
  const validItem = {
    brand: 'Calvin Klein',
    dept_code: '04',
    category_code: '1042',
    style_number: '123456',
    price: '49.99',
    markdown_price: '',
    status: 'active',
    notes: '',
  }

  // ── Brand
  it('accepts a valid brand name', () => {
    const result = itemSchemaWithRefinement.safeParse(validItem)
    expect(result.success).toBe(true)
  })

  it('rejects empty brand', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      brand: '',
    })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].path[0]).toBe('brand')
  })

  // ── Department code
  it('accepts 2-digit dept code', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      dept_code: '04',
    })
    expect(result.success).toBe(true)
  })

  it('rejects dept code with wrong length', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      dept_code: '4',
    })
    expect(result.success).toBe(false)
  })

  it('rejects dept code with letters', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      dept_code: 'AB',
    })
    expect(result.success).toBe(false)
  })

  // ── Category code
  it('accepts 4-digit category code', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      category_code: '1042',
    })
    expect(result.success).toBe(true)
  })

  it('rejects category code with wrong length', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      category_code: '104',
    })
    expect(result.success).toBe(false)
  })

  // ── Style number
  it('accepts 6-digit style number', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      style_number: '123456',
    })
    expect(result.success).toBe(true)
  })

  it('rejects style number with wrong length', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      style_number: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejects style number with letters', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      style_number: '12345A',
    })
    expect(result.success).toBe(false)
  })

  // ── Price
  it('accepts price ending in .99', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      price: '49.99',
    })
    expect(result.success).toBe(true)
  })

  it('rejects price ending in .00', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      price: '49.00',
    })
    expect(result.success).toBe(false)
  })

  it('rejects price ending in .50', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      price: '49.50',
    })
    expect(result.success).toBe(false)
  })

  // ── Markdown price
  it('accepts markdown price ending in .00', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      status: 'markdown',
      markdown_price: '39.00',
    })
    expect(result.success).toBe(true)
  })

  it('rejects markdown price ending in .99', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      status: 'markdown',
      markdown_price: '39.99',
    })
    expect(result.success).toBe(false)
  })

  it('requires markdown price when status is markdown', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      status: 'markdown',
      markdown_price: '',
    })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].path[0]).toBe('markdown_price')
  })

  it('rejects markdown price higher than original price', () => {
    const result = itemSchemaWithRefinement.safeParse({
      ...validItem,
      price: '49.99',
      status: 'markdown',
      markdown_price: '59.00',
    })
    expect(result.success).toBe(false)
  })
})
