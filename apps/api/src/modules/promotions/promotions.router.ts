import { Router } from 'express'
import { prisma } from '@ecom/db'
import { optionalAuth } from '../../middleware/auth.middleware'
import { AppError } from '../../middleware/error.middleware'
import { redis } from '../../lib/redis'

export const promotionsRouter = Router()

promotionsRouter.get('/flash-sales', async (_req, res, next) => {
  try {
    const sales = await prisma.flashSale.findMany({
      where: { status: 'ACTIVE' },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
    })

    // Attach live Redis stock counts
    const salesWithStock = await Promise.all(
      sales.map(async (sale) => {
        const itemsWithStock = await Promise.all(
          sale.items.map(async (item) => {
            const redisKey = `flash_sale:${sale.id}:stock:${item.id}`
            const remaining = await redis.get(redisKey)
            return { ...item, remaining: remaining ? Number(remaining) : item.stockLimit - item.soldCount }
          }),
        )
        return { ...sale, items: itemsWithStock }
      }),
    )

    res.json({ success: true, data: salesWithStock })
  } catch (err) {
    next(err)
  }
})

promotionsRouter.post('/coupons/validate', optionalAuth, async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body as { code: string; cartTotal: number }
    if (!code) throw new AppError(400, 'Coupon code required')

    const coupon = await prisma.coupon.findUnique({ where: { code, isActive: true } })
    if (!coupon) throw new AppError(404, 'Coupon not found')
    if (coupon.validUntil < new Date()) throw new AppError(400, 'Coupon expired')
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new AppError(400, 'Coupon usage limit reached')
    }
    if (cartTotal < coupon.minOrderAmount) {
      throw new AppError(400, `Minimum order amount is NPR ${coupon.minOrderAmount / 100}`)
    }

    let discountAmount = 0
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = Math.floor((cartTotal * coupon.value) / 100)
      if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount)
    } else if (coupon.type === 'FIXED') {
      discountAmount = coupon.value
    } else if (coupon.type === 'FREE_SHIPPING') {
      discountAmount = 0 // handled at order level
    }

    res.json({
      success: true,
      data: {
        couponId: coupon.id,
        type: coupon.type,
        discountAmount,
        message: `Coupon applied! You save NPR ${discountAmount / 100}`,
      },
    })
  } catch (err) {
    next(err)
  }
})
