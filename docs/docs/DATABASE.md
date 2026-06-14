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
```

---

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
