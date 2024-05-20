import { compare } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function AuthenticateWithPasswordRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with e-mail & password',
        description:
          'Authenticate with e-mail & password. If the user does not have a password, use the social login routes.',
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
          // 400: z.object({
          //   message: z.string(),
          // }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      // Verifica se existe um usuário com o email informado
      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      })

      // Se não existir, retorna um erro 400
      if (!userFromEmail) {
        throw new UnauthorizedError('Invalid credentials.')
        // return reply.status(400).send({ message: 'Invalid credentials.' })
      }

      // Se o usuário não tiver senha, retorna um erro 400
      if (userFromEmail.passwordHash === null) {
        throw new BadRequestError(
          'User does not have a password, use social login.',
        )

        // return reply
        //   .status(400)
        //   .send({ message: 'User does not have a password, use social login.' })
      }

      // Verifica se a senha informada é válida
      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash,
      )

      // Se não for válida, retorna um erro 400
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials.')
        // return reply.status(400).send({ message: 'Invalid credentials.' })
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return reply.status(201).send({ token })
    },
  )
}
