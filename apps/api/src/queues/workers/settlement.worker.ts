import { Worker, Job } from 'bullmq'
import { prisma } from '@ecom/db'
import { redis } from '../../lib/redis'
import { logger } from '../../lib/logger'
import { SettlementJobData } from '../index'

async function processSettlementJob(job: Job<SettlementJobData>) {
  const { vendorId, periodStart, periodEnd } = job.data
  const start = new Date(periodStart)
  const end = new Date(periodEnd)

  const whereVendor = vendorId ? { id: vendorId } : { status: 'APPROVED' as const }
  const vendors = await prisma.vendor.findMany({ where: whereVendor })

  let created = 0
  for (const vendor of vendors) {
    const items = await prisma.orderItem.findMany({
      where: {
        vendorId: vendor.id,
        status: 'DELIVERED',
        order: {
          createdAt: { gte: start, lte: end },
          paymentStatus: 'SUCCESS',
        },
        settlementItem: null,
      },
    })
    if (items.length === 0) continue

    const grossAmount = items.reduce((sum, i) => sum + i.totalPrice, 0)
    const commissionAmount = Math.floor((grossAmount * vendor.commissionRate) / 100)
    const netAmount = grossAmount - commissionAmount

    await prisma.vendorSettlement.create({
      data: {
        vendorId: vendor.id,
        periodStart: start,
        periodEnd: end,
        grossAmount,
        commissionAmount,
        netAmount,
        settlementItems: {
          create: items.map((item) => {
            const commission = Math.floor((item.totalPrice * vendor.commissionRate) / 100)
            return {
              orderItemId: item.id,
              gross: item.totalPrice,
              commission,
              net: item.totalPrice - commission,
            }
          }),
        },
      },
    })
    created++
    logger.info(`Settlement created for vendor ${vendor.id}: gross=${grossAmount} net=${netAmount}`)
  }

  return { created }
}

export function startSettlementWorker() {
  const worker = new Worker<SettlementJobData>('settlements', processSettlementJob, {
    connection: redis,
    concurrency: 1,
  })

  worker.on('completed', (job, result) =>
    logger.info(`Settlement job ${job.id} done — ${result.created} settlements created`),
  )
  worker.on('failed', (job, err) =>
    logger.error(`Settlement job ${job?.id} failed: ${err.message}`),
  )

  return worker
}
