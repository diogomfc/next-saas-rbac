import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getMembers(app: FastifyInstance) {
  // app
  //   .withTypeProvider<ZodTypeProvider>() // Configuração do TypeProvider
  //   .register(auth) // Middleware de autenticação
  //   .get('/organizations/:slug/members', {schema: {},}, async (request, repaly) => {}) // Rota para buscar membros de uma organização

  //   app
  //     .withTypeProvider<ZodTypeProvider>() // Configuração do TypeProvider
  //     .register(auth) // Register authentication middleware
  //     .get(
  //       '/organizations/:slug/members', // Rota para buscar membros de uma organização
  //       {
  //         schema: {
  //           // Schema de validação da rota
  //           tags: ['members'],
  //           summary: 'Get members',
  //           security: [{ bearerAuth: [] }],
  //           params: {},
  //           query: {},
  //           headers: {},
  //           body: {},
  //           response: {},
  //         },
  //       },
  //       async (request, repaly) => {}, // Função de callback da rota para buscar membros de uma organização
  //     )
  // }

  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/members',
      {
        schema: {
          tags: ['members'],
          summary: 'Get all organization members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  id: z.string().uuid(),
                  userId: z.string().uuid(),
                  role: roleSchema,
                  name: z.string().nullable(),
                  email: z.string().email(),
                  avatarUrl: z.string().url().nullable(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'User')) {
          throw new UnauthorizedError(
            `You're not allowed to see organization members.`,
          )
        }

        const members = await prisma.member.findMany({
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            organizationId: organization.id,
          },
          orderBy: {
            role: 'asc',
          },
        })

        const membersWithRoles = members.map(
          ({ user: { id: userId, ...user }, ...member }) => {
            return {
              ...user,
              ...member,
              userId,
            }
          },
        )

        return reply.send({ members: membersWithRoles })
      },
    )
}
