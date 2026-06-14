# Roles & Permissions

Runway-519 uses a 4-tier role system that mirrors real retail store hierarchy.

---

## Role Overview

| Role           | Who It's For                         | Emoji |
| -------------- | ------------------------------------ | ----- |
| **Associate**  | General floor staff                  | 👤    |
| **Markdown**   | Associates authorized to reprice     | 🏷️    |
| **Supervisor** | Floor supervisors and team leads     | 🔷    |
| **Admin**      | Store manager / system administrator | 👑    |

Roles are stored in the `profiles.role` column and enforced at both
the UI layer (buttons hidden) and the database layer (RLS policies).

---

## Permission Matrix

| Feature            | Associate | Markdown | Supervisor | Admin |
| ------------------ | --------- | -------- | ---------- | ----- |
| View inventory     | ✅        | ✅       | ✅         | ✅    |
| Search & filter    | ✅        | ✅       | ✅         | ✅    |
| Add new items      | ✅        | ✅       | ✅         | ✅    |
| Upload photos      | ✅        | ✅       | ✅         | ✅    |
| View item detail   | ✅        | ✅       | ✅         | ✅    |
| View analytics     | ✅        | ✅       | ✅         | ✅    |
| Change item price  | ❌        | ✅       | ✅         | ✅    |
| Mark as Markdown   | ❌        | ✅       | ✅         | ✅    |
| Mark as Sold       | ❌        | ✅       | ✅         | ✅    |
| Bulk status change | ❌        | ✅       | ✅         | ✅    |
| Edit any item      | ❌        | ❌       | ✅         | ✅    |
| Delete items       | ❌        | ❌       | ✅         | ✅    |
| View user list     | ❌        | ❌       | ❌         | ✅    |
| Change user roles  | ❌        | ❌       | ❌         | ✅    |
| Suspend accounts   | ❌        | ❌       | ❌         | ✅    |

---

## How Roles Are Checked

### In React components

The `useAuth()` hook exposes computed boolean helpers:

```jsx
const { role, isAdmin, isMarkdown } = useAuth()

// isAdmin   → true only for 'admin'
// isMarkdown → true for 'admin', 'supervisor', 'markdown'

// Example usage
{
  isAdmin && <button>Delete</button>
}
{
  isMarkdown && <option value="markdown">Markdown</option>
}
```

### In AuthContext

```js
const value = {
  role: profile?.role ?? 'associate',
  isAdmin: profile?.role === 'admin',
  isMarkdown: ['admin', 'supervisor', 'markdown'].includes(profile?.role),
  isSuspended: profile?.suspended === true,
}
```

---

## Assigning Roles

### First Admin

The first user must be manually promoted via Supabase SQL:

```sql
update profiles
  set role = 'admin'
  where email = 'manager@yourstore.com';
```

### Subsequent Role Changes

Admins can change any user's role from the **Users** page (`/users`).
Changes take effect immediately — the user's next page load will
reflect their new permissions.

---

## Suspended Accounts

Admins can suspend any account (except their own).

When suspended:

- User sees a "Account Suspended" block screen after login
- Cannot access any page
- Their data is preserved
- Admin can reactivate at any time from the Users page

Suspension is stored as `profiles.suspended = true` and checked in
`ProtectedRoute` before rendering any page.

---

## Role Escalation Protection

An admin cannot change their own role. This prevents accidental
self-demotion that would lock out all admins. The **Users** page
shows a "You" badge on the current user's card and hides the
action buttons for that row.

---

## Adding Roles in the Future

To add a new role (e.g. `readonly`):

1. Update the check constraint in Supabase:

```sql
alter table profiles
  drop constraint profiles_role_check;

alter table profiles
  add constraint profiles_role_check
  check (role in ('associate', 'markdown', 'supervisor', 'admin', 'readonly'));
```

2. Add to `ROLES.md` permission matrix
3. Update `useAuth()` computed booleans if needed
4. Update `RoleBadge.jsx` styles
5. Update `UsersPage.jsx` role dropdown options
