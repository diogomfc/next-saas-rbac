import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string> // const { sub } = await request.jwtVerify<{ sub: string }>()
  }
}
