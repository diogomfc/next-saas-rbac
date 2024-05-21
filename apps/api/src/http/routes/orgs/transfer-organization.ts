import { organizationSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/organization/:slug/owner',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Transfer organization ownership',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            transferToUserId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        // recupera o slug da organização do parâmetro da rota
        const { slug } = request.params

        // recupera o id do usuário autenticado
        const userId = await request.getCurrentUserId()

        // recupera a associação do usuário com a organização a partir do slug
        const { membership, organization } =
          await request.getUserMembership(slug)

        // valida se a organização existe
        const authOrganization = organizationSchema.parse(organization)

        // verifica se o usuário autenticado tem permissão para atualizar a organização
        const { cannot } = getUserPermissions(userId, membership.role)

        //  se o usuário não tiver permissão para transferir a organização, retorna um erro de não autorizado
        if (cannot('transfer_ownership', authOrganization)) {
          throw new UnauthorizedError(
            'You are not allowed to transfer this organization ownership.',
          )
        }

        // recupera os dados a partir do corpo da requisição
        const { transferToUserId } = request.body

        // recupera a associação do usuário com a organização a partir do id do usuário
        const transferToMembership = await prisma.member.findUnique({
          where: {
            organizationId_userId: {
              organizationId: organization.id,
              userId: transferToUserId,
            },
          },
        })

        // se o usuário não for membro da organização, retorna um erro de requisição inválida
        if (!transferToMembership) {
          throw new BadRequestError(
            'User is not a member of this organization.',
          )
        }

        await prisma.$transaction([
          // atualiza o owner da organização para o novo usuário
          prisma.member.update({
            where: {
              organizationId_userId: {
                organizationId: organization.id,
                userId: transferToUserId,
              },
            },
            data: {
              role: 'ADMIN',
            },
          }),

          // atualiza a organização com o novo owner
          prisma.organization.update({
            where: {
              id: organization.id,
            },
            data: {
              ownerId: transferToUserId,
            },
          }),
        ])

        return reply.status(204).send()
      },
    )
}
