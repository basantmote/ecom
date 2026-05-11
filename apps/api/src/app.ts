import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { authRouter } from './modules/auth/auth.router'
import { usersRouter } from './modules/users/users.router'
import { productsRouter } from './modules/products/products.router'
import { cartRouter } from './modules/cart/cart.router'
import { ordersRouter } from './modules/orders/orders.router'
import { paymentsRouter } from './modules/payments/payments.router'
import { vendorRouter } from './modules/vendor/vendor.router'
import { deliveryRouter } from './modules/delivery/delivery.router'
import { promotionsRouter } from './modules/promotions/promotions.router'
import { adminRouter } from './modules/admin/admin.router'
import { webhooksRouter } from './modules/webhooks/webhooks.router'
import { errorHandler } from './middleware/error.middleware'
import { notFound } from './middleware/notFound.middleware'

export const app = express()

// ─── Security & Parsing ──────────────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: [
      process.env.WEB_URL ?? 'http://localhost:3000',
      process.env.VENDOR_URL ?? 'http://localhost:3001',
      process.env.ADMIN_URL ?? 'http://localhost:3002',
      process.env.DELIVERY_URL ?? 'http://localhost:3003',
    ],
    credentials: true,
  }),
)
app.use(compression())
app.use(morgan('dev'))
app.use(cookieParser())

// Raw body for webhook signature verification
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many auth attempts, please try again later.',
})
app.use('/api/v1/auth', authLimiter)

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/orders', ordersRouter)
app.use('/api/v1/payments', paymentsRouter)
app.use('/api/v1/vendor', vendorRouter)
app.use('/api/v1/delivery', deliveryRouter)
app.use('/api/v1/promotions', promotionsRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/webhooks', webhooksRouter)

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)
