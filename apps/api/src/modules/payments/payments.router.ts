import { Router } from 'express'
import { prisma } from '@ecom/db'
import { authenticate } from '../../middleware/auth.middleware'
import { AppError } from '../../middleware/error.middleware'
import { buildEsewaParams, verifyEsewaPayment, ESEWA_PAYMENT_URL } from './esewa.service'
import { initiateKhaltiPayment, verifyKhaltiPayment } from './khalti.service'
import { z } from 'zod'

export const paymentsRouter = Router()

// ─── eSewa ────────────────────────────────────────────────────────────────────

paymentsRouter.post('/esewa/initiate', authenticate, async (req, res, next) => {
  try {
    const { orderId } = z.object({ orderId: z.string() }).parse(req.body)

    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: req.user!.sub, paymentStatus: 'PENDING' },
    })
    if (!order) throw new AppError(404, 'Order not found')

    const params = buildEsewaParams(order.id, order.total, order.deliveryFee)

    // Create pending payment transaction
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        method: 'ESEWA',
        amount: order.total,
        status: 'PENDING',
        gatewayRef: order.id,
      },
    })

    res.json({
      success: true,
      data: {
        paymentUrl: ESEWA_PAYMENT_URL,
        params,
      },
    })
  } catch (err) {
    next(err)
  }
})

paymentsRouter.get('/esewa/callback', async (req, res, next) => {
  try {
    const { data: encodedData } = req.query as { data: string }
    if (!encodedData) throw new AppError(400, 'Missing payment data')

    const decoded = JSON.parse(Buffer.from(encodedData, 'base64').toString()) as {
      transaction_uuid: string
      total_amount: string
    }
    const orderId = decoded.transaction_uuid
    const totalAmount = Number(decoded.total_amount.replace(',', ''))

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw new AppError(404, 'Order not found')

    const isValid = await verifyEsewaPayment(totalAmount, orderId, encodedData)

    if (isValid) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED', paymentStatus: 'SUCCESS' },
        }),
        prisma.paymentTransaction.updateMany({
          where: { orderId, method: 'ESEWA' },
          data: { status: 'SUCCESS', gatewayResponse: decoded as object },
        }),
        prisma.orderStatusLog.create({
          data: { orderId, fromStatus: 'PENDING', toStatus: 'CONFIRMED', note: 'eSewa payment confirmed' },
        }),
      ])

      return res.redirect(`${process.env.WEB_URL}/orders/${orderId}?payment=success`)
    } else {
      await prisma.paymentTransaction.updateMany({
        where: { orderId, method: 'ESEWA' },
        data: { status: 'FAILED' },
      })
      return res.redirect(`${process.env.WEB_URL}/orders/${orderId}?payment=failed`)
    }
  } catch (err) {
    next(err)
  }
})

// ─── Khalti ───────────────────────────────────────────────────────────────────

paymentsRouter.post('/khalti/initiate', authenticate, async (req, res, next) => {
  try {
    const { orderId } = z.object({ orderId: z.string() }).parse(req.body)

    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: req.user!.sub },
      include: { customer: { include: { profile: true } } },
    })
    if (!order) throw new AppError(404, 'Order not found')

    const result = await initiateKhaltiPayment({
      return_url: `${process.env.KHALTI_RETURN_URL}?orderId=${orderId}`,
      website_url: process.env.WEB_URL!,
      amount: order.total,
      purchase_order_id: order.id,
      purchase_order_name: `Order #${order.id.slice(-8).toUpperCase()}`,
      customer_info: {
        name: order.customer.profile?.fullName ?? 'Customer',
        email: order.customer.email ?? undefined,
        phone: order.customer.phone ?? '',
      },
    })

    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        method: 'KHALTI',
        amount: order.total,
        status: 'PENDING',
        gatewayRef: result.pidx,
      },
    })

    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

paymentsRouter.post('/khalti/verify', authenticate, async (req, res, next) => {
  try {
    const { pidx, orderId } = z.object({ pidx: z.string(), orderId: z.string() }).parse(req.body)

    const verification = await verifyKhaltiPayment(pidx)

    if (verification.status === 'Completed') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED', paymentStatus: 'SUCCESS' },
        }),
        prisma.paymentTransaction.updateMany({
          where: { orderId, gatewayRef: pidx },
          data: {
            status: 'SUCCESS',
            gatewayRef: verification.transaction_id,
            gatewayResponse: verification as object,
          },
        }),
        prisma.orderStatusLog.create({
          data: {
            orderId,
            fromStatus: 'PENDING',
            toStatus: 'CONFIRMED',
            note: 'Khalti payment confirmed',
          },
        }),
      ])
      res.json({ success: true, message: 'Payment confirmed' })
    } else {
      res.status(400).json({ success: false, message: `Payment ${verification.status}` })
    }
  } catch (err) {
    next(err)
  }
})
