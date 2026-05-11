import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '@ecom/db'
import { AuthTokens, TokenPayload } from '@ecom/types'
import { AppError } from '../../middleware/error.middleware'
import { RegisterInput, LoginInput } from './auth.schema'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m'
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'

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
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        input.email ? { email: input.email } : {},
        input.phone ? { phone: input.phone } : {},
      ],
    },
  })

  if (!user || !user.passwordHash) throw new AppError(401, 'Invalid credentials')
  if (user.status === 'SUSPENDED') throw new AppError(403, 'Account suspended')

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) throw new AppError(401, 'Invalid credentials')

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
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.otpVerification.create({
    data: { phone, code, expiresAt },
  })

  // TODO: integrate Sparrow SMS or similar Nepal SMS provider
  // await smsService.send(phone, `Your OTP is: ${code}`)
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await prisma.otpVerification.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) throw new AppError(400, 'Invalid or expired OTP')

  await prisma.otpVerification.update({ where: { id: otp.id }, data: { verified: true } })

  // Mark phone as verified on user if they exist
  await prisma.user.updateMany({
    where: { phone, status: 'PENDING_VERIFICATION' },
    data: { status: 'ACTIVE' },
  })

  return true
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
