import cron from 'node-cron'
import { prisma } from '@ecom/db'
import { flashSaleQueue } from './index'
import { logger } from '../lib/logger'

// Runs every minute — checks for flash sales that should activate or deactivate
export function startScheduler() {
  cron.schedule('* * * * *', async () => {
    const now = new Date()

    // Activate scheduled sales whose start time has passed
    const toActivate = await prisma.flashSale.findMany({
      where: { status: 'SCHEDULED', startTime: { lte: now } },
    })
    for (const sale of toActivate) {
      await flashSaleQueue.add('activate', { type: 'activate', flashSaleId: sale.id })
      logger.info(`Queued activation for flash sale ${sale.id}`)
    }

    // Deactivate active sales whose end time has passed
    const toDeactivate = await prisma.flashSale.findMany({
      where: { status: 'ACTIVE', endTime: { lte: now } },
    })
    for (const sale of toDeactivate) {
      await flashSaleQueue.add('deactivate', { type: 'deactivate', flashSaleId: sale.id })
      logger.info(`Queued deactivation for flash sale ${sale.id}`)
    }
  })

  logger.info('Flash sale scheduler started')
}
