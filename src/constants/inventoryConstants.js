// ─────────────────────────────────────────────
// Winners Department Codes
// ─────────────────────────────────────────────
export const DEPARTMENTS = [
  { code: '01', label: "01 — Women's Comtemporary" },
  { code: '02', label: '02 — Runway' },
  { code: '23', label: "23 — Men's Comtemporary" },
  { code: '04', label: "04 — Men's Sportswear" },
  { code: '06', label: "06 — Children's" },
  { code: '08', label: '08 — Footwear' },
  { code: '09', label: '09 — Handbags' },
  { code: '11', label: '11 — Accessories' },
  { code: '14', label: '14 — Intimate Apparel' },
  { code: '16', label: '16 — Outerwear' },
  { code: '22', label: '22 — Home Textiles' },
  { code: '24', label: '24 — Housewares' },
  { code: '30', label: '30 — Beauty' },
  { code: '50', label: '50 — Luggage' },
]

// ─────────────────────────────────────────────
// Item Status Lifecycle
// ─────────────────────────────────────────────
export const ITEM_STATUSES = {
  ACTIVE: 'active',
  MARKDOWN: 'markdown',
  SOLD: 'sold',
  ARCHIVED: 'archived',
}

export const STATUS_LABELS = {
  active: 'Active',
  markdown: 'Markdown',
  sold: 'Sold',
  archived: 'Archived',
}

export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  markdown: 'bg-yellow-100 text-yellow-700',
  sold: 'bg-gray-100 text-gray-500',
  archived: 'bg-red-100 text-red-500',
}

// ─────────────────────────────────────────────
// Validation Rules (used in form + zod schema)
// ─────────────────────────────────────────────
export const VALIDATION = {
  DEPT_CODE: /^\d{2}$/, // exactly 2 digits
  CATEGORY: /^\d{4}$/, // exactly 4 digits
  STYLE_NUMBER: /^\d{6}$/, // exactly 6 digits
  PRICE_ACTIVE: /^\d+\.99$/, // any amount ending in .99
  PRICE_MARKDOWN: /^\d+\.00$/, // any amount ending in .00
}

// ─────────────────────────────────────────────
// Price Helpers
// ─────────────────────────────────────────────

// Formats a number to always end in .99
export function toActivePrice(value) {
  const base = Math.floor(parseFloat(value))
  return `${base}.99`
}

// Formats a number to always end in .00
export function toMarkdownPrice(value) {
  const base = Math.floor(parseFloat(value))
  return `${base}.00`
}

// Display helper → "$49.99"
export function formatPrice(value) {
  return `$${parseFloat(value).toFixed(2)}`
}
