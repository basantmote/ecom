# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EcomNP** — a multi-vendor e-commerce platform built for Nepal. Customers shop across multiple vendors, pay via eSewa/Khalti/COD/store credits, and track deliveries in real time.

## Monorepo Structure

Turbo monorepo with npm workspaces. All `apps/*` share a single root `node_modules`.

```
apps/
  api/        Express API server          → http://localhost:4000
  web/        Next.js customer storefront → http://localhost:3000
  vendor/     Next.js vendor portal       → http://localhost:3001
  admin/      Next.js admin panel         → http://localhost:3002
  delivery/   Next.js delivery partner    → http://localhost:3003
packages/
  db/         Prisma client + schema
  types/      Shared TypeScript interfaces
```

## Common Commands

```bash
# Start all services (from repo root)
npm run dev

# Start a single app
cd apps/api && npm run dev
cd apps/web && npm run dev

# Build all
npm run build

# Type-check the API
cd apps/api && npx tsc --noEmit

# Database
cd packages/db
npx prisma db push          # sync schema → DB (dev, no migration files)
npx prisma migrate dev      # create migration file (needs interactive TTY)
npx prisma studio           # visual DB browser
npx prisma generate         # regenerate client after schema changes

# Lint
npm run lint
```

## Local Dev Prerequisites

1. **PostgreSQL** running on `localhost:5432`. Credentials are in `.env` (`DATABASE_URL`).
2. **Redis** on `localhost:6379`. On Windows with WSL:
   ```bash
   wsl -u root -- redis-server --daemonize yes --bind 0.0.0.0 --port 6379
   ```
3. `.env` lives at the **repo root** (not inside any app). The API loads it via `dotenv.config({ path: resolve(__dirname, '../../../.env') })` in `apps/api/src/index.ts`.

## API Architecture

### Request / Response Contract

All API responses use the shape from `@ecom/types`:
```ts
{ success: boolean; data?: T; message?: string; errors?: Record<string, string[]> }
```

Errors are thrown using `AppError(statusCode, message)` from `apps/api/src/middleware/error.middleware.ts`. Zod validation errors are caught by the global error handler and formatted as `{ success: false, errors: { field: [message] } }`.

### Auth Middleware

Three middleware functions in `apps/api/src/middleware/auth.middleware.ts`:
- `authenticate` — **async**; checks token against Redis blacklist (`bl:{sha256hash}`) before verifying JWT, then attaches `req.user: TokenPayload`
- `authorize(...roles)` — role guard, used after `authenticate`
- `optionalAuth` — sets `req.user` if token present, proceeds as guest otherwise

Roles: `CUSTOMER | VENDOR | DELIVERY | ADMIN`

### Auth Endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/register` | Zod-validated |
| POST | `/auth/login` | Brute-force protected (5 attempts → 15-min lockout per identifier) |
| POST | `/auth/logout` | Requires `authenticate`; blacklists access token in Redis + revokes refresh token in DB |
| POST | `/auth/token/refresh` | Rotates refresh token |
| POST | `/auth/otp/send` | Max 5 sends/phone/hour |
| POST | `/auth/otp/verify` | Max 10 attempts/phone/15 min |

Logout accepts optional `{ refreshToken }` in body to revoke the refresh token simultaneously.

### Brute-Force Protection

Implemented in `apps/api/src/modules/auth/auth.service.ts` using Redis counters:
- Redis key pattern: `bf:{type}:{identifier}` — incremented on failure, deleted on success
- Login: 5 failed attempts per email/phone → locked for 15 minutes
- OTP send: 5 requests per phone per hour (prevents SMS bombing)
- OTP verify: 10 wrong attempts per phone per 15 minutes

### Route Structure

All routes are prefixed `/api/v1/`. Each module lives in `apps/api/src/modules/<name>/` with a `.router.ts` file wired into `app.ts`. The `/webhooks` route receives raw body (set before `express.json()` in `app.ts`).

Rate limits: **100 req / 15 min** globally, **10 req / 15 min** on `/auth`. Both use **Redis-backed `RedisStore`** (`rate-limit-redis`) so limits are shared across all API pods. Keys namespaced as `rl:global:*` and `rl:auth:*`.

### Socket.io (Real-time Tracking)

Socket server shares the same HTTP server as Express (`apps/api/src/sockets/tracking.socket.ts`). JWT auth is required via `socket.handshake.auth.token`.

- Customers join `order:{orderId}` rooms via `track:order` event
- Delivery partners emit `delivery:location` — saved to `DeliveryTracking` table and fanned out to the order room
- Call `emitOrderStatusUpdate(orderId, status)` from any router to push order status changes
- **Redis adapter** (`@socket.io/redis-adapter`) is wired with two dedicated connections (`pubClient`/`subClient` from `createRedisClient()`). This enables Socket.io rooms to work correctly across multiple API pods.

