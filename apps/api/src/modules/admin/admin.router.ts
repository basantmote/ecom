import { Router } from 'express'
import { prisma } from '@ecom/db'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { AppError } from '../../middleware/error.middleware'
import { z } from 'zod'

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

// Settlement trigger
adminRouter.post('/settlements/run', async (req, res, next) => {
  try {
    const { vendorId, periodStart, periodEnd } = z
      .object({
        vendorId: z.string().optional(),
        periodStart: z.string().datetime(),
        periodEnd: z.string().datetime(),
      })
      .parse(req.body)

    const whereVendor = vendorId ? { id: vendorId } : { status: 'APPROVED' as const }
    const vendors = await prisma.vendor.findMany({ where: whereVendor })

    const results = []
    for (const vendor of vendors) {
      const items = await prisma.orderItem.findMany({
        where: {
          vendorId: vendor.id,
          status: 'DELIVERED',
          order: {
            createdAt: { gte: new Date(periodStart), lte: new Date(periodEnd) },
            paymentStatus: 'SUCCESS',
          },
          settlementItem: null,
        },
      })
      if (items.length === 0) continue

      const grossAmount = items.reduce((sum, i) => sum + i.totalPrice, 0)
      const commissionAmount = Math.floor((grossAmount * vendor.commissionRate) / 100)
      const netAmount = grossAmount - commissionAmount

      const settlement = await prisma.vendorSettlement.create({
        data: {
          vendorId: vendor.id,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          grossAmount,
          commissionAmount,
          netAmount,
          settlementItems: {
            create: items.map((item) => ({
              orderItemId: item.id,
              gross: item.totalPrice,
              commission: Math.floor((item.totalPrice * vendor.commissionRate) / 100),
              net: item.totalPrice - Math.floor((item.totalPrice * vendor.commissionRate) / 100),
            })),
          },
        },
      })
      results.push(settlement)
    }

    res.json({ success: true, data: results, message: `${results.length} settlements created` })
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
