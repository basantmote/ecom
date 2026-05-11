import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '@ecom/db'
import { WhatsAppWebhookPayload } from '@ecom/types'

export const webhooksRouter = Router()

// WhatsApp webhook verification (Meta requires GET)
webhooksRouter.get('/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge)
  } else {
    res.sendStatus(403)
  }
})

// Incoming WhatsApp messages
webhooksRouter.post('/whatsapp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as WhatsAppWebhookPayload

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const message of change.value.messages ?? []) {
          const phone = message.from
          const text = message.text?.body?.trim() ?? ''

          await prisma.whatsAppMessage.create({
            data: {
              phone,
              direction: 'INBOUND',
              body: text,
              messageId: message.id,
              timestamp: new Date(Number(message.timestamp) * 1000),
            },
          })

          // Simple feedback handler: if message is a number 1-5, treat as rating
          const rating = parseInt(text)
          if (!isNaN(rating) && rating >= 1 && rating <= 5) {
            const user = await prisma.user.findUnique({ where: { phone } })
            if (user) {
              // Find their most recent delivered order without a review
              const recentOrderItem = await prisma.orderItem.findFirst({
                where: {
                  order: { customerId: user.id, status: 'DELIVERED' },
                  review: null,
                },
                orderBy: { order: { createdAt: 'desc' } },
                include: { variant: { include: { product: true } } },
              })

              if (recentOrderItem) {
                await prisma.productReview.create({
                  data: {
                    productId: recentOrderItem.variant.productId,
                    userId: user.id,
                    orderItemId: recentOrderItem.id,
                    rating,
                    status: 'APPROVED',
                  },
                })
              }
            }
          }
        }
      }
    }

    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
})
