import { Router } from 'express'
import { prisma } from '@ecom/db'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { z } from 'zod'
import { settlementQueue } from '../../queues/index'
import bcrypt from 'bcryptjs'

export const adminRouter = Router()

adminRouter.use(authenticate, authorize('ADMIN'))

// ─── User management ──────────────────────────────────────────────────────────

adminRouter.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query['page'] ?? 1))
    const limit = Math.min(50, Number(req.query['limit'] ?? 20))
    const search = (req.query['search'] as string | undefined)?.trim()
    const role = req.query['role'] as string | undefined

    const where: Record<string, unknown> = {}
    if (role) where['role'] = role
    if (search) {
      where['OR'] = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { profile: { fullName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as never,
        include: {
          profile: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where: where as never }),
    ])

    const safeUsers = users.map(({ passwordHash: _, ...u }) => u)
    res.json({ success: true, data: safeUsers, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/users/:id', async (req, res, next) => {
  try {
    const body = z.object({
      fullName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
      role: z.enum(['CUSTOMER', 'VENDOR', 'DELIVERY', 'ADMIN']).optional(),
    }).parse(req.body)

    const { fullName, ...userFields } = body

    await prisma.$transaction(async (tx) => {
      if (Object.keys(userFields).length > 0) {
        await tx.user.update({ where: { id: req.params['id'] }, data: userFields })
      }
      if (fullName) {
        await tx.userProfile.upsert({
          where: { userId: req.params['id'] },
          update: { fullName },
          create: { userId: req.params['id'], fullName },
        })
      }
    })

    const updated = await prisma.user.findUnique({
      where: { id: req.params['id'] },
      include: { profile: true, _count: { select: { orders: true } } },
    })
    const { passwordHash: _, ...safeUser } = updated!
    res.json({ success: true, data: safeUser })
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/users/:id/reset-password', async (req, res, next) => {
  try {
    const { newPassword } = z.object({
      newPassword: z.string().min(8),
    }).parse(req.body)

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: req.params['id'] }, data: { passwordHash } })
    // Revoke all refresh tokens so existing sessions are invalidated
    await prisma.refreshToken.updateMany({ where: { userId: req.params['id'] }, data: { revoked: true } })
    res.json({ success: true, message: 'Password reset successfully' })
  } catch (err) {
    next(err)
  }
})

