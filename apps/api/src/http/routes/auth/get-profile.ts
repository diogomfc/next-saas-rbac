import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getProfileRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/profile',
      {
        schema: {
          tags: ['auth'],
          summary: 'Get user profile',
          security: [{ bearerAuth: [] }],
          description: 'Get user profile.',
          response: {
            200: z.object({
              user: z.object({
                id: z.string().uuid(),
                email: z.string().email(),
                name: z.string().nullable(),
                avatarUrl: z.string().url().nullable(),
              }),
            }),
            401: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        })

        if (!user) {
          throw new BadRequestError('User not found.')
        }

        return reply.send({ user })
      },
    )
}
