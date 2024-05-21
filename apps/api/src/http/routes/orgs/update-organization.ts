import { organizationSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organization/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Update organization details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
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

        // recupera os dados da requisição do usuário com a partir do corpo da requisição
        const { name, domain, shouldAttachUsersByDomain } = request.body

        // valida se a organização existe
        const authOrganization = organizationSchema.parse(organization)

        // verifica se o usuário autenticado tem permissão para atualizar a organização
        const { cannot } = getUserPermissions(userId, membership.role)

        // se o usuário não tiver permissão para atualizar a organização, retorna um erro de não autorizado
        if (cannot('update', authOrganization)) {
          throw new UnauthorizedError(
            'You are not allowed to update this organization.',
          )
        }

        // Verificar se já existe uma organização com o mesmo domínio
        if (domain) {
          const organizationByDomain = await prisma.organization.findFirst({
            where: {
              domain,
              id: {
                not: organization.id,
              },
            },
          })

          // Se existir, retornar erro
          if (organizationByDomain) {
            throw new BadRequestError(
              'Another organization with same domain already exists.',
            )
          }
        }

        // Criar a organização e retornar o ID
        await prisma.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            name,
            // slug: createSlug(name),
            domain,
            shouldAttachUsersByDomain,
          },
        })

        return reply.status(204).send()
      },
    )
}
