import { fastifyCors } from '@fastify/cors'
import { fastify, FastifyError } from 'fastify'
import {
  // jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { CreateAccountRoute } from './routes/auth/create-account'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

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
