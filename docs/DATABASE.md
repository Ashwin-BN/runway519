<<<<<<< HEAD:docs/DATABASE.md
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
=======
# Database

PostgreSQL database schema, relationships, and security policies for Runway-519.
Hosted on Supabase free tier.

---

## Entity Relationship Diagram

```
auth.users (Supabase managed)
    │
    │ 1:1 (trigger auto-creates on signup)
    ▼
profiles
    │
    │ 1:many
    ▼
items ──────────────────┬──────────────────┐
    │                   │                  │
    │ 1:many            │ 1:many           │ 1:many
    ▼                   ▼                  ▼
item_photos         item_history       (future: tags)
>>>>>>> b15ea62e2e7c5366098f8d6531613be846a31e24:docs/docs/DATABASE.md
```

---

<<<<<<< HEAD:docs/DATABASE.md
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
=======
## Tables

### `profiles`

Extends Supabase's built-in `auth.users` table.
Auto-created via trigger when a user signs up.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, FK → auth.users | Matches Supabase auth user ID |
| `full_name` | `text` | NOT NULL | Display name |
| `email` | `text` | NOT NULL | User's email address |
| `role` | `text` | NOT NULL, default `'associate'` | One of: associate, markdown, supervisor, admin |
| `suspended` | `boolean` | default `false` | Blocks app access when true |
| `invited_by` | `uuid` | FK → profiles | Who invited this user |
| `last_seen` | `timestamptz` | nullable | Last activity timestamp |
| `created_at` | `timestamptz` | default `now()` | Account creation time |

**Constraints:**
```sql
check (role in ('associate', 'markdown', 'supervisor', 'admin'))
```

---

### `items`

Core inventory record. One row per physical item on the floor.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique item identifier |
| `brand` | `text` | NOT NULL | Brand name (e.g. Calvin Klein) |
| `dept_code` | `varchar(2)` | NOT NULL | Winners 2-digit dept code (e.g. 04) |
| `category_code` | `varchar(4)` | NOT NULL | 4-digit category code (e.g. 1042) |
| `style_number` | `varchar(6)` | NOT NULL | 6-digit style number |
| `price` | `numeric(10,2)` | NOT NULL | Original retail price |
| `markdown_price` | `numeric(10,2)` | nullable | Reduced price when on markdown |
| `status` | `text` | NOT NULL, default `'active'` | Lifecycle status |
| `notes` | `text` | nullable | Optional associate notes |
| `added_by` | `uuid` | FK → profiles | Who added this item |
| `created_at` | `timestamptz` | default `now()` | When item was added |
| `updated_at` | `timestamptz` | auto-updated | Last modification time |

**Constraints:**
```sql
-- Status must be one of four values
check (status in ('active', 'markdown', 'sold', 'archived'))

-- Original price must end in .99
check (price::text like '%.99')

-- Markdown price must end in .00 when present
check (markdown_price is null or markdown_price::text like '%.00')

-- Markdown price must be lower than original
check (markdown_price is null or markdown_price < price)
```

**Auto-update trigger:**
```sql
-- updated_at is automatically set on every UPDATE
create trigger items_updated_at
  before update on items
  for each row execute function update_updated_at();
```

---

### `item_photos`

Stores photo URLs for each item. Multiple photos per item, ordered by position.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | Unique photo identifier |
| `item_id` | `uuid` | FK → items (cascade delete) | Parent item |
| `url` | `text` | NOT NULL | Public Supabase Storage URL |
| `position` | `int` | default `0` | Display order (0 = cover photo) |
| `created_at` | `timestamptz` | default `now()` | Upload timestamp |

**Notes:**
- `position = 0` is always the cover photo shown on item cards
- Cascade delete ensures photos are removed when parent item is deleted
- Physical files in Supabase Storage must be deleted separately (handled in app)

---

### `item_history`

