# Setup Guide

Complete local development setup for Runway-519 from scratch.

---

## Prerequisites

| Tool             | Version            | Download                                               |
| ---------------- | ------------------ | ------------------------------------------------------ |
| Node.js          | v20 or higher      | [nodejs.org](https://nodejs.org) — use LTS             |
| Git              | Any recent version | [git-scm.com](https://git-scm.com)                     |
| VS Code          | Any recent version | [code.visualstudio.com](https://code.visualstudio.com) |
| Supabase account | Free               | [supabase.com](https://supabase.com)                   |

Verify your installs:

```bash
node --version    # v20.x.x or higher
npm --version     # 10.x.x or higher
git --version     # git version 2.x.x
```

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/runway-519.git
cd runway-519
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

This installs all packages defined in `package.json` including React,
Tailwind, Supabase client, Recharts, and all dev tooling.

---

## Step 3 — Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Name:** `runway-519`
   - **Database password:** create a strong password and save it
   - **Region:** US East (closest free region to Canada)
4. Click **Create new project** — wait ~2 minutes

---

## Step 4 — Set Up the Database

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `supabase/schema.sql` from this repo
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** (or `Ctrl + Enter`)
6. You should see: ✅ **Success. No rows returned.**

Verify the tables exist under **Table Editor** — you should see:

- `profiles`
- `items`
- `item_photos`
- `item_history`

---

## Step 5 — Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**

1. In your Supabase project → click **Project Settings** (gear icon)
2. Click **API** in the settings menu
3. Copy **Project URL** → `VITE_SUPABASE_URL`
4. Copy **anon / public** key → `VITE_SUPABASE_ANON_KEY`

> ⚠️ Never commit `.env.local` to Git. It is already in `.gitignore`.

---

## Step 6 — Configure Supabase Auth

By default, Supabase requires email confirmation. Disable this for development:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle **Confirm email** → **OFF**
3. Click **Save**

Re-enable this before going to production (see [Deployment Guide](DEPLOYMENT.md)).

---

## Step 7 — Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Step 8 — Create Your Account

1. Click **Sign Up** on the login screen
2. Enter your name, email, and password
3. You are now logged in as an **Associate** (lowest role)

---

## Step 9 — Make Yourself Admin

1. Go to your Supabase project → **SQL Editor**
2. Run this query (replace with your actual email):

```sql
update profiles
  set role = 'admin'
  where email = 'your@email.com';
```

3. Sign out and sign back in
4. You now have full admin access including the **Users** tab

---

## VS Code Extensions (Recommended)

Install these from the Extensions panel (`Ctrl + Shift + X`):

| Extension                 | Purpose                           |
| ------------------------- | --------------------------------- |
| ES7+ React/Redux Snippets | React shorthand shortcuts         |
| Tailwind CSS IntelliSense | Autocomplete for Tailwind classes |
| Prettier                  | Auto-format on save               |
| ESLint                    | Catch errors as you type          |
| GitLens                   | Git history inline                |

---

## Available Scripts

| Command           | Description                                        |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Start dev server with hot reload at localhost:5173 |
| `npm run build`   | Build production bundle to `dist/`                 |
| `npm run preview` | Serve production build locally for testing         |

---

## Testing on Your Phone (Local Network)

```bash
npm run build
npm run preview
```

Your terminal will show:

```
➜  Network:  http://192.168.x.x:4173
```

Type that URL into your phone's browser (must be on the same WiFi).

To install as PWA:

- **iPhone Safari:** Share → Add to Home Screen
- **Android Chrome:** Menu → Add to Home Screen

If your phone can't reach it, allow the port through Windows Firewall:

```powershell
# Run PowerShell as Administrator
netsh advfirewall firewall add rule name="Vite Preview" dir=in action=allow protocol=TCP localport=4173
```

---

## Troubleshooting

### "relation profiles does not exist"

You created your account before running the schema.
Run the schema SQL first, then manually insert your profile:

```sql
-- Find your user ID
select id, email from auth.users;

-- Insert your profile manually
insert into profiles (id, full_name, email, role)
values ('your-user-id-here', 'Your Name', 'your@email.com', 'admin');
```

### Tailwind classes not applying

Make sure `tailwind.config.js` has the correct content paths:

```js
content: ['./index.html', './src/**/*.{js,jsx}']
```

### Environment variables not loading

- Make sure the file is named `.env.local` (not `.env`)
- All variables must start with `VITE_`
- Restart the dev server after any `.env.local` change

### Photos not uploading

Check that the storage bucket exists in Supabase:
**Storage** → you should see `item-photos` bucket.
If not, re-run the schema SQL — the bucket creation is at the bottom.
