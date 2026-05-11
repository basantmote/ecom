import { Router } from 'express'
import { Prisma, prisma } from '@ecom/db'
import { authenticate } from '../../middleware/auth.middleware'
import { AppError } from '../../middleware/error.middleware'
import { z } from 'zod'

export const ordersRouter = Router()

ordersRouter.use(authenticate)

const createOrderSchema = z.object({
  addressId: z.string().optional(),
  deliveryAddress: z.object({
    label: z.string(),
    street: z.string(),
    city: z.string(),
    province: z.string(),
    postalCode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    recipientName: z.string(),
    recipientPhone: z.string(),
  }),
  paymentMethod: z.enum(['ESEWA', 'KHALTI', 'COD', 'CREDIT']),
  couponCode: z.string().optional(),
  useCredits: z.boolean().default(false),
  notes: z.string().optional(),
})

ordersRouter.post('/', async (req, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body)
    const userId = req.user!.sub

    // Fetch cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: true,
            flashSaleItem: true,
          },
        },
      },
    })
    if (!cart || cart.items.length === 0) throw new AppError(400, 'Cart is empty')

    // Calculate totals
    let subtotal = 0
    const orderItemsData: {
      vendorId: string
      variantId: string
      quantity: number
      unitPrice: number
      totalPrice: number
      flashSaleItemId: string | null | undefined
    }[] = []

    for (const item of cart.items) {
      const price = item.flashSaleItem ? item.flashSaleItem.salePrice : item.variant.price
      const total = price * item.quantity
      subtotal += total

      // Check stock
      const available = item.variant.stock - item.variant.reservedStock
      if (available < item.quantity) {
        throw new AppError(400, `Insufficient stock for SKU: ${item.variant.sku}`)
      }

      orderItemsData.push({
        vendorId: item.vendorId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: total,
        flashSaleItemId: item.flashSaleItemId,
      })
    }

    // Validate & apply coupon
    let discountAmount = 0
    let couponId: string | undefined

    if (body.couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: body.couponCode } })
      if (!coupon || !coupon.isActive || coupon.validUntil < new Date()) {
        throw new AppError(400, 'Invalid or expired coupon')
      }
      if (subtotal < coupon.minOrderAmount) {
        throw new AppError(400, `Minimum order amount is NPR ${coupon.minOrderAmount / 100}`)
      }

      if (coupon.type === 'PERCENTAGE') {
        discountAmount = Math.floor((subtotal * coupon.value) / 100)
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount)
        }
      } else if (coupon.type === 'FIXED') {
        discountAmount = coupon.value
      }
      couponId = coupon.id
    }

    // Apply credits
    let creditsUsed = 0
    if (body.useCredits && body.paymentMethod !== 'CREDIT') {
      const credits = await prisma.customerCredit.findUnique({ where: { userId } })
      if (credits && credits.balance > 0) {
        creditsUsed = Math.min(credits.balance, subtotal - discountAmount)
      }
    }

    const deliveryFee = 100 * 100 // NPR 100 flat for now (in paisa)
    const total = subtotal - discountAmount - creditsUsed + deliveryFee

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: userId,
          addressId: body.addressId,
          deliveryAddress: body.deliveryAddress as unknown as Prisma.InputJsonValue,
          subtotal,
          discountAmount,
          creditsUsed,
          deliveryFee,
          total,
          paymentMethod: body.paymentMethod,
          couponId,
          notes: body.notes,
          items: { create: orderItemsData },
        },
        include: { items: true },
      })

      // Reserve stock
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { increment: item.quantity } },
        })
      }

      // Deduct credits
      if (creditsUsed > 0) {
        await tx.customerCredit.update({
          where: { userId },
          data: { balance: { decrement: creditsUsed } },
        })
        await tx.creditTransaction.create({
          data: {
            userId,
            amount: -creditsUsed,
            type: 'SPENT',
            referenceType: 'ORDER',
            referenceId: newOrder.id,
          },
        })
      }

      // Record coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        })
        await tx.couponUsage.create({
          data: {
            couponId,
            userId,
            orderId: newOrder.id,
            discountApplied: discountAmount,
          },
        })
      }

      // Log status
      await tx.orderStatusLog.create({
        data: {
          orderId: newOrder.id,
          toStatus: 'PENDING',
          note: 'Order created',
          changedById: userId,
        },
      })

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    res.status(201).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

ordersRouter.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params['id'], customerId: req.user!.sub },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        statusLogs: { orderBy: { createdAt: 'asc' } },
        deliveryAssignment: { include: { partner: { include: { user: { select: { profile: true } } } } } },
        paymentTransactions: true,
      },
    })
    if (!order) throw new AppError(404, 'Order not found')
    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

ordersRouter.get('/:id/tracking', async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params['id'], customerId: req.user!.sub },
      include: {
        deliveryAssignment: {
          include: {
            tracking: { orderBy: { timestamp: 'desc' }, take: 50 },
            partner: {
              select: {
                vehicleType: true,
                currentLat: true,
                currentLng: true,
                user: { select: { phone: true, profile: true } },
              },
            },
          },
        },
        statusLogs: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!order) throw new AppError(404, 'Order not found')
    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

ordersRouter.post('/:id/cancel', async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params['id'], customerId: req.user!.sub },
      include: { items: true },
    })
    if (!order) throw new AppError(404, 'Order not found')

    const cancellableStatuses = ['PENDING', 'CONFIRMED']
    if (!cancellableStatuses.includes(order.status)) {
      throw new AppError(400, 'Order cannot be cancelled at this stage')
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })

      // Release reserved stock
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { reservedStock: { decrement: item.quantity } },
        })
      }

      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: 'CANCELLED',
          note: 'Cancelled by customer',
          changedById: req.user!.sub,
        },
      })
    })

    res.json({ success: true, message: 'Order cancelled' })
  } catch (err) {
    next(err)
  }
})
