# Feature Walkthrough

Complete guide to every feature in Runway-519 from a user's perspective.

---

## Getting Started

### Signing Up

1. Open the app at your store's Runway-519 URL
2. Tap **Sign Up**
3. Enter your full name, work email, and a password (min 6 characters)
4. Tap **Create Account**
5. You are now logged in as an **Associate**

Your store manager will upgrade your role if you need markdown or admin access.

### Signing In

1. Enter your email and password
2. Tap **Sign In**
3. You land on the **Inventory** page

The app remembers your session — you stay logged in until you sign out.

---

## Inventory

### Viewing Items

The **Inventory** page shows all items in the system.

Each item card displays:

- Cover photo (or placeholder if no photos)
- Brand name
- Department code, category code, style number
- Original price
- Markdown price + savings badge (if marked down)
- Status badge (Active / Markdown / Sold / Archived)

Tap any card to open the full item detail.

---

### Adding an Item

1. Tap **Add** (top right) or **Add Item** in the bottom navigation
2. Fill in all required fields:

**Photos (up to 4)**

- Tap **Take Photo** to open your phone camera directly
- Tap **Gallery** to choose from your photo library
- The first photo is automatically the cover image
- Photos are compressed automatically before upload (~95% size reduction)
- Tap the × on any photo to remove it

**Item Details**
| Field | Format | Example |
|---|---|---|
| Brand | Any text | Calvin Klein |
| Department | 2-digit code (select from dropdown) | 04 |
| Category Code | Exactly 4 digits | 1042 |
| Style Number | Exactly 6 digits | 123456 |

**Pricing & Status**
| Field | Format | Example |
|---|---|---|
| Original Price | Must end in .99 | 49.99 |
| Status | Active (default for new items) | Active |

> The price field auto-formats on blur — type `49` and it becomes `49.99`

**Notes (optional)**

- Any additional details about the item, condition, or location

3. Tap **Add Item**
4. You are taken to the item detail page

---

### Editing an Item

1. Open the item detail page
2. Tap **Edit** (top right) — only visible if you have Markdown+ role
3. Modify any fields
4. Tap **Save Changes**

The item history log records who made the change and when.

---

### Marking an Item as Markdown

1. Open the item detail page
2. Tap **Edit**
3. Change **Status** to **Markdown**
4. A **Markdown Price** field appears — enter the new price (must end in .00)
5. Markdown price must be lower than the original price
6. Tap **Save Changes**

The item card now shows the original price crossed out and the markdown price in yellow.

> Requires **Markdown** role or higher.

---

### Marking as Sold

1. Open the item detail page → **Edit**
2. Change **Status** to **Sold**
3. Enter the final sold price in the **Markdown Price** field
4. Tap **Save Changes**

Sold items are excluded from inventory value calculations.

---

### Deleting an Item

1. Open the item detail page
2. Tap **Delete** (top right, red button) — only visible to Admins
3. A confirmation modal appears
4. Tap **Delete** to confirm

This permanently removes the item and all its photos. This cannot be undone.

---

## Search & Filters

### Searching

Type in the search bar at the top of the Inventory page.
Results filter in real time across:

- Brand name
- Style number
- Department code
- Category code

### Filtering

1. Tap the **Filter** button next to the search bar
2. The filter panel expands with options:
   - **Department** — select a specific dept code
   - **Status** — Active, Markdown, Sold, or Archived
   - **Price Range** — set minimum and/or maximum price
   - **Sort By** — Newest, Oldest, Price (low/high), Brand (A-Z / Z-A)
3. Active filters appear as chips below the filter bar
4. Tap × on any chip to remove that filter
5. Tap **Clear All Filters** to reset everything

The results count ("Showing X of Y items") updates live.

---

## Bulk Actions

Available to **Markdown** role and higher.

