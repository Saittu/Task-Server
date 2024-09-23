import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { postUser } from '../../functions/users/post-user'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const postUserRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/users',
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.string(),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      //validação usuário já cadastrado
      try {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        if (existingUser.length > 0) {
          return reply.status(200).send('Usuário já cadastrado')
        }

        await postUser({ name, email, password })
      } catch {
        console.log('System error')
        return reply.status(500)
      }
    }
  )
}
