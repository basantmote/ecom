import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../../middleware/auth.middleware'
import { prisma } from '@ecom/db'
import { AppError } from '../../middleware/error.middleware'

const wishlistAddSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
})

export const usersRouter = Router()

usersRouter.use(authenticate)

usersRouter.get('/me', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      include: { profile: true, addresses: true, credits: true },
    })
    if (!user) throw new AppError(404, 'User not found')
    const { passwordHash: _, ...safeUser } = user
    res.json({ success: true, data: safeUser })
  } catch (err) {
    next(err)
  }
})

usersRouter.get('/me/orders', async (req, res, next) => {
  try {
    const page = Number(req.query['page'] ?? 1)
    const limit = Number(req.query['limit'] ?? 10)
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: req.user!.sub },
        include: {
          items: { include: { variant: { include: { product: true } } } },
          deliveryAssignment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { customerId: req.user!.sub } }),
    ])

    res.json({
      success: true,
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

usersRouter.get('/me/credits', async (req, res, next) => {
  try {
    const credits = await prisma.customerCredit.findUnique({
      where: { userId: req.user!.sub },
    })
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    res.json({ success: true, data: { credits, transactions } })
  } catch (err) {
    next(err)
  }
})

usersRouter.get('/me/wishlist', async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.sub },
      include: {
        product: {
          include: {
            variants: { where: { isActive: true }, take: 1 },
            vendor: { select: { storeName: true } },
          },
        },
        variant: true,
      },
      orderBy: { addedAt: 'desc' },
    })
    res.json({ success: true, data: items })
  } catch (err) {
    next(err)
  }
})

usersRouter.post('/me/wishlist', async (req, res, next) => {
  try {
    const { productId, variantId } = wishlistAddSchema.parse(req.body)
    const existing = await prisma.wishlistItem.findFirst({
      where: { userId: req.user!.sub, productId },
    })
    if (!existing) {
      await prisma.wishlistItem.create({
        data: { userId: req.user!.sub, productId, variantId: variantId ?? null },
      })
    }
    res.json({ success: true, message: 'Added to wishlist' })
  } catch (err) {
    next(err)
  }
})

usersRouter.delete('/me/wishlist/:productId', async (req, res, next) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.sub, productId: req.params['productId'] },
    })
    res.json({ success: true, message: 'Removed from wishlist' })
  } catch (err) {
    next(err)
  }
})

usersRouter.get('/me/addresses', async (req, res, next) => {
  try {
    const addresses = await prisma.userAddress.findMany({
      where: { userId: req.user!.sub },
    })
    res.json({ success: true, data: addresses })
  } catch (err) {
    next(err)
  }
})
