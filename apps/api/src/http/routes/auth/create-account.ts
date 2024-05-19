import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

export async function CreateAccountRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['auth'],
        summary: 'Create a new account',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      // Destructuring do corpo da requisição
      const { name, email, password } = request.body

      // Verifica se já existe um usuário com o mesmo email
      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      // Se existir, retorna um erro 400
      if (userWithSameEmail) {
        return reply.status(400).send({ message: 'Email already in use' })
      }

      // Verifica se o domínio do email é de uma organização que aceita shouldAttachUsersByDomain
      const [, domain] = email.split('@')
      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      // Cria um hash da senha
      const passwordHash = await hash(password, 6)

      // Cria um novo usuário no banco de dados.
      // Se o domínio do email for de uma organização que aceita shouldAttachUsersByDomain, o usuário é adicionado automaticamente à organização
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          member_on: autoJoinOrganization
            ? {
                create: {
                  organizationId: autoJoinOrganization.id,
                },
              }
            : undefined,
        },
      })

      // Retorna o usuário criado
      return reply.status(201).send(user)
    },
  )
}