1. Tap **Select** (top right of Inventory page)
2. Item cards now show checkboxes
3. Tap cards to select them (they highlight in teal)
4. A floating bar appears at the bottom showing the count
5. Tap **Change Status** → choose the new status
6. All selected items update at once
7. Tap **Done** to exit bulk mode

Tap **Select All** in the bulk bar to select every visible item at once.

---

## Item Detail

The detail page shows everything about one item.

### Photo Gallery

- Swipe left/right using the arrow buttons
- Tap the dot indicators to jump to a specific photo
- Tap thumbnails at the bottom to switch photos

### Item Information

- Brand, department, category, style number
- Original price and markdown price (if applicable)
- "You Save" amount (calculated automatically)
- Notes from the associate

### Activity History

Every change to the item is recorded:

- Who created it and when
- Every edit with timestamp and editor's name
- Status changes

---

## Analytics

The **Analytics** page provides live insights into the inventory.

### KPI Cards

| Card                   | What it shows                     |
| ---------------------- | --------------------------------- |
| Total Inventory Value  | Sum of all active item prices     |
| Total Items            | Count of all items in the system  |
| Markdown Rate          | % of items currently on markdown  |
| Avg Item Price         | Mean price across all items       |
| Markdown Floor Value   | Total value of markdown inventory |
| Total Customer Savings | Sum of all markdown discounts     |

### Charts

**Inventory Status** (donut chart)
— Breakdown of Active / Markdown / Sold / Archived items

**Items Added Last 14 Days** (line chart)
— Daily trend of new items added

**Top Brands by Volume** (horizontal bar chart)
— Which brands have the most items

**Items by Department** (bar chart)
— Item count per department code

**Price Distribution** (bar chart)
— How items are distributed across price ranges ($0-25, $25-50, etc.)

### Slow Movers

Items that have been Active or Markdown for 30 or more days.

- Orange badge: 30-59 days
- Red badge: 60+ days

Tap any slow mover to go directly to that item's detail page.

Tap **Refresh** to reload all analytics data.

---

## User Management (Admin only)

Available at `/users` — only visible to Admins.

### Viewing Users

The Users page shows all registered accounts with:

- Name and email
- Current role badge
- Join date
- Suspension status

Use the search bar to find users by name, email, or role.

### Stats Row

Four cards at the top show how many users have each role:
Associate / Markdown / Supervisor / Admin

### Role Information Panel

Tap **Roles** (top right) to see a permission breakdown for each role.

### Changing a User's Role

1. Find the user's card
2. Tap **Change Role**
3. Select the new role from the dropdown
4. Change takes effect immediately

### Suspending a User

1. Find the user's card
2. Tap **Suspend**
3. The card turns grey and shows "Suspended"

The user will see a block screen on their next login.

### Reactivating a User

1. Find the suspended user's card
2. Tap **Reactivate**
3. Their access is restored immediately

> You cannot suspend or change the role of your own account.

---

## Dark / Light Mode

Toggle between dark and light mode using the switch in:

- **Mobile:** the top right of the header bar
- **Desktop:** the bottom of the sidebar

Your preference is saved and remembered across sessions.

Dark mode uses the brand navy (`#0F1623`) and teal (`#00C896`) palette.
Light mode uses clean white surfaces with teal accents.

---

## Installing as an App (PWA)

Runway-519 can be installed on your phone like a native app.
No App Store required.

**iPhone (Safari only):**

1. Open the app in Safari
2. Tap the Share button (square with arrow up)
3. Tap **Add to Home Screen**
4. Tap **Add**

**Android (Chrome):**

1. Open the app in Chrome
2. Tap the three-dot menu
3. Tap **Add to Home Screen** or **Install App**

The app opens fullscreen with no browser bar, exactly like a native app.
It also works offline — previously loaded pages and photos are cached.

---

## Pull to Refresh

On mobile, pull down from the top of the Inventory page to refresh the list.
A spinning teal icon appears when you've pulled far enough.
Release to trigger the refresh.
