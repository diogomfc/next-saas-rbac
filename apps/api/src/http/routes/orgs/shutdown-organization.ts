import { organizationSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function shutdownOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organization/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Shutdown organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
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

        // se o usuário não tiver permissão para atualizar a organização, retorna um erro de não autorizado
        if (cannot('delete', authOrganization)) {
          throw new UnauthorizedError(
            'You are not allowed to shutdown this organization.',
          )
        }

        // deleta a organização
        await prisma.organization.delete({
          where: {
            id: organization.id,
          },
        })

        return reply.status(204).send()
      },
    )
}
