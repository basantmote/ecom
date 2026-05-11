import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Role } from '@ecom/db'
import { TokenPayload } from '@ecom/types'
import { AppError } from './error.middleware'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) throw new AppError(401, 'Authentication required')

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload
    req.user = payload
    next()
  } catch {
    throw new AppError(401, 'Invalid or expired token')
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, 'Authentication required')
    if (!roles.includes(req.user.role as Role)) {
      throw new AppError(403, 'Insufficient permissions')
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
