import { Queue } from 'bullmq'
import { redis } from '../lib/redis'

const connection = redis

export const flashSaleQueue = new Queue('flash-sales', { connection })
export const settlementQueue = new Queue('settlements', { connection })

export type FlashSaleJobData =
  | { type: 'activate'; flashSaleId: string }
  | { type: 'deactivate'; flashSaleId: string }

export type SettlementJobData = {
  vendorId?: string
  periodStart: string
  periodEnd: string
}
