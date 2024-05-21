import { fastifyCors } from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { env } from '@saas/env'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from '@/http/error-handler'
import { requestPasswordRecover } from '@/http/routes/auth/request-password-recover'
import { resetPassword } from '@/http/routes/auth/reset-password'

import { authenticateWithGithub } from './routes/auth/authenticate-with-github'
import { AuthenticateWithPasswordRoute } from './routes/auth/authenticate-with-password'
import { CreateAccountRoute } from './routes/auth/create-account'
import { GetProfileRoute } from './routes/auth/get-profile'
import { createOrganization } from './routes/orgs/create-organization'
import { getMembership } from './routes/orgs/get-membership'

// Inicialização do servidor com Fastify e TypeProvider
export const app = fastify().withTypeProvider<ZodTypeProvider>()

// Configuração do TypeProvider
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

// Documentação com Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next.js SaaS',
      description: 'Full-stack SaaS with multi-tenant & RBAC.',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

// JWT
app.register(fastifyJwt, {
  secret: env.JWT_SECRET, // process.env.JWT_SECRET
})

// Cors
app.register(fastifyCors, {
  origin: '*',
})

// Rotas
app.register(CreateAccountRoute)
app.register(AuthenticateWithPasswordRoute)
app.register(GetProfileRoute)
app.register(requestPasswordRecover)
app.register(resetPassword)
app.register(authenticateWithGithub)
app.register(createOrganization)
app.register(getMembership)

// Tratativa de erros
// app.setErrorHandler((error: FastifyError, request, reply) => {
//   reply.status(400).send({
//     message: JSON.parse(error.message),
//   })
// })

app.setErrorHandler(errorHandler)

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log(' 🚀 Server is running on port 3333')
})
