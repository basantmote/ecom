import { Router } from 'express'
import { prisma } from '@ecom/db'
import { optionalAuth, authenticate } from '../../middleware/auth.middleware'
import { AppError } from '../../middleware/error.middleware'
import { z } from 'zod'

export const cartRouter = Router()

const addItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().min(1),
  flashSaleItemId: z.string().optional(),
})

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    })
  }
  if (sessionId) {
    return prisma.cart.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    })
  }
  throw new AppError(400, 'User or session required')
}

cartRouter.get('/', optionalAuth, async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] as string | undefined
    const cart = await getOrCreateCart(req.user?.sub, sessionId)
    res.json({ success: true, data: cart })
  } catch (err) {
    next(err)
  }
})

cartRouter.post('/items', optionalAuth, async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] as string | undefined
    const { variantId, quantity, flashSaleItemId } = addItemSchema.parse(req.body)

    const variant = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variantId },
      include: { product: { select: { vendorId: true, status: true } } },
    })
    if (variant.product.status !== 'ACTIVE') throw new AppError(400, 'Product not available')
    if (variant.stock - variant.reservedStock < quantity)
      throw new AppError(400, 'Insufficient stock')

    const cart = await getOrCreateCart(req.user?.sub, sessionId)

    const item = await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      update: { quantity },
      create: {
        cartId: cart.id,
        variantId,
        vendorId: variant.product.vendorId,
        quantity,
        flashSaleItemId,
      },
    })

    res.status(201).json({ success: true, data: item })
  } catch (err) {
    next(err)
  }
})

cartRouter.put('/items/:id', optionalAuth, async (req, res, next) => {
  try {
    const { quantity } = z.object({ quantity: z.number().int().min(0) }).parse(req.body)
    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: req.params['id'] } })
      return res.json({ success: true, message: 'Item removed' })
    }
    const item = await prisma.cartItem.update({
      where: { id: req.params['id'] },
      data: { quantity },
    })
    return res.json({ success: true, data: item })
  } catch (err) {
    next(err)
  }
})

cartRouter.delete('/items/:id', optionalAuth, async (req, res, next) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params['id'] } })
    res.json({ success: true, message: 'Item removed' })
  } catch (err) {
    next(err)
  }
})

// Merge guest cart into user cart after login
cartRouter.post('/merge', authenticate, async (req, res, next) => {
  try {
    const { sessionId } = z.object({ sessionId: z.string() }).parse(req.body)
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    })
    if (!guestCart) return res.json({ success: true, message: 'Nothing to merge' })

    const userCart = await prisma.cart.upsert({
      where: { userId: req.user!.sub },
      update: {},
      create: { userId: req.user!.sub },
    })

    for (const item of guestCart.items) {
      await prisma.cartItem.upsert({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
        update: { quantity: item.quantity },
        create: {
          cartId: userCart.id,
          variantId: item.variantId,
          vendorId: item.vendorId,
          quantity: item.quantity,
        },
      })
    }

    await prisma.cart.delete({ where: { id: guestCart.id } })
    return res.json({ success: true, message: 'Cart merged' })
  } catch (err) {
    next(err)
  }
})
