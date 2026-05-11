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
- `authenticate` — requires valid Bearer JWT, attaches `req.user: TokenPayload`
- `authorize(...roles)` — role guard, used after `authenticate`
- `optionalAuth` — sets `req.user` if token present, proceeds as guest otherwise

Roles: `CUSTOMER | VENDOR | DELIVERY | ADMIN`

### Route Structure

All routes are prefixed `/api/v1/`. Each module lives in `apps/api/src/modules/<name>/` with a `.router.ts` file wired into `app.ts`. The `/webhooks` route receives raw body (set before `express.json()` in `app.ts`).

Rate limits: **100 req / 15 min** globally, **10 req / 15 min** on `/auth`.

### Socket.io (Real-time Tracking)

Socket server shares the same HTTP server as Express (`apps/api/src/sockets/tracking.socket.ts`). JWT auth is required via `socket.handshake.auth.token`.

- Customers join `order:{orderId}` rooms via `track:order` event
- Delivery partners emit `delivery:location` — saved to `DeliveryTracking` table and fanned out to the order room
- Call `emitOrderStatusUpdate(orderId, status)` from any router to push order status changes

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
- `WHATSAPP_*` — Meta WhatsApp Business API
- `CLOUDINARY_*` — image uploads
- `WEB_URL` / `VENDOR_URL` / `ADMIN_URL` / `DELIVERY_URL` — CORS allowed origins
