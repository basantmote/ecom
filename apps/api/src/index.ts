import { resolve } from 'path'
import { config } from 'dotenv'
config({ path: resolve(__dirname, '../../../.env') })
import http from 'http'
import { app } from './app'
import { initSocket } from './sockets/tracking.socket'
import { startFlashSaleWorker } from './queues/workers/flashSale.worker'
import { startSettlementWorker } from './queues/workers/settlement.worker'
import { startScheduler } from './queues/scheduler'
import { logger } from './lib/logger'
import { redis } from './lib/redis'
import { prisma } from '@ecom/db'

const PORT = process.env.PORT ?? 4000

const server = http.createServer(app)

initSocket(server)
const flashSaleWorker = startFlashSaleWorker()
const settlementWorker = startSettlementWorker()
startScheduler()

server.listen(PORT, () => {
  logger.info(`API server running on http://localhost:${PORT}`)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason)
  process.exit(1)
})

// ─── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`)

  // Stop accepting new connections
  server.close(async () => {
    try {
      // Drain BullMQ workers
      await Promise.all([
        flashSaleWorker?.close(),
        settlementWorker?.close(),
      ])

      // Close Redis and Prisma connections
      await redis.quit()
      await prisma.$disconnect()

      logger.info('Graceful shutdown complete')
      process.exit(0)
    } catch (err) {
      logger.error('Error during shutdown:', err)
      process.exit(1)
    }
  })

  // Force kill after 30s if still hanging
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
