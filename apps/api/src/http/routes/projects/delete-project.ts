import { projectSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organization/:slug/projects/:projectId',
      {
        schema: {
          tags: ['projects'],
          summary: 'Delete a project',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            projectId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, projectId } = request.params
        const userId = await request.getCurrentUserId()

        // Retorna os dados da organização e a associação do usuário com a organização
        const { organization, membership } =
          await request.getUserMembership(slug)

        // Retorna os dados do projeto do usuário com a organização do usuário
        const project = await prisma.project.findUnique({
          where: {
            id: projectId,
            organizationId: organization.id,
          },
        })

        // Verifica se o projeto existe
        if (!project) {
          throw new BadRequestError('Project not found.')
        }

        // Verificar permissões do usuário
        const { cannot } = getUserPermissions(userId, membership.role)

        // valida se o usuário tem permissão para deletar o projeto
        const authProject = projectSchema.parse(project)

        // Se o usuário não tiver permissão para deletar o projeto, retorna um erro de não autorizado
        if (cannot('delete', authProject)) {
          throw new UnauthorizedError(
            'You are not allowed to delete this project.',
          )
        }

        // Deleta o projeto
        await prisma.project.delete({
          where: {
            id: project.id,
          },
        })

        return reply.status(204)
      },
    )
}
