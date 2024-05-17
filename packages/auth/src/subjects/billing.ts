import { z } from 'zod'

export const billingSchemaSubject = z.tuple([
  z.union([z.literal('manage'), z.literal('export'), z.literal('get')]),
  z.literal('Billing'),
])

export type BillingSubject = z.infer<typeof billingSchemaSubject>