### Webhook Security

`apps/api/src/modules/webhooks/webhooks.router.ts` — WhatsApp POST:
1. Verifies `X-Hub-Signature-256` HMAC using `WHATSAPP_APP_SECRET` (`crypto.timingSafeEqual`)
2. Parses the raw `Buffer` body manually (route uses `express.raw()`, not `express.json()`)
3. Validates structure with Zod before processing — always returns 200 to Meta on schema failure to prevent retries

## Database

### Prisma Setup

Schema at `packages/db/prisma/schema.prisma`. Client is generated to `packages/db/src/generated/client` (committed). Import the client and all Prisma types from `@ecom/db`:
```ts
import { prisma, Prisma, Role } from '@ecom/db'
```

When adding a new model or changing a field, run `npx prisma db push` (dev) or `npx prisma migrate dev` (to create a migration file), then `npx prisma generate` to update the client.

### Money / Currency

All monetary values are stored as **integers in paisa** (1 NPR = 100 paisa). Divide by 100 for display. Fields like `unitPrice`, `totalPrice`, `amount`, `balance` are all `Int` in paisa.

### Key Domain Models

- **User** → one-to-one with `UserProfile`, `Vendor`, `DeliveryPartner`, `Cart`, `CustomerCredit`
- **Vendor** → `PENDING → APPROVED` flow; vendors can only create products after admin approval (`status === 'APPROVED'`)
- **Order** → `deliveryAddress` is a `Json` snapshot (`DeliveryAddressSnapshot` interface) taken at order time, not a FK
- **OrderItem** — per-vendor line items; settlements computed at the item level using `vendor.commissionRate` (%)
- **FlashSale** → live remaining stock tracked in Redis at key `flash_sale:{saleId}:stock:{itemId}`
- **RefreshToken** — stored as SHA-256 hash (`tokenHash`), never plaintext; `revoked` flag set on refresh rotation or logout

## Packages

### `@ecom/types`

Shared interfaces used across all apps. Key exports:
- `TokenPayload` — JWT claims shape
- `AuthTokens` — `{ accessToken, refreshToken }`
- `DeliveryAddressSnapshot` — JSON shape stored in `Order.deliveryAddress`
- `EsewaPaymentParams`, `KhaltiInitiatePayload`, `KhaltiVerifyResponse`
- `TrackingUpdate`, `WhatsAppWebhookPayload`, `FlashSaleStockInfo`

Prisma enums are re-exported from `@ecom/db` through this package so frontend apps don't import from `@ecom/db`.

### `@ecom/db`

The Prisma client singleton with `globalThis` caching for Next.js hot-reload safety. Exports the client as `prisma` plus all generated Prisma types.

## Frontend Apps (Next.js 14 App Router)

All four Next.js apps share the same patterns:

- **`src/lib/api.ts`** — axios instance pointed at the API. Interceptors: inject `accessToken` from `localStorage` on every request; auto-refresh using `refreshToken` on 401; redirect to `/login` if refresh fails.
- **`src/store/auth.store.ts`** — Zustand store (persisted to `localStorage`) holding `accessToken`, `refreshToken`, `userId`, `role`.
- **`src/components/Providers.tsx`** — wraps the app in `QueryClientProvider` (1 min staleTime).

The delivery app also has `src/lib/socket.ts` — singleton socket.io client connecting to port 4000, with `emitLocation()` helper for broadcasting GPS updates.

`apps/api/src/lib/redis.ts` exports:
- `redis` — shared ioredis client for BullMQ, flash sale stock, brute-force counters, token blacklist
- `createRedisClient()` — factory for independent connections; use this when you need a dedicated pub/sub client (e.g. Socket.io adapter) to avoid blocking the shared client

## Payment Integrations

**eSewa** (`apps/api/src/modules/payments/esewa.service.ts`):
- Signature: HMAC-SHA256 over `total_amount,transaction_uuid,product_code` → base64
- Flow: client POSTs to `/payments/esewa/initiate` → redirects user to eSewa form → eSewa redirects to `/payments/esewa/callback?data=<base64>` → server verifies signature and updates order

**Khalti** (`apps/api/src/modules/payments/khalti.service.ts`):
- Server-side initiation returns `{ pidx, payment_url }`
- After user pays, frontend POSTs `pidx` to `/payments/khalti/verify`

Both gateways are pointed at sandbox URLs by default (`rc-epay.esewa.com.np`, `a.khalti.com`).

## Environment Variables

