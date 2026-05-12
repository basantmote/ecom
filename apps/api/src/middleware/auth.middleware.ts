import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Role } from '@ecom/db'
import { TokenPayload } from '@ecom/types'
import { AppError } from './error.middleware'
import { redis } from '../lib/redis'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return next(new AppError(401, 'Authentication required'))

    // Reject blacklisted tokens (set on logout)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const blacklisted = await redis.exists(`bl:${tokenHash}`)
    if (blacklisted) return next(new AppError(401, 'Token has been revoked'))

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload
    req.user = payload
    next()
  } catch {
    next(new AppError(401, 'Invalid or expired token'))
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, 'Authentication required'))
    if (!roles.includes(req.user.role as Role)) {
      return next(new AppError(403, 'Insufficient permissions'))
    }
    next()
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload
    } catch {
      // ignore — optional auth, proceed as guest
    }
  }
  next()
}
