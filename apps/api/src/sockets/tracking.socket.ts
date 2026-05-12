import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import jwt from 'jsonwebtoken'
import { prisma } from '@ecom/db'
import { TokenPayload, TrackingUpdate } from '@ecom/types'
import { logger } from '../lib/logger'
import { createRedisClient } from '../lib/redis'

let io: SocketServer

export function initSocket(server: HttpServer) {
  io = new SocketServer(server, {
    cors: {
      origin: [
        process.env.WEB_URL ?? 'http://localhost:3000',
        process.env.DELIVERY_URL ?? 'http://localhost:3003',
      ],
      credentials: true,
    },
  })

  // Redis adapter — enables horizontal scaling across multiple API pods
  const pubClient = createRedisClient()
  const subClient = createRedisClient()
  pubClient.on('error', (err) => logger.error('Socket.io pub client error:', err))
  subClient.on('error', (err) => logger.error('Socket.io sub client error:', err))
  io.adapter(createAdapter(pubClient, subClient))

  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined
    if (!token) return next(new Error('Unauthorized'))

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload
      socket.data['user'] = payload
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data['user'] as TokenPayload
    logger.debug(`Socket connected: ${user.sub} (${user.role})`)

    // Customer: subscribe to order room for live updates
    socket.on('track:order', (orderId: string) => {
      socket.join(`order:${orderId}`)
      logger.debug(`User ${user.sub} joined order room: ${orderId}`)
    })

    socket.on('track:leave', (orderId: string) => {
      socket.leave(`order:${orderId}`)
    })

    // Delivery partner: broadcast location
    socket.on('delivery:location', async (update: TrackingUpdate) => {
      if (user.role !== 'DELIVERY') return

      await prisma.deliveryTracking.create({
        data: {
          assignmentId: update.assignmentId,
          lat: update.lat,
          lng: update.lng,
          status: update.status,
        },
      })

      await prisma.deliveryPartner.update({
        where: { userId: user.sub },
        data: { currentLat: update.lat, currentLng: update.lng },
      })

      // Broadcast to the order room
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { id: update.assignmentId },
        select: { orderId: true },
      })
      if (assignment) {
        io.to(`order:${assignment.orderId}`).emit('delivery:location', update)
      }
    })

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${user.sub}`)
    })
  })

  return io
}

export function getIo() {
  return io
}

export function emitOrderStatusUpdate(orderId: string, status: string) {
  if (io) {
    io.to(`order:${orderId}`).emit('order:status', { orderId, status, ts: new Date().toISOString() })
  }
}
