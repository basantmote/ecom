import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().regex(/^\+?977[0-9]{10}$/, 'Invalid Nepal phone number').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2),
  }).refine((d) => d.email || d.phone, {
    message: 'Either email or phone is required',
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string(),
  }).refine((d) => d.email || d.phone, {
    message: 'Either email or phone is required',
  }),
})

export const otpSendSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\+?977[0-9]{10}$/, 'Invalid Nepal phone number'),
  }),
})

export const otpVerifySchema = z.object({
  body: z.object({
    phone: z.string(),
    code: z.string().length(6),
  }),
})

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
