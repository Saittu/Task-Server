import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { deleteUser } from '../../functions/users/delete-user'

export const deleteUserRoute: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/users/:id',
    {
      schema: {
        params: z.object({
          id: z.string().cuid2(),
        }),
        body: z.object({
          password: z.string(),
        }),
      },
    },
    async req => {
      const { id } = req.params
      const { password } = req.body

      const result = await deleteUser({ id, password })

      return { result }
    }
  )
}