The `.env` at repo root is the single source of truth. Key groups:
- `DATABASE_URL` / `DIRECT_URL` — PostgreSQL connection strings
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — must be ≥ 32 chars
- `REDIS_URL` — defaults to `redis://localhost:6379`
- `ESEWA_*` / `KHALTI_*` — payment gateway credentials
- `WHATSAPP_VERIFY_TOKEN` — used for Meta webhook verification handshake (GET)
- `WHATSAPP_APP_SECRET` — used for HMAC-SHA256 signature verification on incoming webhook POSTs; if unset, signature check is skipped (dev only)
- `CLOUDINARY_*` — image uploads
- `WEB_URL` / `VENDOR_URL` / `ADMIN_URL` / `DELIVERY_URL` — CORS allowed origins

## Seed Data (`packages/db/src/seed.ts`)

Run with `cd packages/db && npm run db:seed`. Wipes all data then recreates:

**Accounts (all passwords below):**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hamrobazaar.com | Admin@123 |
| Vendor × 5 | tech/fashion/home/sport/books@vendor.com | Vendor@123 |
| Customer × 5 | ram/sita/hari/maya/krishna@test.com | Test@1234 |
| Delivery | driver@delivery.com | Driver@123 |

**Products:** 44 products across 8 categories (Electronics, Fashion, Home & Living, Beauty, Sports, Books, Groceries, Toys & Kids). Images use `images.unsplash.com` (whitelisted in `apps/web/next.config.js` remotePatterns).

**Coupons (active):** `WELCOME10` (10% off), `SAVE500` (Rs.500 flat), `FREESHIP` (free shipping), `FLASH25` (25% off), `TECHSALE15` (15% off), `DASHAIN200` (Rs.200 flat). All amounts in paisa.

**Important:** `Product` has no `images` field — images live on `ProductVariant.images: String[]`. Always use `variant.images[0]` for product cards, not `product.images`.

## Completed Features

### Admin Panel (`apps/admin`, port 3002)
- **Login** (`/login`) — real `POST /auth/login` with role guard (`ADMIN` only); stores tokens in Zustand; redirects to `/`
- **Logout** — Topbar "Sign out" button calls `POST /auth/logout`, clears store, redirects to `/login`
- **Auth guard** — `DashboardLayout` redirects unauthenticated users to `/login`; uses `mounted` state to avoid SSR redirect loop
- **Categories page** (`/categories`) — grid view, create/edit modal with image preview, toggle active/hidden, delete guard (blocked if products assigned)
- **Coupons page** (`/coupons`) — full CRUD table, create modal with type/value/date/usage fields, live discount preview
- **Orders page** (`/orders`) — real data from `GET /admin/orders`; paginated, filterable by status; inline status `<select>` calls `PATCH /admin/orders/:id/status`
- **Sidebar** updated with Categories, Coupons, and Orders nav items
- **API routes** added: `PATCH /admin/categories/:id`, `DELETE /admin/categories/:id`, `GET /admin/orders`, `PATCH /admin/orders/:id/status`

### Vendor Portal (`apps/vendor`, port 3001)
- **Login** (`/login`) — real `POST /auth/login` with role guard (`VENDOR` only); stores tokens; redirects to `/`
- **Logout** — Topbar "Sign out" button calls `POST /auth/logout`, clears store
- **Auth guard** — `DashboardLayout` uses `mounted` state to prevent SSR hydration redirect loop
- **Products page** (`/products`) — fetches from `GET /vendor/products`; shows real price (min variant), stock, category, status badge; publish/unpublish toggle via `PUT /vendor/products/:id`
- **Orders page** (`/orders`) — fetches from `GET /vendor/orders?page=X&limit=20`; paginated table with product, SKU, customer, qty, amount, payment method, status, date

### Customer Storefront (`apps/web`, port 3000)
- **Login** — rejects non-`CUSTOMER` accounts with a clear error message pointing to the correct portal
- **Navbar** — account dropdown (desktop: "Account ▼" button; mobile: person icon) with My Account, My Orders, and Sign out; wishlist badge + cart badge always visible
- **Cart page** — `mounted` guard prevents SSR hydration mismatch that was silently breaking Link navigation
- **Products listing page** (`/products`) — category filter pills, product cards with variant image, price, discount badge, out-of-stock overlay. Fixed crash: `Product` has no `.images`; uses `variants[0].images[0]`
- **Product detail page** (`/products/[slug]`) — image gallery (aggregated from all variants), variant selector, stock warning (≤5), qty stepper, trust badges, reviews section
- **Checkout page** — syncs Zustand cart → DB (`POST /cart/items`) before creating order; promo code input; payment routing:
  - COD / Store Credit → `POST /orders` → redirect to order confirmation
  - eSewa → `POST /payments/esewa/initiate` → hidden form POST to eSewa sandbox
  - Khalti → `POST /payments/khalti/initiate` → `window.location.href = payment_url`
