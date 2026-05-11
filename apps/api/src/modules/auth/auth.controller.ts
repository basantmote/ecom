import { Request, Response, NextFunction } from 'express'
import {
  register,
  login,
  refresh,
  sendOtp,
  verifyOtp,
} from './auth.service'
import {
  registerSchema,
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  refreshSchema,
} from './auth.schema'

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { body } = registerSchema.parse({ body: req.body })
    const tokens = await register(body)
    res.status(201).json({ success: true, data: tokens })
  } catch (err) {
    next(err)
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { body } = loginSchema.parse({ body: req.body })
    const tokens = await login(body)
    res.json({ success: true, data: tokens })
  } catch (err) {
    next(err)
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { body } = refreshSchema.parse({ body: req.body })
    const tokens = await refresh(body.refreshToken)
    res.json({ success: true, data: tokens })
  } catch (err) {
    next(err)
  }
}

export async function otpSendHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { body } = otpSendSchema.parse({ body: req.body })
    await sendOtp(body.phone)
    res.json({ success: true, message: 'OTP sent successfully' })
  } catch (err) {
    next(err)
  }
}

export async function otpVerifyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { body } = otpVerifySchema.parse({ body: req.body })
    await verifyOtp(body.phone, body.code)
    res.json({ success: true, message: 'Phone verified successfully' })
  } catch (err) {
    next(err)
  }
}
