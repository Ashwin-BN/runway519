# Admin Guide

**Runway-519 · Store Manager Reference**

This guide covers everything a store manager or admin needs to manage
Runway-519 — users, roles, access control, and day-to-day oversight.

---

## Admin Access

Admin is the highest role in Runway-519. Admins can do everything
Markdown and Supervisor users can do, plus:

- View and manage all user accounts
- Change any user's role
- Suspend or reactivate accounts
- Delete any item from inventory

The first admin account must be set up manually by whoever deployed the app.
After that, admins can promote other users from within the app.

---

## The Four Roles

| Role           | Best for            | Key ability                              |
| -------------- | ------------------- | ---------------------------------------- |
| **Associate**  | General floor staff | Add items, view inventory                |
| **Markdown**   | Trusted associates  | + Change prices, mark items down or sold |
| **Supervisor** | Team leads          | + Edit or delete any item                |
| **Admin**      | Store manager       | + Full user management                   |

### What Each Role Can Do

| Action                   | Associate | Markdown | Supervisor | Admin |
| ------------------------ | --------- | -------- | ---------- | ----- |
| View inventory           | ✅        | ✅       | ✅         | ✅    |
| Add new items            | ✅        | ✅       | ✅         | ✅    |
| View analytics           | ✅        | ✅       | ✅         | ✅    |
| Change item price        | ❌        | ✅       | ✅         | ✅    |
| Mark as Markdown or Sold | ❌        | ✅       | ✅         | ✅    |
| Bulk status changes      | ❌        | ✅       | ✅         | ✅    |
| Edit any item            | ❌        | ❌       | ✅         | ✅    |
| Delete items             | ❌        | ❌       | ✅         | ✅    |
| Manage users             | ❌        | ❌       | ❌         | ✅    |

---

## Managing Users

Tap **Users** in the bottom navigation (or sidebar on desktop).

The Users page shows every registered account with their name, email, role, join date, and suspension status.

Use the **search bar** to find a specific user by name, email, or role.

The **stats row** at the top shows a count of how many users are in each role.

Tap **Roles** (top right) to see the full permission breakdown panel.

---

## Changing a User's Role

1. Find the user's card
2. Tap **Change Role**
3. Select the new role from the dropdown
4. The change takes effect immediately

The user will see their new permissions the next time they load a page — no sign out required.

> You cannot change your own role. This prevents accidentally removing your own admin access.

---

## Suspending an Account

Use this when a staff member leaves or should temporarily lose access.

1. Find the user's card
2. Tap **Suspend**
3. The card turns grey and shows a **Suspended** badge

The user will see a "Account Suspended" screen on their next login and cannot access any part of the app. Their data is fully preserved.

---

## Reactivating an Account

1. Find the suspended user's card
2. Tap **Reactivate**
3. Their access is restored immediately

---

## Markdown Workflow

When an item needs to be marked down:

1. A **Markdown** role user (or higher) opens the item detail
2. Taps **Edit**
3. Changes Status to **Markdown**
4. Enters the new price — must end in **.00** (e.g. 39.00)
5. The markdown price must be lower than the original price
6. Taps **Save Changes**

The item card now shows the original price crossed out, the markdown price in yellow, and the savings amount.

When the item sells, the associate changes status to **Sold**.

---

## Bulk Status Changes

For updating multiple items at once (e.g. end-of-season clearance):

1. On the Inventory page, tap **Select** (top right)
2. Tap the items you want to update — they highlight with a checkbox
3. Tap **Select All** in the floating bar to select everything visible
4. Tap **Change Status** and choose the new status
5. All selected items update at once
6. Tap **Done** to exit bulk mode

> Bulk actions are available to Markdown role and above.

---

## Analytics Overview

The **Analytics** page gives you a live picture of your inventory.

| Card                   | What it shows                             |
| ---------------------- | ----------------------------------------- |
| Total Inventory Value  | Dollar value of all active items combined |
| Total Items            | Count of every item in the system         |
| Markdown Rate          | Percentage of items currently marked down |
| Avg Item Price         | Average price across all items            |
| Markdown Floor Value   | Total value of all markdown inventory     |
| Total Customer Savings | Total amount saved across all markdowns   |

**Charts available:**

- Inventory status breakdown (active vs markdown vs sold)
- Items added over the last 14 days
- Top brands by number of items
- Items per department
- Price distribution across ranges

**Slow Movers** — items that have been Active or Markdown for 30 or more days appear at the bottom. Orange means 30–59 days, red means 60+ days. Tap any slow mover to go directly to that item.

---

## Deleting Items

Only **Supervisor** and **Admin** roles can delete items.

1. Open the item detail page
2. Tap the red **Delete** button (top right)
3. Confirm in the modal that appears

Deletion is permanent and removes all photos. It cannot be undone.

---

## Activity History

Every item has a full audit trail. Open any item detail page and scroll to **Activity History** to see:

- Who created the item and when
- Every edit made, with the editor's name and timestamp
- Status changes

This cannot be deleted — it is a permanent record.

---

## Tips for Managers

**Set roles before staff start using the app.** Associates can add items immediately after signing up, but they cannot do markdowns until you assign the Markdown role.

**Use Supervisor for team leads.** They can edit and delete items without having access to user management.

**Check Analytics weekly.** The slow movers section is the fastest way to identify what needs attention on the floor.

**Suspend instead of deleting accounts.** Suspended accounts preserve all history. If someone returns, you can reactivate in one tap.
