import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organization/:orgSlug/projects/:projectSlug',
      {
        schema: {
          tags: ['projects'],
          summary: 'Get project details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string(),
            projectSlug: z.string(),
          }),
          response: {
            200: z.object({
              project: z.object({
                id: z.string().uuid(),
                description: z.string().nullable(),
                name: z.string(),
                slug: z.string(),
                avatarUrl: z.string().url().nullable(),
                organizationId: z.string().uuid(),
                ownerId: z.string().uuid(),
                owner: z.object({
                  id: z.string().uuid(),
                  name: z.string().nullable(),
                  email: z.string().email(),
                  avatarUrl: z.string().url().nullable(),
                }),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { orgSlug, projectSlug } = request.params
        const userId = await request.getCurrentUserId()

        // Retorna os dados da organização e a associação do usuário com a organização
        const { organization, membership } =
          await request.getUserMembership(orgSlug)

        // Verificar permissões do usuário
        const { cannot } = getUserPermissions(userId, membership.role)

        // Verificar se o usuário pode acessar o projeto
        if (cannot('get', 'Project')) {
          throw new UnauthorizedError(
            'User does not have permission to access the project.',
          )
        }

        // Retorna os dados do projeto do usuário com a organização do usuário
        const project = await prisma.project.findUnique({
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
            description: true,
            avatarUrl: true,
            organizationId: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
          where: {
            slug: projectSlug,
            organizationId: organization.id,
          },
        })

        // Verificar se o projeto existe
        if (!project) {
          throw new BadRequestError('Project not found.')
        }

        return reply.status(200).send({
          project,
        })
      },
    )
}
