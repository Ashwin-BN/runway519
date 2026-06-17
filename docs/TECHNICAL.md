# Technical Overview

**Runway-519 · Developer Reference**

A high-level overview of the system architecture, design decisions,
and technical structure of Runway-519.

---

## System Architecture

Runway-519 is a client-side React application that communicates directly
with Supabase for all backend functionality. There is no custom server —
Supabase provides the database, authentication, file storage, and API.
The built application is hosted as static files on Vercel.

```
User Device (Browser / PWA)
        │
        │ HTTPS
        ▼
   Supabase
   ├── PostgreSQL database (items, users, history)
   ├── Auth (JWT sessions)
   └── Storage (item photos)

   Vercel
   └── Serves the React app as static files via CDN
```

---

## Frontend

**Framework:** React 18 with Vite as the build tool.
Vite was chosen over Create React App for significantly faster cold starts,
hot module replacement, and a smaller, modern build output.

**Styling:** Tailwind CSS v3 with a custom brand color palette.
The design system is built around the brand identity — navy (`#0F1623`)
and teal (`#00C896`) — with full dark and light mode support.

**Routing:** React Router v6 with protected routes.
All routes except `/login` require an authenticated session.
Suspended users are intercepted before any page renders.

**Forms:** React Hook Form with Zod schema validation.
Validation enforces Winners-specific field formats at the form level
(2-digit dept, 4-digit category, 6-digit style, .99/.00 prices)
before any data is sent to the database.

**State management:** Layered approach rather than a single global store.
Authentication and theme state live in React Context.
Filter and selection state live in custom hooks scoped to their pages.
Server data is fetched directly per page without a caching layer.

---

## Backend (Supabase)

Supabase provides the entire backend through its managed services.

**Database:** PostgreSQL with four tables — `profiles`, `items`,
`item_photos`, and `item_history`. The schema includes database-level
constraints that enforce pricing conventions (prices ending in .99 or .00)
and business rules (markdown price must be lower than original price).

**Authentication:** Supabase Auth handles sign up, sign in, sessions,
and email confirmation. A database trigger automatically creates a
`profiles` row for every new user.

**Storage:** Item photos are stored in a public Supabase Storage bucket
named `item-photos`. Photos are compressed to approximately 200KB using
the browser's Canvas API before upload, reducing storage usage by ~95%.

**Row Level Security:** Every table has RLS enabled. No data is readable
or writable without a valid authenticated session. Policies are defined
per table and per operation (select, insert, update, delete).

---

## Security Model

Security is enforced at two independent layers.

The **UI layer** hides buttons and options based on the user's role.
Associates cannot see the Delete button. Non-admins cannot see the Users tab.
The status dropdown only shows Markdown and Sold options to eligible roles.

The **database layer** enforces the same rules regardless of the UI.
Even if someone bypasses the interface and calls the Supabase API directly,
RLS policies reject unauthorized operations at the database level.

The Supabase `anon` key is intentionally public-facing and safe to expose
in frontend code. It grants no privileges beyond what RLS policies allow
for authenticated users.

---

## Role System

Four roles are stored in the `profiles` table and checked throughout the app.

**Associate** is the default role assigned to all new users.
**Markdown** adds the ability to change prices and update item status.
**Supervisor** adds the ability to edit or delete any item.
**Admin** adds full user management — changing roles and suspending accounts.

Role checks in the React app use two computed boolean values from `AuthContext`:
`isAdmin` (true only for admin) and `isMarkdown` (true for markdown, supervisor,
and admin). These are derived at login and used to conditionally render
UI elements throughout the application.

---

## PWA

The app is configured as a Progressive Web App using `vite-plugin-pwa`
and Workbox. It can be installed on iPhone and Android from the browser
with no App Store involvement.

Three caching strategies are in use. Static assets (JavaScript, CSS, HTML)
use cache-first — they are served instantly from the service worker cache
and updated in the background. Supabase API calls use network-first with
a 10-second timeout and 5-minute cache TTL — the app tries the network
first and falls back to cached responses when offline. Item photos use
cache-first with a 7-day expiry.

---

## Image Compression

Photos are compressed in the browser using the Canvas API before upload.
The maximum output dimensions are 1000×1000 pixels at 0.75 JPEG quality.
A typical phone photo of 4–8 MB is reduced to approximately 150–250 KB.
This extends the Supabase free tier storage limit to support over 4,000
fully-photographed items before hitting the 1 GB cap.

---

## Folder Structure

The source code is organized by concern rather than by file type.

Pages are full route-level components, one per URL. Components are split
into three groups — layout components that form the app shell, UI primitives
that are reused across pages, and chart components used only in Analytics.
Custom hooks encapsulate all non-trivial logic including filtering, bulk
selection, analytics processing, and pull-to-refresh. Context providers
handle auth and theme state globally. Utility files contain the Zod
validation schema and the image compression function. Constants define
department codes, status values, colors, and price formatting helpers.

---

## Dark Mode

Dark mode uses Tailwind's `class` strategy. The `.dark` class is toggled
on the root HTML element by ThemeContext. User preference is persisted to
`localStorage` and defaults to dark mode to match the brand identity.

Some fixed-position elements (specifically the mobile bottom navigation)
use inline styles tied to the `isDark` boolean rather than Tailwind dark
classes. This is a deliberate workaround for an edge case where fixed
elements do not reliably inherit the dark class in certain rendering
contexts.

---

## Deployment

The application builds to a static `dist/` folder via `npm run build`.
Vercel serves this as a CDN-distributed static site. Every push to the
`main` branch on GitHub triggers an automatic Vercel redeploy.

Two environment variables are required — `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` — set in the Vercel project settings.
These are injected at build time by Vite and bundled into the static output.

---

## Database Schema Summary

| Table          | Purpose                                           |
| -------------- | ------------------------------------------------- |
| `profiles`     | User accounts extended from Supabase Auth         |
| `items`        | Core inventory records                            |
| `item_photos`  | Photo URLs linked to items, ordered by position   |
| `item_history` | Immutable audit log of every change to every item |

The full schema including all constraints, triggers, RLS policies,
and storage bucket configuration is in `supabase/schema.sql`.

---

## Key Design Decisions

**No separate backend server.** Supabase handles everything — auth, database,
storage, and auto-generated REST API. This keeps the architecture simple,
eliminates server hosting costs, and keeps the project within free tier limits.

**Zod + database constraints for validation.** Business rules like price
format are enforced in both the form schema and the database check constraints.
This means invalid data cannot enter the database even through direct API calls.

**Audit log is append-only.** The `item_history` table has no delete policy.
Every change is permanently recorded, which provides accountability and
a complete paper trail for every item.

**Photo position 0 is always the cover.** The `item_photos` table stores a
`position` column. Position 0 is displayed as the cover image on item cards.
This allows future reordering without changing any display logic.
