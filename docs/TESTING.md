# Testing

Testing strategy, manual QA checklist, and unit test coverage for Runway-519.

---

## Testing Strategy

Runway-519 uses a two-layer testing approach:

| Layer           | Method              | Coverage                             |
| --------------- | ------------------- | ------------------------------------ |
| **Logic**       | Unit tests (Vitest) | Validation, formatting, filter logic |
| **Integration** | Manual QA checklist | All user-facing flows                |

UI component testing (React Testing Library) and end-to-end testing (Playwright)
are listed in the roadmap but not yet implemented.

---

## Unit Tests

### Setup

```bash
npm install -D vitest
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

---

### Test Files

#### `tests/itemSchema.test.js`

```javascript
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
```

---

#### `tests/inventoryConstants.test.js`

```javascript
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
```

---

#### `tests/useInventoryFilters.test.js`

```javascript
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
```

---

## Running Tests

```bash
# Run all tests once
npm run test:run

# Run in watch mode (re-runs on file save)
npm run test

# Run with visual UI
npm run test:ui
```

Expected output:

```
✓ tests/itemSchema.test.js           (18 tests)
✓ tests/inventoryConstants.test.js   (9 tests)
✓ tests/useInventoryFilters.test.js  (11 tests)

Test Files  3 passed (3)
Tests       38 passed (38)
```

---

## Manual QA Checklist

Run through this checklist before every deployment.

### Authentication

```
□ Sign up with new email → account created, logged in
□ Sign in with wrong password → error message shown
□ Sign out → redirected to /login
□ Visit /inventory without session → redirected to /login
□ Suspended user login → sees suspension screen
□ Token expiry → redirected to /login gracefully
```

### Add Item

```
□ Submit with all fields empty → validation errors shown
□ Dept code with 1 digit → error
□ Category code with 3 digits → error
□ Style number with 5 digits → error
□ Price ending in .50 → error
□ Price ending in .99 → accepted
□ Status = Markdown, no markdown price → error
□ Markdown price higher than original → error
□ Markdown price ending in .99 → error
□ Markdown price ending in .00, lower than original → accepted
□ Add item with 0 photos → succeeds
□ Add item with 4 photos → succeeds
□ Take photo button → opens camera on mobile
□ Gallery button → opens photo picker on mobile
□ Photos compressed (check Supabase Storage file sizes)
□ Item appears in inventory list after submit
□ Toast "Item added successfully" appears
□ History log shows "created" entry
```

### Edit Item

```
□ Edit button visible to Markdown+ roles
□ Edit button hidden from Associates
□ Form pre-fills with existing data
□ Photos load correctly
□ Save changes → toast shown, redirected to detail
□ History log shows "updated" entry
```

### Delete Item

```
□ Delete button visible to Admins only
□ Confirmation modal appears centered on mobile and desktop
□ Cancel → item not deleted
□ Confirm → item removed from inventory list
□ Photos removed from Supabase Storage
□ Cannot navigate back to deleted item
```

### Search & Filter

```
□ Search by brand → filters in real time
□ Search by style number → works
□ Search by dept code → works
□ Filter by dept → only that dept shown
□ Filter by status Active → only active items
□ Filter by status Markdown → only markdown items
□ Min price filter → items below excluded
□ Max price filter → items above excluded
□ Active filter chips appear
□ Chip × removes that filter only
□ Clear All → all items shown, all chips gone
□ Sort newest first → most recent at top
□ Sort price low to high → correct order
□ Sort brand A-Z → alphabetical
□ "Showing X of Y items" updates correctly
□ No results → empty state with "Clear filters" link
```

### Bulk Actions

```
□ Select button visible to Markdown+ roles
□ Select button hidden from Associates
□ Tap Select → checkboxes appear on cards
□ Tap a card → selects it, highlights pink/teal
□ Tap again → deselects
□ Select All → all visible items selected
□ Change Status → all selected items updated
□ Count in bulk bar matches selection
□ Done → exits bulk mode, checkboxes gone
```

### Item Detail

```
□ All item data displays correctly
□ Multiple photos → arrows navigate between them
□ Dot indicators update on photo change
□ Thumbnails click to change photo
□ Markdown price shown in yellow
□ "You Save" amount correct
□ Notes section shows if present, hidden if empty
□ Activity history shows all changes
□ Created at date and added-by name correct
```

### Analytics

```
□ KPI cards show correct values
□ Total value = sum of active item prices
□ Markdown rate % is correct
□ Donut chart renders with correct segments
□ Line chart shows last 14 days
□ No data for a day → shows 0 (not broken)
□ Top brands bar chart correct order
□ Department breakdown correct
□ Price distribution buckets correct
□ Slow movers shows items 30+ days old
□ Slow mover card click → goes to item detail
□ Refresh button reloads all data
```

### Admin — Users

```
□ /users redirects Associates, Markdown users, Supervisors
□ Admin can access /users
□ All registered users appear in list
□ Stats row counts correct
□ Search by name → filters list
□ Search by email → filters list
□ "You" badge on own account
□ No action buttons on own account
□ Change role → updates badge immediately
□ Suspend → card greys, Suspended badge appears
□ Reactivate → card back to normal
□ Roles info panel shows correct permissions
```

### PWA & Mobile

```
□ Install prompt appears on mobile browser
□ Installs to home screen
□ Opens fullscreen (no browser bar)
□ Pink/teal theme in status bar
□ Bottom nav visible and functional
□ Bottom nav not covered by phone home indicator
□ Pull down on inventory → refreshes
□ Works offline (cached pages load)
□ New item offline → fails gracefully with error
```

### Dark / Light Mode

```
□ Toggle switches mode
□ All pages update correctly in dark mode
□ All pages update correctly in light mode
□ Preference saved — persists after refresh
□ Input fields readable in dark mode
□ Buttons use teal in both modes
□ Bottom nav visible in both modes
□ No text color flicker on switch
□ Scrollbar same size in both modes
```
