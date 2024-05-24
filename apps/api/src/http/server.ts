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
import { authenticateWithPasswordRoute } from './routes/auth/authenticate-with-password'
import { createAccountRoute } from './routes/auth/create-account'
import { getProfileRoute } from './routes/auth/get-profile'
import { createOrganization } from './routes/orgs/create-organization'
import { getMembership } from './routes/orgs/get-membership'
import { getOrganization } from './routes/orgs/get-organization'
import { getOrganizations } from './routes/orgs/get-organizations'
import { shutdownOrganization } from './routes/orgs/shutdown-organization'
import { transferOrganization } from './routes/orgs/transfer-organization'
import { updateOrganization } from './routes/orgs/update-organization'
import { createProject } from './routes/projects/create-project'
import { deleteProject } from './routes/projects/delete-project'
import { getProjects } from './routes/projects/get-projecs'
import { getProject } from './routes/projects/get-project'
import { updateProject } from './routes/projects/update-project'

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

// Rotas - authorization
app.register(createAccountRoute)
app.register(authenticateWithPasswordRoute)
app.register(getProfileRoute)
app.register(requestPasswordRecover)
app.register(resetPassword)
app.register(authenticateWithGithub)

// Rotas - organizations
app.register(createOrganization)
app.register(getMembership)
app.register(getOrganization)
app.register(getOrganizations)
app.register(updateOrganization)
app.register(shutdownOrganization)
app.register(transferOrganization)

// Rotas - projects
app.register(createProject)
app.register(deleteProject)
app.register(getProject)
app.register(getProjects)
app.register(updateProject)

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
