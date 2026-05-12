import { Router } from 'express'
import { prisma } from '@ecom/db'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { AppError } from '../../middleware/error.middleware'
import { z } from 'zod'

export const vendorRouter = Router()

vendorRouter.use(authenticate, authorize('VENDOR'))

vendorRouter.get('/dashboard', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.sub } })
    if (!vendor) throw new AppError(404, 'Vendor profile not found')

    const [totalOrders, totalRevenue, pendingSettlement, productCount] = await Promise.all([
      prisma.orderItem.count({ where: { vendorId: vendor.id, status: 'DELIVERED' } }),
      prisma.orderItem.aggregate({
        where: { vendorId: vendor.id, status: 'DELIVERED' },
        _sum: { totalPrice: true },
      }),
      prisma.vendorSettlement.aggregate({
        where: { vendorId: vendor.id, status: 'PENDING' },
        _sum: { netAmount: true },
      }),
      prisma.product.count({ where: { vendorId: vendor.id } }),
    ])

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalPrice ?? 0,
        pendingSettlement: pendingSettlement._sum.netAmount ?? 0,
        productCount,
      },
    })
  } catch (err) {
    next(err)
  }
})

// Product management
vendorRouter.get('/products', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.sub } })
    if (!vendor) throw new AppError(404, 'Vendor not found')

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      include: { variants: true, category: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: products })
  } catch (err) {
    next(err)
  }
})

const productSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
})

vendorRouter.post('/products', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.sub } })
    if (!vendor) throw new AppError(404, 'Vendor not found')
    if (vendor.status !== 'APPROVED') throw new AppError(403, 'Vendor not approved yet')

    const data = productSchema.parse(req.body)
    const product = await prisma.product.create({
      data: { ...data, vendorId: vendor.id },
    })
    res.status(201).json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
})

vendorRouter.put('/products/:id', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.sub } })
    if (!vendor) throw new AppError(404, 'Vendor not found')

    const existing = await prisma.product.findFirst({
      where: { id: req.params['id'], vendorId: vendor.id },
    })
    if (!existing) throw new AppError(404, 'Product not found')

    const data = productSchema.partial().parse(req.body)
    const product = await prisma.product.update({ where: { id: req.params['id'] }, data })
    res.json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
})

// Settlements
vendorRouter.get('/settlements', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.sub } })
    if (!vendor) throw new AppError(404, 'Vendor not found')

    const settlements = await prisma.vendorSettlement.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: settlements })
  } catch (err) {
    next(err)
  }
})

// Delivery partner list (for assign UI)
vendorRouter.get('/delivery/partners', async (_req, res, next) => {
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

// Vendor orders
vendorRouter.get('/orders', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.sub } })
    if (!vendor) throw new AppError(404, 'Vendor not found')

    const page = Number(req.query['page'] ?? 1)
    const limit = Number(req.query['limit'] ?? 20)

    const [items, total] = await Promise.all([
      prisma.orderItem.findMany({
        where: { vendorId: vendor.id },
        include: {
          order: { select: { id: true, orderNumber: true, createdAt: true, paymentMethod: true, customer: { select: { profile: true, phone: true } } } },
          variant: { include: { product: { select: { id: true, name: true } } } },
        },
        orderBy: { order: { createdAt: 'desc' } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.orderItem.count({ where: { vendorId: vendor.id } }),
    ])

    res.json({
      success: true,
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

vendorRouter.get('/orders/:id', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.sub } })
    if (!vendor) throw new AppError(404, 'Vendor not found')

    const hasItems = await prisma.orderItem.count({ where: { orderId: req.params['id'], vendorId: vendor.id } })
    if (!hasItems) return res.status(403).json({ success: false, message: 'Not authorized' })

    const order = await prisma.order.findUnique({
      where: { id: req.params['id'] },
      include: {
        deliveryAssignment: {
          include: { partner: { include: { user: { select: { phone: true, profile: true } } } } },
        },
      },
    })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

vendorRouter.post('/orders/:id/assign', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.sub } })
    if (!vendor) throw new AppError(404, 'Vendor not found')

    const { partnerId } = z.object({ partnerId: z.string() }).parse(req.body)

    const hasItems = await prisma.orderItem.count({ where: { orderId: req.params['id'], vendorId: vendor.id } })
    if (!hasItems) return res.status(403).json({ success: false, message: 'Not authorized' })

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

vendorRouter.delete('/orders/:id/assign', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.sub } })
    if (!vendor) throw new AppError(404, 'Vendor not found')

    const hasItems = await prisma.orderItem.count({ where: { orderId: req.params['id'], vendorId: vendor.id } })
    if (!hasItems) return res.status(403).json({ success: false, message: 'Not authorized' })

    await prisma.deliveryAssignment.delete({ where: { orderId: req.params['id'] } })
    res.json({ success: true, message: 'Assignment removed' })
  } catch (err) {
    next(err)
  }
})
