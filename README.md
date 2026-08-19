# WWC — World Wrestling Council Streaming App

A subscription streaming platform for live PPV wrestling events and an on-demand video
library, built with Next.js App Router, TypeScript, and Tailwind CSS. Fictional brand,
fictional roster — a functional scaffold in the style of WWE Network / ESPN+.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Components)
- **Tailwind CSS v4** — brand tokens (`wwc-black`, `wwc-red`, `wwc-white`, `wwc-grey-*`) defined in [app/globals.css](app/globals.css)
- **Radix UI primitives** hand-wrapped in [components/ui](components/ui) (no shadcn CLI dependency)
- **NextAuth.js (Auth.js) v5** — Credentials + Google OAuth, JWT sessions, in-memory user store
- **Stripe** — scaffolded Checkout (subscription + one-time PPV) and webhook handling, test-mode only
- **Framer Motion**-ready (CSS transitions used by default; swap in as needed)
- **Sonner** for toasts, **lucide-react** for icons

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in values — see "Environment variables" below
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (credentials sign-in)

The user store is in-memory and seeded with three accounts — no sign-up required to explore
gated content:

| Email               | Password      | Plan          |
| ------------------- | ------------- | ------------- |
| `fan@wwc.tv`         | `wrestlemania` | WWC+ Monthly  |
| `champion@wwc.tv`    | `championship` | WWC+ Annual   |
| `rookie@wwc.tv`      | `firstmatch`   | Free          |

Google sign-in works once `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set (see below).

## Where the mock data lives

Everything under [`/data`](data) is a static fixture — no database required:

- [`data/wrestlers.ts`](data/wrestlers.ts) — 14-person fictional roster
- [`data/events.ts`](data/events.ts) — 8 events (upcoming, one live, two past) with full match cards
- [`data/videos.ts`](data/videos.ts) — 14 on-demand videos across PPV replays, weekly shows, full matches, highlights
- [`data/plans.ts`](data/plans.ts) — Free / WWC+ Monthly / WWC+ Annual
- [`data/users.ts`](data/users.ts) — in-memory user + order store (resets on server restart)

None of this is imported directly by pages or components. Everything goes through the
repository layer in [`lib/data/*`](lib/data) (`getEvents`, `searchVideos`,
`userHasAccessToEvent`, etc.) — swap those functions for real API/CMS/database calls later
without touching any UI code.

## Auth (NextAuth v5)

Configured in [`auth.ts`](auth.ts): Credentials provider (bcrypt-hashed passwords) + Google
OAuth, JWT session strategy. Session's `user` object carries `id`, `plan`, and
`purchasedEventSlugs` (see the module augmentation in
[`types/next-auth.d.ts`](types/next-auth.d.ts)) so access-gating logic can run without extra
lookups.

- `POST /api/auth/register` — creates an account in the in-memory store, then the client signs in with Credentials.
- `app/api/auth/[...nextauth]/route.ts` — the standard Auth.js route handler.

## Stripe (test-mode scaffold)

- `POST /api/stripe/checkout` — creates a Checkout Session. Body is either
  `{ type: "subscription", planId }` or `{ type: "ppv", eventSlug }`.
- `POST /api/stripe/webhook` — verifies the signature and, on
  `checkout.session.completed`, grants the PPV purchase or updates the user's plan in the
  mock store.
- `POST /api/stripe/portal` — creates a Billing Portal session (needs a real test-mode
  customer ID — see `.env.example`).

To exercise the full loop locally: create real Stripe **test-mode** prices for the two paid
plans, set `STRIPE_SECRET_KEY` / `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL`, then forward
webhooks with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Environment variables

See [`.env.example`](.env.example) for the full list with inline comments. Nothing in this
repo contains a real credential — every value is a clearly-marked placeholder.

**Required before this goes to production:**

- Real `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- Real Google OAuth client ID/secret with a production redirect URI
- Real Stripe **live-mode** keys, price IDs, and a webhook endpoint registered in the Stripe
  Dashboard
- A real database behind `lib/data/users.ts` (the in-memory array does not persist and is not
  safe for concurrent/multi-instance use)
- A real video hosting/streaming solution — `data/videos.ts` uses a placeholder
  `videoUrl` (`/mock-media/sample.mp4`), which does not exist on disk

## Project structure

```
app/                  Routes (App Router) — pages, layouts, API route handlers
components/
  ui/                 Hand-built Radix-based primitives (button, dialog, select, ...)
  layout/              Navbar, footer, mobile drawer, auth-aware nav
  home/                Hero, upcoming events, continue watching, plans teaser
  events/              Event cards, match card list, PPV access panel
  watch/               Video grid, filters, player, access gate
  account/, auth/       Account dashboard + sign-in/up forms
  media/, shared/       Poster placeholder, countdown, badges, page header
data/                  Static mock fixtures (events, videos, wrestlers, plans, users)
lib/data/              Repository layer — the seam to swap in a real backend
lib/                   Stripe client, auth-adjacent utilities, cn() helper
types/                 Shared TypeScript types + NextAuth module augmentation
auth.ts                NextAuth v5 configuration
```

## Notes

- Poster/thumbnail art is a generated CSS gradient placeholder ([`components/media/poster.tsx`](components/media/poster.tsx)) — no image assets required to run the app.
- WWC and all wrestler names/gimmicks are fictional, for demonstration purposes only.
