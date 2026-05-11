import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../lib/logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {}
    err.errors.forEach((e) => {
      const key = e.path.join('.')
      errors[key] = [...(errors[key] ?? []), e.message]
    })
    return res.status(422).json({ success: false, errors })
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message })
  }

  logger.error(err)
  return res.status(500).json({ success: false, message: 'Internal server error' })
}
