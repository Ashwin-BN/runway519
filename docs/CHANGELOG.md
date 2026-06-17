# Changelog

All notable changes to Runway-519 are documented here.

---

## v1.0.0 — June 2026

Initial release.

### Inventory Management

- Add, edit, and delete items with brand, department, category, style number, and price
- Photo upload via camera or gallery — up to 4 photos per item
- Automatic photo compression (~95% size reduction before upload)
- Item lifecycle: Active → Markdown → Sold → Archived
- Full activity history per item (immutable audit log)
- Cover photo system (position 0 always shown on item cards)

### Search and Filtering

- Real-time search across brand, style number, department, and category
- Filter by department, status, and price range
- Sort by newest, oldest, price (low/high), and brand (A-Z / Z-A)
- Active filter chips with individual and bulk clear
- Live results count

### Bulk Actions

- Multi-select mode on inventory list
- Select all visible items
- Bulk status change for any selection
- Available to Markdown role and above

### Analytics Dashboard

- 6 KPI cards: total value, item count, markdown rate, average price, markdown floor value, customer savings
- Inventory status donut chart
- 14-day items added trend line
- Top 8 brands by volume (horizontal bar)
- Items by department (bar chart)
- Price distribution histogram
- Slow movers list (items active 30+ days)

### Role-Based Access Control

- 4 roles: Associate, Markdown, Supervisor, Admin
- Role enforcement at UI and database (RLS) layers
- Admin user management panel
- Suspend and reactivate accounts
- Role change takes effect immediately

### PWA

- Installable on iPhone and Android from browser
- Offline support with Workbox caching strategies
- Pull to refresh on inventory list
- Safe area support for iPhone notch and home indicator

### Theme

- Dark and light mode with toggle
- Preference persisted to localStorage
- Navy (#0F1623) and teal (#00C896) brand palette
- Consistent scrollbar in both modes

### Technical

- React 18 + Vite 8
- Tailwind CSS v3
- Supabase PostgreSQL with Row Level Security
- React Hook Form + Zod validation
- Recharts for analytics
- Vercel deployment with automatic deploys on push
