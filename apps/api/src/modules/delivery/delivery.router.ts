import { Router } from 'express'
import { prisma } from '@ecom/db'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { AppError } from '../../middleware/error.middleware'
import { z } from 'zod'

export const deliveryRouter = Router()

deliveryRouter.use(authenticate, authorize('DELIVERY'))

deliveryRouter.get('/assignments', async (req, res, next) => {
  try {
    const partner = await prisma.deliveryPartner.findUnique({ where: { userId: req.user!.sub } })
    if (!partner) throw new AppError(404, 'Delivery partner profile not found')

    const assignments = await prisma.deliveryAssignment.findMany({
      where: { partnerId: partner.id },
      include: {
        order: {
          include: {
            items: { include: { variant: { include: { product: true } } } },
            customer: { select: { phone: true, profile: true } },
          },
        },
        tracking: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
      orderBy: { assignedAt: 'desc' },
    })

    res.json({ success: true, data: assignments })
  } catch (err) {
    next(err)
  }
})

deliveryRouter.post('/assignments/:id/accept', async (req, res, next) => {
  try {
    const partner = await prisma.deliveryPartner.findUnique({ where: { userId: req.user!.sub } })
    if (!partner) throw new AppError(404, 'Delivery partner not found')

    const assignment = await prisma.deliveryAssignment.findFirst({
      where: { id: req.params['id'], partnerId: partner.id, status: 'ASSIGNED' },
    })
    if (!assignment) throw new AppError(404, 'Assignment not found')

    await prisma.$transaction([
      prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      }),
      prisma.deliveryPartner.update({
        where: { id: partner.id },
        data: { status: 'BUSY' },
      }),
    ])

    res.json({ success: true, message: 'Assignment accepted' })
  } catch (err) {
    next(err)
  }
})

const statusSchema = z.object({
  status: z.enum(['PICKED_UP', 'DELIVERED', 'FAILED']),
  otp: z.string().optional(),
})

deliveryRouter.post('/assignments/:id/status', async (req, res, next) => {
  try {
    const partner = await prisma.deliveryPartner.findUnique({ where: { userId: req.user!.sub } })
    if (!partner) throw new AppError(404, 'Delivery partner not found')

    const { status, otp } = statusSchema.parse(req.body)
    const assignment = await prisma.deliveryAssignment.findFirst({
      where: { id: req.params['id'], partnerId: partner.id },
    })
    if (!assignment) throw new AppError(404, 'Assignment not found')

    if (status === 'PICKED_UP') {
      if (assignment.pickupOtp && assignment.pickupOtp !== otp) {
        throw new AppError(400, 'Invalid pickup OTP')
      }
      await prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: { status: 'PICKED_UP', pickedAt: new Date() },
      })
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { status: 'IN_TRANSIT' },
      })
    }

    if (status === 'DELIVERED') {
      if (assignment.deliveryOtp && assignment.deliveryOtp !== otp) {
        throw new AppError(400, 'Invalid delivery OTP')
      }
      await prisma.$transaction([
        prisma.deliveryAssignment.update({
          where: { id: assignment.id },
          data: { status: 'DELIVERED', deliveredAt: new Date() },
        }),
        prisma.order.update({
          where: { id: assignment.orderId },
          data: { status: 'DELIVERED' },
        }),
        prisma.deliveryPartner.update({
          where: { id: partner.id },
          data: { status: 'AVAILABLE' },
        }),
      ])
    }

    res.json({ success: true, message: `Status updated to ${status}` })
  } catch (err) {
    next(err)
  }
})

deliveryRouter.put('/location', async (req, res, next) => {
  try {
    const { lat, lng } = z.object({ lat: z.number(), lng: z.number() }).parse(req.body)
    await prisma.deliveryPartner.update({
      where: { userId: req.user!.sub },
      data: { currentLat: lat, currentLng: lng },
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
