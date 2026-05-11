import { Router } from 'express'
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  otpSendHandler,
  otpVerifyHandler,
} from './auth.controller'

export const authRouter = Router()

authRouter.post('/register', registerHandler)
authRouter.post('/login', loginHandler)
authRouter.post('/token/refresh', refreshHandler)
authRouter.post('/otp/send', otpSendHandler)
authRouter.post('/otp/verify', otpVerifyHandler)
