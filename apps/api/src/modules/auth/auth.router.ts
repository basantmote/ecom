import { Router } from 'express'
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  otpSendHandler,
  otpVerifyHandler,
} from './auth.controller'
import { authenticate } from '../../middleware/auth.middleware'

export const authRouter = Router()

authRouter.post('/register', registerHandler)
authRouter.post('/login', loginHandler)
authRouter.post('/token/refresh', refreshHandler)
authRouter.post('/logout', authenticate, logoutHandler)
authRouter.post('/otp/send', otpSendHandler)
authRouter.post('/otp/verify', otpVerifyHandler)
