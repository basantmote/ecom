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

const PORT = process.env.PORT ?? 4000

const server = http.createServer(app)

initSocket(server)
startFlashSaleWorker()
startSettlementWorker()
startScheduler()

server.listen(PORT, () => {
  logger.info(`API server running on http://localhost:${PORT}`)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason)
  process.exit(1)
})