// ─── Vendor management ────────────────────────────────────────────────────────
adminRouter.get('/vendors', async (req, res, next) => {
  try {
    const status = req.query['status'] as string | undefined
    const vendors = await prisma.vendor.findMany({
      where: status ? { status: status as 'PENDING' | 'APPROVED' | 'SUSPENDED' } : undefined,
      include: { user: { select: { email: true, phone: true, profile: true } }, documents: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: vendors })
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/vendors/:id/status', async (req, res, next) => {
  try {
    const { status } = z
      .object({ status: z.enum(['APPROVED', 'SUSPENDED', 'REJECTED']) })
      .parse(req.body)

    const vendor = await prisma.vendor.update({
      where: { id: req.params['id'] },
      data: {
        status,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
      },
    })
    res.json({ success: true, data: vendor })
  } catch (err) {
    next(err)
  }
})

// Category management
adminRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true },
      where: { parentId: null },
    })
    res.json({ success: true, data: categories })
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/categories', async (req, res, next) => {
  try {
    const data = z
      .object({
        name: z.string(),
        slug: z.string(),
        imageUrl: z.string().optional(),
        parentId: z.string().optional(),
        position: z.number().default(0),
      })
      .parse(req.body)
    const category = await prisma.category.create({ data })
    res.status(201).json({ success: true, data: category })
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/categories/:id', async (req, res, next) => {
  try {
    const data = z
      .object({
        name: z.string().optional(),
        slug: z.string().optional(),
        imageUrl: z.string().optional(),
        position: z.number().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(req.body)
    const category = await prisma.category.update({ where: { id: req.params['id'] }, data })
    res.json({ success: true, data: category })
  } catch (err) {
    next(err)
  }
})

adminRouter.delete('/categories/:id', async (req, res, next) => {
  try {
    const count = await prisma.product.count({ where: { categoryId: req.params['id'] } })
    if (count > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete — ${count} product(s) assigned to this category` })
    }
    await prisma.category.delete({ where: { id: req.params['id'] } })
    return res.json({ success: true, message: 'Category deleted' })
  } catch (err) {
    next(err)
  }
})

// Flash sale management
adminRouter.get('/flash-sales', async (_req, res, next) => {
  try {
    const sales = await prisma.flashSale.findMany({
      include: { items: { include: { variant: { include: { product: true } } } } },
      orderBy: { startTime: 'desc' },
    })
    res.json({ success: true, data: sales })
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/flash-sales', async (req, res, next) => {
  try {
    const data = z
      .object({
        name: z.string(),
        bannerUrl: z.string().optional(),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        items: z.array(
          z.object({
            variantId: z.string(),
            vendorId: z.string(),
            salePrice: z.number(),
            originalPrice: z.number(),
            stockLimit: z.number(),
            maxPerUser: z.number().default(1),
          }),
        ),
      })
      .parse(req.body)

    const { items, ...saleData } = data
    const sale = await prisma.flashSale.create({
      data: {
        ...saleData,
        items: { create: items },
      },
      include: { items: true },
    })
    res.status(201).json({ success: true, data: sale })
  } catch (err) {
    next(err)
  }
})

// Settlement trigger — enqueues a background job instead of blocking the request
adminRouter.post('/settlements/run', async (req, res, next) => {
  try {
    const body = z
      .object({
        vendorId: z.string().optional(),
        periodStart: z.string().datetime(),
        periodEnd: z.string().datetime(),
      })
      .parse(req.body)

    const job = await settlementQueue.add('run-settlement', body)
    res.json({ success: true, message: 'Settlement job queued', jobId: job.id })
  } catch (err) {
    next(err)
  }
})

// Order management
adminRouter.get('/orders', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query['page'] ?? 1))
    const limit = Math.min(50, Number(req.query['limit'] ?? 20))
    const status = req.query['status'] as string | undefined

    const where = status ? { status: status as never } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { email: true, phone: true, profile: true } },
          items: {
            include: { variant: { include: { product: { select: { name: true } } } } },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    res.json({ success: true, data: orders, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params['id'] },
      include: {
        customer: { select: { email: true, phone: true, profile: true } },
        items: {
          include: {
            variant: { select: { id: true, sku: true, price: true, images: true, attributes: true, product: { select: { id: true, name: true, slug: true } } } },
            vendor: { select: { id: true, storeName: true, slug: true, commissionRate: true, bankName: true, bankAccount: true, bankHolder: true } },
          },
          orderBy: { vendorId: 'asc' },
        },
        statusLogs: { orderBy: { createdAt: 'asc' } },
        paymentTransactions: { orderBy: { createdAt: 'desc' } },
        deliveryAssignment: {
          include: {
            partner: { include: { user: { select: { phone: true, profile: true } } } },
          },
        },
      },
    })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    // Build per-vendor payout summary
    const vendorMap = new Map<string, {
      vendor: typeof order.items[0]['vendor']
      items: typeof order.items
      grossAmount: number
      commission: number
      netPayout: number
    }>()

    for (const item of order.items) {
      const v = item.vendor
      if (!vendorMap.has(v.id)) {
        vendorMap.set(v.id, { vendor: v, items: [], grossAmount: 0, commission: 0, netPayout: 0 })
      }
      const entry = vendorMap.get(v.id)!
      entry.items.push(item)
      const gross = item.totalPrice
      const commission = Math.round(gross * v.commissionRate / 100)
      entry.grossAmount += gross
      entry.commission += commission
      entry.netPayout += gross - commission
    }

    res.json({
      success: true,
      data: {
        ...order,
        vendorBreakdown: Array.from(vendorMap.values()),
      },
    })
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
    }).parse(req.body)

    const order = await prisma.order.update({ where: { id: req.params['id'] }, data: { status } })
    await prisma.orderStatusLog.create({
      data: { orderId: order.id, toStatus: status, note: 'Updated by admin', changedById: req.user!.sub },
    })
    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/orders/:id/assign', async (req, res, next) => {
  try {
    const { partnerId } = z.object({ partnerId: z.string() }).parse(req.body)
    const order = await prisma.order.findUnique({ where: { id: req.params['id'] } })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    const assignment = await prisma.deliveryAssignment.upsert({
      where: { orderId: req.params['id'] },
      create: { orderId: req.params['id'], partnerId, status: 'ASSIGNED' },
      update: { partnerId, status: 'ASSIGNED', acceptedAt: null, pickedAt: null, deliveredAt: null },
      include: { partner: { include: { user: { select: { phone: true, profile: true } } } } },
    })
    res.json({ success: true, data: assignment })
  } catch (err) {
    next(err)
  }
})

adminRouter.delete('/orders/:id/assign', async (req, res, next) => {
  try {
    const existing = await prisma.deliveryAssignment.findUnique({ where: { orderId: req.params['id'] } })
    if (!existing) return res.status(404).json({ success: false, message: 'No assignment found' })
    await prisma.deliveryAssignment.delete({ where: { orderId: req.params['id'] } })
    res.json({ success: true, message: 'Assignment removed' })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/delivery/partners', async (_req, res, next) => {
  try {
    const partners = await prisma.deliveryPartner.findMany({
      include: { user: { select: { phone: true, profile: true } } },
      orderBy: { status: 'asc' },
    })
    res.json({ success: true, data: partners })
  } catch (err) {
    next(err)
  }
})

// Platform analytics
adminRouter.get('/analytics', async (_req, res, next) => {
  try {
    const [totalOrders, totalRevenue, totalVendors, totalCustomers] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'SUCCESS' } }),
      prisma.vendor.count({ where: { status: 'APPROVED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ])

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total ?? 0,
        totalVendors,
        totalCustomers,
      },
    })
  } catch (err) {
    next(err)
  }
})
