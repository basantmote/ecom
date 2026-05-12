import { Router, Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '@ecom/db'

export const webhooksRouter = Router()

// Minimal Zod schema — validates structure without over-constraining Meta's payload
const whatsAppPayloadSchema = z.object({
  entry: z.array(z.object({
    changes: z.array(z.object({
      value: z.object({
        messages: z.array(z.object({
          from: z.string(),
          id: z.string(),
          timestamp: z.string(),
          text: z.object({ body: z.string() }).optional(),
        })).optional(),
      }),
    })),
  })).optional(),
})

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
    // Verify HMAC-SHA256 signature from Meta
    const appSecret = process.env.WHATSAPP_APP_SECRET
    if (appSecret) {
      const signature = req.headers['x-hub-signature-256'] as string | undefined
      if (!signature) return res.sendStatus(403)

      const expected = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(req.body as Buffer)
        .digest('hex')

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return res.sendStatus(403)
      }
    }

    // Parse raw buffer body
    const rawBody = (req.body as Buffer).toString('utf-8')
    const parsed = JSON.parse(rawBody)

    const result = whatsAppPayloadSchema.safeParse(parsed)
    if (!result.success) {
      // Always return 200 to Meta to prevent retries for malformed payloads
      return res.sendStatus(200)
    }

    const body = result.data

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