- **`ProductCard`** — `outOfStock` prop with overlay; Quick Add hidden when out of stock

### Coupon Validation Flow
Frontend (`checkout/page.tsx`) POSTs `{ code, cartTotal }` to `POST /api/v1/promotions/coupons/validate`. Demo codes to test: `WELCOME10`, `SAVE500`, `FREESHIP`.

### Wishlist (`apps/web`)
- **Store**: `apps/web/src/store/wishlist.store.ts` — Zustand store (not persisted). Holds `productIds: string[]`. Loaded from `GET /users/me/wishlist` on login via `WishlistSync` component in `Providers.tsx`, cleared on logout.
- **API**: `GET/POST/DELETE /users/me/wishlist` — POST validates body with Zod (`productId` required, `variantId` optional).
- **ProductCard**: receives `productId` prop; heart is always visible when wishlisted (red), hover-only otherwise. Redirects to `/login` if not authenticated.
- **Navbar**: wishlist heart icon always shown with badge count; links to `/account?tab=wishlist`.
- **Account page**: Wishlist tab fetches real API data, Remove button calls mutation and syncs Zustand store simultaneously.

### Delivery App (`apps/delivery`, port 3003)
- **Login** (`/login`) — real `POST /auth/login`; phone formatted as `+977{digits}`; role guard (`DELIVERY` only); tokens stored with `delivery-` prefix in localStorage
- **Logout** — calls `POST /auth/logout`, clears store with `delivery-` prefixed keys
- **Auth guard** — `mounted` state prevents premature redirect before Zustand hydrates
- **Dashboard** — fetches real assignments from `GET /delivery/assignments`; polls every 30s
  - Accept: `POST /delivery/assignments/:id/accept`
  - Mark Picked Up / Delivered: `POST /delivery/assignments/:id/status`
  - Shows active vs completed sections; COD badge; delivery address card
- **`src/lib/api.ts`** — axios instance using `delivery-accessToken`; auto-refresh interceptor on 401

### Skeleton Loaders (`apps/web`)
- `apps/web/src/components/ui/ProductCardSkeleton.tsx` — animated `animate-pulse` skeleton matching ProductCard layout.
- Products listing page uses 8 skeleton cards during initial load instead of a centered spinner.

### SSR / Zustand Hydration Pattern
All dashboard layouts and auth-dependent pages use the `mounted` state pattern to avoid redirect loops and hydration mismatches:
```tsx
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])
// Only redirect after client hydration:
useEffect(() => {
  if (mounted && !userId) router.replace('/login')
}, [mounted, userId, router])
if (!mounted) return null  // never redirect on server
```
Each app uses its own localStorage key prefix to avoid cross-portal auth contamination:
- `web` → `auth` (default Zustand persist name)
- `vendor` → `vendor-auth`
- `admin` → `admin-auth`
- `delivery` → `delivery-auth` (tokens keyed as `delivery-accessToken` / `delivery-refreshToken`)

### Security & Production Hardening (`apps/api`)

All implemented in Phase 1:

| What | Where | Detail |
|------|-------|--------|
| Redis-backed rate limits | `app.ts` | Both limiters use `RedisStore` — safe for multi-pod deploys |
| Token blacklist on logout | `auth.middleware.ts`, `auth.service.ts` | `bl:{sha256(token)}` key in Redis with TTL = remaining token lifetime |
| Brute-force protection | `auth.service.ts` | Redis counters on login, OTP send, OTP verify |
| Socket.io Redis adapter | `tracking.socket.ts` | `@socket.io/redis-adapter` with dedicated pub/sub clients |
| Webhook HMAC verification | `webhooks.router.ts` | `timingSafeEqual` check + Buffer parsing + Zod validation |
| Input validation | `users.router.ts` | Zod on wishlist POST |
| Graceful shutdown | `index.ts` | SIGTERM/SIGINT drains BullMQ workers, quits Redis, disconnects Prisma; 30s force-kill fallback |
| HSTS preload | `app.ts` | `helmet({ hsts: { maxAge: 31536000, includeSubDomains: true, preload: true } })` |

**Redis key namespaces:**
- `rl:global:*` — global rate limit counters
- `rl:auth:*` — auth route rate limit counters
- `bf:login:{identifier}` — login brute-force counters
- `bf:otp:send:{phone}` — OTP send throttle
- `bf:otp:verify:{phone}` — OTP verify throttle
- `bl:{sha256(token)}` — blacklisted access tokens (TTL = remaining lifetime)
- `flash_sale:{saleId}:stock:{itemId}` — flash sale live stock
