# Architecture

Technical architecture and design decisions for Runway-519.

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                   User's Device                      │
│                                                      │
│   React App (Vite)           PWA Service Worker      │
│   ┌─────────────┐            ┌──────────────────┐   │
│   │  Pages      │            │  Offline Cache   │   │
│   │  Components │◄──────────►│  Static Assets   │   │
│   │  Hooks      │            │  API Responses   │   │
│   └──────┬──────┘            └──────────────────┘   │
│          │                                           │
└──────────┼───────────────────────────────────────────┘
           │ HTTPS
           ▼
┌─────────────────────────────────────────────────────┐
│                    Supabase                          │
│                                                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│   │   Auth   │  │PostgreSQL│  │  Storage Bucket  │  │
│   │  (JWT)   │  │  (RLS)   │  │  (item-photos)   │  │
│   └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│                    Vercel                            │
│            (Static file hosting + CDN)               │
└─────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Why React + Vite?

React was chosen for its component model and ecosystem maturity.
Vite replaces Create React App with dramatically faster builds and
hot module replacement — cold start under 500ms vs 30+ seconds with CRA.

### State Management Strategy

Runway-519 uses a layered state approach rather than a single global store:

```
Layer 1 — Server state      Supabase queries (fetched per page)
Layer 2 — Auth state        React Context (AuthContext)
Layer 3 — Theme state       React Context (ThemeContext)
Layer 4 — UI state          Local useState per component
Layer 5 — Form state        React Hook Form
Layer 6 — Filter state      Custom hook (useInventoryFilters)
```

Zustand is installed but reserved for future features requiring
shared cross-page state (e.g. cart, notifications).

### Component Architecture

```
src/
├── pages/                    # Route-level components (one per URL)
│   ├── InventoryPage.jsx     # /inventory
│   ├── AddItemPage.jsx       # /inventory/add and /inventory/:id/edit
│   ├── ItemDetailPage.jsx    # /inventory/:id
│   ├── AnalyticsPage.jsx     # /analytics
│   ├── UsersPage.jsx         # /users (admin only)
│   └── LoginPage.jsx         # /login
│
├── components/
│   ├── layout/               # App shell components
│   │   ├── AppLayout.jsx     # Main shell — sidebar + topbar + bottomnav
│   │   ├── ProtectedRoute.jsx# Auth gate — redirects to /login if needed
│   │   ├── TopBar.jsx        # Header with logo, theme toggle, user info
│   │   ├── Sidebar.jsx       # Desktop left nav
│   │   └── BottomNav.jsx     # Mobile bottom tab bar
│   │
│   ├── ui/                   # Reusable UI primitives
│   │   ├── Button.jsx        # Primary, secondary, danger, ghost variants
│   │   ├── Input.jsx         # Text input with label + error
│   │   ├── Select.jsx        # Dropdown with label + error
│   │   ├── PriceInput.jsx    # Smart price input (.99 / .00 enforcement)
│   │   ├── PhotoUploader.jsx # Camera + gallery upload with compression
│   │   ├── StatusBadge.jsx   # Colored pill for item status
│   │   ├── RoleBadge.jsx     # Colored pill for user role
│   │   ├── FilterBar.jsx     # Search + filter + sort panel
│   │   ├── BulkActionBar.jsx # Floating bar for bulk status changes
│   │   ├── Skeleton.jsx      # Loading placeholders (3 variants)
│   │   ├── Toast.jsx         # Non-blocking notifications
│   │   └── ThemeToggle.jsx   # Dark/light mode switch
│   │
│   └── charts/               # Analytics visualizations
│       ├── KpiCard.jsx       # Metric summary card
│       └── SlowMovers.jsx    # Items sitting 30+ days list
│
├── hooks/                    # Custom React hooks
│   ├── useInventoryFilters.js# Filter + sort logic for inventory list
│   ├── useBulkSelect.js      # Multi-select state management
│   ├── useAnalytics.js       # Analytics data fetching + processing
│   ├── useUsers.js           # User management operations
│   ├── useToast.js           # Toast notification queue
│   └── usePullToRefresh.js   # Mobile pull-to-refresh gesture
│
├── context/
│   ├── AuthContext.jsx       # User session, profile, role helpers
│   └── ThemeContext.jsx      # Dark/light mode state + persistence
│
├── lib/
│   └── supabase.js           # Supabase client singleton
│
├── utils/
│   ├── itemSchema.js         # Zod validation schema for item form
│   └── compressImage.js      # Canvas-based photo compression
│
└── constants/
    ├── inventoryConstants.js # Dept codes, statuses, colors, formatters
    └── theme.js              # Brand color tokens
```

