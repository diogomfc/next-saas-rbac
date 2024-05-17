import { z } from 'zod'

export const roleSchema = z.union([
  z.literal('ADMIN'),
  z.literal('USER'),
  z.literal('GUEST'),
  z.literal('MEMBER'),
  z.literal('BILLING'),
])

export type Role = z.infer<typeof roleSchema>
