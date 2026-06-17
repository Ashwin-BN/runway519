<div align="center">

<img src="public/icons/icon-512.png" alt="Runway-519" width="110" />

# Runway-519

### See More. Sell Smarter.

A full-stack Progressive Web App for off-price retail inventory management and analytics —
built for store associates, designed for the floor.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white&style=flat-square)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square)](https://web.dev/progressive-web-apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**[Live Demo](https://runway519.vercel.app)** · **[User Guide](docs/USER_GUIDE.md)** · **[Report Bug](https://github.com/Ashwin-BN/runway519/issues)**

</div>

---

## What Is Runway-519?

Runway-519 is an inventory management and analytics platform built specifically for
off-price retail environments like Winners / TJX. It lets store associates track
high-value items directly from the floor using their phone — adding photos, logging
prices, managing markdowns, and accessing live analytics — all without a desktop.

The app mirrors how Winners actually operates: real 2-digit department codes,
4-digit category codes, 6-digit style numbers, and enforced pricing conventions
(`.99` for active items, `.00` for markdowns).

---

## Key Features

| Category      | Features                                                                     |
| ------------- | ---------------------------------------------------------------------------- |
| **Inventory** | Add / edit / delete items, photo upload with compression, lifecycle tracking |
| **Pricing**   | Active pricing (.99), markdown pricing (.00), savings calculation            |
| **Search**    | Real-time search, multi-filter, sort, active filter chips                    |
| **Roles**     | Associate → Markdown → Supervisor → Admin with enforced permissions          |
| **Analytics** | KPIs, trend charts, brand breakdown, slow movers, price distribution         |
| **PWA**       | Installable on iPhone + Android, offline support, pull to refresh            |
| **Theme**     | Dark / light mode with teal + navy brand identity                            |
| **Security**  | Row Level Security on every Supabase table                                   |

---

## Tech Stack

| Layer    | Technology                | Purpose                          |
| -------- | ------------------------- | -------------------------------- |
| Frontend | React 18 + Vite           | UI framework and build tool      |
| Styling  | Tailwind CSS v3           | Utility-first responsive styling |
| Routing  | React Router v6           | Client-side navigation           |
| Forms    | React Hook Form + Zod     | Form state and schema validation |
| Backend  | Supabase (PostgreSQL)     | Database, auth, storage          |
| Charts   | Recharts                  | Analytics visualizations         |
| PWA      | vite-plugin-pwa + Workbox | Install prompt + offline caching |
| Hosting  | Vercel                    | Zero-config deployment           |

---

## Documentation

| Document                                                                  | Who It's For                                   |
| ------------------------------------------------------------------------- | ---------------------------------------------- |
| [User Guide](docs/USER_GUIDE.md)                                          | Store associates — how to use the app          |
| [Admin Guide](docs/ADMIN_GUIDE.md)                                        | Store managers — managing users and roles      |
| [Technical Overview](docs/TECHNICAL.md)                                   | Developers — architecture and design decisions |
| [QA Test Report](https://Ashwin-BN.github.io/runway519/docs/TESTING.html) | 76/76 tests passing                            |
| [Changelog](docs/CHANGELOG.md)                                            | Version history                                |

---

## Quick Start

```bash
git clone https://github.com/Ashwin-BN/runway519.git
cd runway519
npm install
cp .env.example .env.local
npm run dev
```

You will need a free [Supabase](https://supabase.com) account.
Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`,
then run the SQL in `supabase/schema.sql` to create the database tables.

---

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic redeploy.

Set these environment variables in your Vercel project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Roadmap

- [ ] Barcode / style number scanner via camera
- [ ] CSV / Excel inventory export
- [ ] Email alerts for slow movers (30+ days)
- [ ] AI auto-tagging from product photos
- [ ] Manager approval workflow for markdowns
- [ ] Multi-store support

---

## Author

**Ashwin BN**

- GitHub: [@Ashwin-BN](https://github.com/Ashwin-BN)
- LinkedIn: [linkedin.com/in/ashwin-b-n](https://linkedin.com/in/ashwin-b-n)

Built from real experience on the retail floor at Winners / TJX.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.

<div align="center">
<br/>
<img src="public/icons/icon-192.png" width="40" />
<br/>
<em>See More. Sell Smarter.</em>
</div>
