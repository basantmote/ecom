import { Worker, Job } from 'bullmq'
import { prisma } from '@ecom/db'
import { redis } from '../../lib/redis'
import { logger } from '../../lib/logger'
import { FlashSaleJobData } from '../index'

async function processFlashSaleJob(job: Job<FlashSaleJobData>) {
  const { type, flashSaleId } = job.data

  if (type === 'activate') {
    const sale = await prisma.flashSale.findUnique({
      where: { id: flashSaleId },
      include: { items: true },
    })
    if (!sale) throw new Error(`Flash sale ${flashSaleId} not found`)

    // Seed Redis stock counters for each item
    const pipeline = redis.pipeline()
    for (const item of sale.items) {
      const key = `flash_sale:${sale.id}:stock:${item.id}`
      pipeline.set(key, item.stockLimit - item.soldCount)
      // Expire key 1 hour after sale ends to allow final reads
      const ttlSeconds = Math.ceil((sale.endTime.getTime() - Date.now()) / 1000) + 3600
      pipeline.expire(key, Math.max(ttlSeconds, 3600))
    }
    await pipeline.exec()

    await prisma.flashSale.update({
      where: { id: flashSaleId },
      data: { status: 'ACTIVE' },
    })

    logger.info(`Flash sale ${flashSaleId} activated — ${sale.items.length} items seeded in Redis`)
  }

  if (type === 'deactivate') {
    await prisma.flashSale.update({
      where: { id: flashSaleId },
      data: { status: 'ENDED' },
    })

    const sale = await prisma.flashSale.findUnique({
      where: { id: flashSaleId },
      include: { items: true },
    })
    if (sale) {
      const keys = sale.items.map((item) => `flash_sale:${sale.id}:stock:${item.id}`)
      if (keys.length) await redis.del(...keys)
    }

    logger.info(`Flash sale ${flashSaleId} deactivated`)
  }
}

export function startFlashSaleWorker() {
  const worker = new Worker<FlashSaleJobData>('flash-sales', processFlashSaleJob, {
    connection: redis,
    concurrency: 2,
  })

  worker.on('completed', (job) => logger.info(`Flash sale job ${job.id} completed`))
  worker.on('failed', (job, err) =>
    logger.error(`Flash sale job ${job?.id} failed: ${err.message}`),
  )

  return worker
}
