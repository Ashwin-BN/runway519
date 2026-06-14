# Deployment Guide

How to deploy Runway-519 to production on Vercel.

---

## Overview

```
GitHub (code) ──► Vercel (hosting) ◄──► Supabase (backend)
```

Vercel watches your GitHub repo. Every push to `main` automatically
builds and deploys a new version. Zero downtime. No manual steps.

---

## Step 1 — Prepare Supabase for Production

### Enable Email Confirmation

Before going live, turn email confirmation back on:

1. Supabase dashboard → **Authentication** → **Providers** → **Email**
2. Toggle **Confirm email** → **ON**
3. Click **Save**

Users will now receive a confirmation email before they can sign in.

### Set Your Site URL

1. Supabase dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://runway-519.vercel.app`)
3. Add to **Redirect URLs**: `https://runway-519.vercel.app/**`
4. Click **Save**

This ensures email confirmation links redirect to your live app.

---

## Step 2 — Push to GitHub

Make sure all your latest code is pushed:

```bash
git add .
git commit -m "chore: ready for production deployment"
git push origin main
```

---

## Step 3 — Deploy to Vercel

### First Deployment

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Find and select your `runway-519` repository
4. Click **Import**

Vercel auto-detects Vite. Confirm these settings:

```
Framework Preset:  Vite
Build Command:     npm run build
Output Directory:  dist
Install Command:   npm install
```

5. Click **Environment Variables**
6. Add both variables:

| Key                      | Value                     |
| ------------------------ | ------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key    |

7. Click **Deploy**

First deployment takes ~60 seconds.

### Your Live URL

Vercel assigns a URL like:

```
https://runway-519.vercel.app
```

Or if that name is taken:

```
https://runway-519-yourname.vercel.app
```

You can add a custom domain in Vercel's project settings.

---

## Step 4 — Verify Deployment

Open your live URL and test:

```
□ App loads (no blank screen)
□ Login page renders correctly
□ Sign up creates an account
□ Adding an item works
□ Photos upload and display
□ Analytics loads data
□ PWA install prompt appears on mobile
```

---

## Subsequent Deployments

Every `git push` to `main` triggers an automatic redeploy.

```bash
# Make changes, then:
git add .
git commit -m "feat: your change here"
git push
# Vercel deploys automatically in ~60 seconds
```

You can watch the deployment progress in your Vercel dashboard.

---

## Preview Deployments

Vercel also creates preview deployments for every pull request
and non-main branch push:

```bash
git checkout -b feature/new-thing
# make changes
git push origin feature/new-thing
```

Vercel creates a unique preview URL like:

```
https://runway-519-git-feature-new-thing-yourname.vercel.app
```

This lets you test changes in a production-like environment before
merging to main.

---

## Environment Variables

| Variable                 | Where to find it                            | Required |
| ------------------------ | ------------------------------------------- | -------- |
| `VITE_SUPABASE_URL`      | Supabase → Settings → API → Project URL     | ✅       |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key | ✅       |

To update environment variables after deployment:

1. Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Edit the value
3. Trigger a redeploy: **Deployments** → **Redeploy**

---

## Custom Domain (Optional)

1. Vercel project → **Settings** → **Domains**
2. Add your domain (e.g. `runway519.yourdomain.com`)
3. Follow the DNS instructions Vercel provides
4. Update Supabase **Site URL** and **Redirect URLs** to match

---

## Rollback

If a deployment breaks something:

1. Vercel dashboard → **Deployments**
2. Find the last working deployment
3. Click the three-dot menu → **Promote to Production**

The previous version is live again instantly.

---

## Free Tier Limits

### Vercel (Hobby plan — free)

| Resource             | Limit              |
| -------------------- | ------------------ |
| Deployments          | Unlimited          |
| Bandwidth            | 100 GB/month       |
| Build minutes        | 6,000 min/month    |
| Serverless functions | 100 GB-hours/month |

Well within limits for a portfolio project or small store deployment.

### Supabase (Free plan)

| Resource      | Limit      |
| ------------- | ---------- |
| Database size | 500 MB     |
| Storage       | 1 GB       |
| Auth users    | 50,000     |
| API requests  | Unlimited  |
| Bandwidth     | 5 GB/month |

With photo compression (~200KB per photo, 4 per item):

- Storage supports approximately **1,200+ fully-photographed items**
- Database supports tens of thousands of item records

---

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard → **Analytics** → **Enable**.
Shows page views, performance scores, and visitor data.

### Supabase Logs

Supabase dashboard → **Logs** → view database queries,
auth events, and storage operations in real time.

### Error Tracking (Recommended for production)

Consider adding [Sentry](https://sentry.io) (free tier available):

```bash
npm install @sentry/react
```

Captures runtime errors and reports them to a dashboard.
