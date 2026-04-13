# Memora — AI Second Brain SaaS

> Save anything. Ask anything. Never lose a good idea again.

Memora is a full-stack AI-powered knowledge management SaaS. Users save articles, notes, voice memos and PDFs; Claude AI summarises everything, discovers connections, and answers questions from the user's own knowledge base.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Auth | Clerk |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| AI | Anthropic Claude API |
| Payments | Stripe |
| Storage | AWS S3 |
| Cache / Queues | Upstash Redis |
| Deployment | Vercel (frontend) |
| Styling | Tailwind CSS |
| Fonts | DM Serif Display + DM Sans + DM Mono |

---

## Quick start (local dev)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/memora.git
cd memora
npm install
```

### 2. Set up services

You need accounts for: **Clerk**, **Supabase**, **Anthropic**, **Stripe**, **AWS S3**

Copy the env template:
```bash
cp .env.example .env.local
```

Fill in every value (see the Services Setup section below).

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Services Setup

### Clerk (Auth)
1. Create app at [clerk.com](https://clerk.com)
2. Copy **Publishable Key** and **Secret Key** to `.env.local`
3. In Clerk Dashboard → Webhooks, add endpoint: `https://yourdomain.com/api/auth/webhook`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Copy **Webhook Secret** to `CLERK_WEBHOOK_SECRET`

### Supabase (Database)
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string (URI)
3. Copy to `DATABASE_URL` — add `?pgbouncer=true&connection_limit=1` for production
4. Run: `npx prisma db push`

### Anthropic (AI)
1. Get API key at [console.anthropic.com](https://console.anthropic.com)
2. Add to `ANTHROPIC_API_KEY`

### Stripe (Payments)
1. Create account at [stripe.com](https://stripe.com)
2. Create two products in Stripe Dashboard:
   - **Memora Pro** — $12/month recurring → copy Price ID to `STRIPE_PRO_PRICE_ID`
   - **Memora Team** — $29/user/month recurring → copy Price ID to `STRIPE_TEAM_PRICE_ID`
3. Copy Secret Key and Publishable Key
4. Add webhook endpoint: `https://yourdomain.com/api/billing/webhook`
5. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
6. Copy Webhook Secret to `STRIPE_WEBHOOK_SECRET`

### AWS S3 (File storage)
1. Create S3 bucket: `memora-uploads`
2. Create IAM user with S3 full access
3. Set bucket CORS policy:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedOrigins": ["https://yourdomain.com"],
  "MaxAgeSeconds": 3000
}]
```

### Upstash Redis (optional — for rate limiting)
1. Create database at [upstash.com](https://upstash.com)
2. Copy REST URL and Token

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/memora.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repo
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables from `.env.example`

### 3. Set environment variables

In Vercel Dashboard → Settings → Environment Variables, add all values from your `.env.local`

Make sure `NEXT_PUBLIC_APP_URL` is set to your Vercel domain (e.g. `https://memora.vercel.app`)

### 4. Deploy

Click **Deploy**. First deploy takes ~2 minutes.

### 5. After deploy — update webhook URLs

Update Clerk and Stripe webhook URLs to your live Vercel domain.

---

## Architecture

```
memora/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── pricing/page.tsx            # Pricing
│   ├── auth/                       # Clerk auth pages
│   ├── dashboard/                  # Protected app
│   │   ├── layout.tsx              # Sidebar + topbar
│   │   ├── page.tsx                # Main dashboard
│   │   ├── add/page.tsx            # Add item form
│   │   ├── connections/page.tsx    # AI connections
│   │   ├── digest/page.tsx         # Weekly digests
│   │   ├── search/page.tsx         # Search
│   │   └── settings/page.tsx       # Account settings
│   ├── share/[slug]/page.tsx       # Public card sharing
│   └── api/
│       ├── items/                  # CRUD + AI processing
│       ├── ai/chat/                # Q&A endpoint
│       ├── ai/connections/         # Connection discovery
│       ├── billing/                # Stripe checkout/portal/webhook
│       ├── digest/                 # Weekly digest generation
│       └── search/                 # Full-text search
├── components/
│   ├── dashboard/                  # Dashboard UI components
│   └── ui/                         # Shared UI (Skeleton, etc.)
├── lib/
│   ├── ai.ts                       # All Claude AI prompts
│   ├── prisma.ts                   # DB client
│   ├── stripe.ts                   # Stripe helpers
│   └── utils.ts                    # Utility functions
├── prisma/schema.prisma            # Database schema
└── types/index.ts                  # TypeScript types
```

---

## Revenue model

| Plan | Price | Limit |
|------|-------|-------|
| Free | $0 | 50 items, 10 AI queries/month |
| Pro | $12/month | Unlimited everything |
| Team | $29/user/month | Shared knowledge bases |

**Breakeven:** ~42 Pro users covers typical hosting costs ($0 Vercel Hobby + ~$25 Supabase + $20 Anthropic API).

**$10k MRR:** ~835 Pro users or mixed Pro+Team. Achievable in 6–12 months with consistent content marketing and the built-in viral sharing loop.

---

## Viral growth loop

Every item can be shared as a public "Memora card" — a beautiful page with the AI summary and insights. Users share these on Twitter/LinkedIn:

> *"Here's everything I know about stoicism, curated by my Memora second brain → memora.app/share/abc123"*

Every card page has a **"Build your second brain →"** CTA button. This is zero-cost acquisition built into the core product.

---

## Cron jobs (production)

Set up these cron jobs in Vercel (vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/digest/cron",
      "schedule": "0 8 * * 1"
    }
  ]
}
```

Create `/app/api/digest/cron/route.ts` to send weekly digests to all Pro users every Monday at 8am.

---

## Custom domain

1. In Vercel → Settings → Domains, add your domain
2. Add DNS records as instructed
3. Update `NEXT_PUBLIC_APP_URL` environment variable
4. Update Clerk and Stripe webhook URLs

---

## Support

- Email: hello@memora.app
- The codebase is yours to deploy, modify, and monetise

---

*Built with Next.js 14, Clerk, Prisma, Claude API, and Stripe.*
