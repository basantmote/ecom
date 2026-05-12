import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '@ecom/db'
import { AuthTokens, TokenPayload } from '@ecom/types'
import { AppError } from '../../middleware/error.middleware'
import { sendSms } from '../../lib/sms'
import { redis } from '../../lib/redis'
import { RegisterInput, LoginInput } from './auth.schema'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m'
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'

// ─── Brute-force helpers ──────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5
const MAX_OTP_SEND = 5
const MAX_OTP_VERIFY = 10
const LOCKOUT_TTL = 15 * 60      // 15 minutes
const OTP_SEND_WINDOW = 60 * 60  // 1 hour

async function checkBruteForce(key: string, max: number, label: string): Promise<void> {
  const attempts = await redis.get(key)
  if (attempts && parseInt(attempts) >= max) {
    throw new AppError(429, `Too many ${label} attempts. Please try again later.`)
  }
}

async function recordAttempt(key: string, windowSec: number): Promise<void> {
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, windowSec)
}

async function clearAttempts(key: string): Promise<void> {
  await redis.del(key)
}

// ─── Auth functions ───────────────────────────────────────────────────────────
export async function register(input: RegisterInput): Promise<AuthTokens> {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        input.email ? { email: input.email } : {},
        input.phone ? { phone: input.phone } : {},
      ],
    },
  })
  if (existing) throw new AppError(409, 'User already exists with this email or phone')

  const passwordHash = await bcrypt.hash(input.password, 12)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      passwordHash,
      status: 'ACTIVE',
      profile: {
        create: { fullName: input.fullName },
      },
      credits: {
        create: { balance: 0 },
      },
    },
  })

  return generateTokens(user.id, user.role)
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const identifier = input.email ?? input.phone ?? ''
  const attemptKey = `bf:login:${identifier}`

  await checkBruteForce(attemptKey, MAX_LOGIN_ATTEMPTS, 'login')

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        input.email ? { email: input.email } : {},
        input.phone ? { phone: input.phone } : {},
      ],
    },
  })

  if (!user || !user.passwordHash) {
    await recordAttempt(attemptKey, LOCKOUT_TTL)
    throw new AppError(401, 'Invalid credentials')
  }

  if (user.status === 'SUSPENDED') throw new AppError(403, 'Account suspended')

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) {
    await recordAttempt(attemptKey, LOCKOUT_TTL)
    throw new AppError(401, 'Invalid credentials')
  }

  await clearAttempts(attemptKey)
  return generateTokens(user.id, user.role)
}

export async function refresh(token: string): Promise<AuthTokens> {
  let payload: TokenPayload
  try {
    payload = jwt.verify(token, REFRESH_SECRET) as TokenPayload
  } catch {
    throw new AppError(401, 'Invalid refresh token')
  }

  const tokenHash = hashToken(token)
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } })

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token expired or revoked')
  }

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } })

  const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.sub } })
  return generateTokens(user.id, user.role)
}

export async function logout(accessToken: string, refreshToken?: string): Promise<void> {
  // Blacklist access token in Redis until it naturally expires
  try {
    const payload = jwt.decode(accessToken) as (TokenPayload & { exp?: number }) | null
    if (payload?.exp) {
      const ttl = payload.exp - Math.floor(Date.now() / 1000)
      if (ttl > 0) {
        await redis.setex(`bl:${hashToken(accessToken)}`, ttl, '1')
      }
    }
  } catch { /* token may already be invalid — still proceed */ }

  // Revoke refresh token in DB
  if (refreshToken) {
    const rHash = hashToken(refreshToken)
    await prisma.refreshToken.updateMany({
      where: { tokenHash: rHash, revoked: false },
      data: { revoked: true },
    })
  }
}

export async function generateTokens(userId: string, role: string): Promise<AuthTokens> {
  const accessToken = jwt.sign({ sub: userId, role }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  } as jwt.SignOptions)

  const refreshToken = jwt.sign({ sub: userId, role }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  } as jwt.SignOptions)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  })

  return { accessToken, refreshToken }
}

export async function sendOtp(phone: string): Promise<void> {
  const sendKey = `bf:otp:send:${phone}`
  await checkBruteForce(sendKey, MAX_OTP_SEND, 'OTP send')

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.otpVerification.create({
    data: { phone, code, expiresAt },
  })

  await recordAttempt(sendKey, OTP_SEND_WINDOW)
  await sendSms(phone, `Your EcomNP OTP is: ${code}. Valid for 10 minutes. Do not share this code.`)
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const verifyKey = `bf:otp:verify:${phone}`
  await checkBruteForce(verifyKey, MAX_OTP_VERIFY, 'OTP verify')

  const otp = await prisma.otpVerification.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) {
    await recordAttempt(verifyKey, LOCKOUT_TTL)
    throw new AppError(400, 'Invalid or expired OTP')
  }

  await prisma.otpVerification.update({ where: { id: otp.id }, data: { verified: true } })
  await clearAttempts(verifyKey)

  await prisma.user.updateMany({
    where: { phone, status: 'PENDING_VERIFICATION' },
    data: { status: 'ACTIVE' },
  })

  return true
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