Immutable audit log. Records every create/update/delete event on items.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | Unique log entry |
| `item_id` | `uuid` | FK → items (cascade delete) | Item being tracked |
| `changed_by` | `uuid` | FK → profiles | Who made the change |
| `change_type` | `text` | NOT NULL | e.g. 'created', 'updated', 'deleted' |
| `old_value` | `jsonb` | nullable | Previous state (for updates) |
| `new_value` | `jsonb` | nullable | New state |
| `created_at` | `timestamptz` | default `now()` | When change occurred |

**Notes:**
- No UPDATE or DELETE policies on this table — it is append-only by design
- `old_value` and `new_value` store full item payload as JSON
- Used in the Item Detail page Activity History section

---

## Row Level Security Policies

All tables have RLS enabled. No data is accessible without a valid session.

### `profiles`
```sql
-- All authenticated users can read profiles
"profiles_read_all"       → select, using (auth.role() = 'authenticated')

-- Users can only update their own profile
"profiles_update_own"     → update, using (auth.uid() = id)

-- Admins can update any profile (for role changes)
"profiles_admin_update"   → update, using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
)
```

### `items`
```sql
"items_read_all"  → select, using (auth.role() = 'authenticated')
"items_insert"    → insert, with check (auth.role() = 'authenticated')
"items_update"    → update, using (auth.role() = 'authenticated')
"items_delete"    → delete, using (auth.role() = 'authenticated')
```

Note: Delete access is granted to all authenticated users at the DB level.
Admin-only enforcement for delete is handled in the UI layer.

### `item_photos`
```sql
"photos_read_all"   → select, using (auth.role() = 'authenticated')
"photos_insert"     → insert, with check (auth.role() = 'authenticated')
"photos_delete"     → delete, using (auth.role() = 'authenticated')
```

### `item_history`
```sql
"history_read_all"  → select, using (auth.role() = 'authenticated')
"history_insert"    → insert, with check (auth.role() = 'authenticated')
-- No update or delete — audit log is immutable
```

---

## Storage

### Bucket: `item-photos`

| Property | Value |
|---|---|
| Bucket name | `item-photos` |
| Public | Yes (photos served via public URL) |
| File path format | `{item_id}/{timestamp}-{index}.jpg` |
| Max file size | ~250KB (enforced by compression before upload) |

**Storage Policies:**
```sql
-- Authenticated users can upload
"photos_upload"       → insert, with check (bucket_id = 'item-photos'
                          and auth.role() = 'authenticated')

-- Anyone can read (public bucket for serving photos)
"photos_public_read"  → select, using (bucket_id = 'item-photos')

-- Authenticated users can delete their uploads
"photos_delete_own"   → delete, using (bucket_id = 'item-photos'
                          and auth.role() = 'authenticated')
```

---

## Database Functions

### `handle_new_user()`

Automatically creates a profile row when a new user signs up via Supabase Auth.

```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

### `update_updated_at()`

Automatically updates the `updated_at` timestamp on items before any update.

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_updated_at
  before update on items
  for each row execute function update_updated_at();
```

---

## Useful Queries

### Get all items with their cover photo
```sql
select
  i.*,
  p.url as cover_photo
from items i
left join item_photos p on p.item_id = i.id and p.position = 0
order by i.created_at desc;
```

### Get slow movers (active 30+ days)
```sql
select
  *,
  extract(day from now() - created_at) as days_on_floor
from items
where status in ('active', 'markdown')
  and created_at < now() - interval '30 days'
order by created_at asc;
```

### Get total inventory value by department
```sql
select
  dept_code,
  count(*) as item_count,
  sum(price) as total_value,
  avg(price) as avg_price
from items
where status = 'active'
group by dept_code
order by total_value desc;
```

### Get markdown rate
```sql
select
  count(*) filter (where status = 'markdown') as markdown_count,
  count(*) as total_count,
  round(
    count(*) filter (where status = 'markdown')::numeric / count(*) * 100,
    1
  ) as markdown_rate_pct
from items;
```
>>>>>>> b15ea62e2e7c5366098f8d6531613be846a31e24:docs/docs/DATABASE.md
