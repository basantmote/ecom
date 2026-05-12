import { Redis } from 'ioredis'
import { logger } from './logger'

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379'

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
})

redis.on('error', (err) => logger.error('Redis error:', err))
redis.on('connect', () => logger.info('Redis connected'))

// Creates an independent connection — needed for pub/sub (Socket.io adapter)
// and any context where the main client can't be shared
export function createRedisClient() {
  return new Redis(REDIS_URL, { maxRetriesPerRequest: null })
}
