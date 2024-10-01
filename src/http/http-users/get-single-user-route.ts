import { getTasks } from '../../functions/tasks/get-tasks'
import z from 'zod'
import { getSingleUser } from '../../functions/users/get-login-user'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const getSingleUserRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/login',
    {
      schema: {
        body: z.object({
          email: z.string(),
          password: z.string(),
        }),
      },
    },
    async req => {
      const { email, password } = req.body
      const { user, tasks } = await getSingleUser({ email, password })

      return { user, tasks }
    }
  )
}