---

## Data Flow

### Adding an Item

```
User fills form
    │
    ▼
React Hook Form validates against Zod schema
    │
    ├─ Validation fails → show inline errors, stop
    │
    └─ Validation passes
           │
           ▼
       Photos compressed via Canvas API (~95% size reduction)
           │
           ▼
       Insert item row → Supabase items table
           │
           ▼
       Upload photos → Supabase Storage (item-photos bucket)
           │
           ▼
       Insert photo URLs → item_photos table
           │
           ▼
       Insert audit entry → item_history table
           │
           ▼
       Navigate to /inventory/:id
           │
           ▼
       Toast: "Item added successfully"
```

### Authentication Flow

```
App loads
    │
    ▼
AuthContext calls supabase.auth.getSession()
    │
    ├─ No session → ProtectedRoute redirects to /login
    │
    └─ Session exists
           │
           ▼
       Fetch profile from profiles table
           │
           ├─ profile.suspended = true → show suspension screen
           │
           └─ Normal profile → render app
                   │
                   ▼
               role injected into AuthContext
               (isAdmin, isMarkdown computed booleans)
```

---

## Security Model

### Row Level Security (RLS)

Every Supabase table has RLS enabled. No data is accessible without
a valid authenticated session. Key policies:

```
profiles      → authenticated users can read all
              → users can only update their own profile
              → admins can update any profile (for role changes)

items         → authenticated users can read, insert, update
              → authenticated users can delete (admin enforced in UI)

item_photos   → authenticated users can read, insert, delete

item_history  → authenticated users can read, insert
              → no delete (audit trail must be immutable)
```

### Role Enforcement

Roles are enforced at two levels:

1. **UI level** — buttons and options only rendered for permitted roles
2. **RLS level** — database rejects unauthorized operations even if
   someone bypasses the UI (e.g. direct API calls)

The `anon` Supabase key is safe to expose in frontend code because
RLS policies on every table define exactly what each authenticated
user can do.

---

## PWA Architecture

### Caching Strategy

```
Static assets (JS, CSS, HTML)
    └── CacheFirst — served from cache, updated in background

Supabase API calls
    └── NetworkFirst — try network, fall back to cache (5min TTL)

Item photos
    └── CacheFirst — cached for 7 days (photos don't change)
```

### Offline Behavior

When offline:

- Previously visited inventory pages load from cache
- Photos load from image cache
- New item additions queue and fail gracefully with error toast
- Analytics show cached data with a stale indicator

---

## Performance Decisions

### Code Splitting

The production bundle is split into named chunks:

```
react-vendor    React, ReactDOM, React Router    ~140KB
charts          Recharts                          ~280KB
supabase        Supabase JS client                ~80KB
forms           React Hook Form + Zod             ~45KB
utils           date-fns + lucide-react           ~60KB
index           App code                          ~50KB
```

This means on first load only `react-vendor` and `index` are required.
Charts are loaded only when the user navigates to `/analytics`.

### Image Compression

Photos are compressed before upload using the browser's Canvas API:

```
Input:  iPhone photo         4–8 MB
Output: Compressed JPEG      ~150–250 KB
Saving: ~95% size reduction

Max dimensions: 1000 × 1000px
Quality:        0.75 (visually identical on mobile screens)
```

This extends the Supabase free tier (1GB storage) to ~4,000+ items.

---

## Design System

### Brand Colors

| Token             | Hex       | Usage                          |
| ----------------- | --------- | ------------------------------ |
| `brand-teal`      | `#00C896` | Primary actions, active states |
| `brand-tealDark`  | `#00A07A` | Hover states                   |
| `brand-tealLight` | `#00E5B0` | Highlights                     |
| `brand-navy`      | `#0F1623` | Dark mode background           |
| `brand-surface`   | `#1A2332` | Dark mode card surfaces        |
| `brand-border`    | `#1E2D3D` | Dark mode borders              |

### Dark Mode Implementation

Dark mode uses Tailwind's `class` strategy — the `.dark` class is
toggled on `<html>` by ThemeContext. Preference is persisted to
`localStorage` and defaults to dark (matches brand identity).

Inline styles via `isDark` are used in AppLayout for the bottom nav
to bypass Tailwind's `fixed` element dark mode resolution edge case.
