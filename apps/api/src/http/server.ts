import { fastifyCors } from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { fastify, FastifyError } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { CreateAccountRoute } from './routes/auth/create-account'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next.js SaaS',
      description: 'Full-stack SaaS with multi-tenant & RBAC.',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyCors, {
  origin: '*',
})

// ROUTES
app.register(CreateAccountRoute)

// Tratativa de erros
app.setErrorHandler((error: FastifyError, request, reply) => {
  reply.status(400).send({
    message: JSON.parse(error.message),
  })
})

app.listen({ port: 3333 }).then(() => {
  console.log(' 🚀 Server is running on port 3333')
})
