import { Router } from 'express'
import { prisma } from '@ecom/db'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { z } from 'zod'
import { settlementQueue } from '../../queues/index'

export const adminRouter = Router()

adminRouter.use(authenticate, authorize('ADMIN'))

// Vendor management
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
