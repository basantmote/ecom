import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { prisma } from '@ecom/db'
import { AppError } from '../../middleware/error.middleware'

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
      include: { product: true, variant: true },
    })
    res.json({ success: true, data: items })
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
