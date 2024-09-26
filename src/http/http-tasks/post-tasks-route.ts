import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { postUser } from '../../functions/users/post-user'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { postTask } from '../../functions/tasks/post-tasks'

export const postTaskRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/tasks/:userId',
    {
      schema: {
        params: z.object({
          userId: z.string().cuid2(),
        }),
        body: z.object({
          title: z.string(),
          weeklyFrequency: z.number(),
        }),
      },
    },
    async (req, res) => {
      const { userId } = req.params
      const { title, weeklyFrequency } = req.body

      await postTask({ userId, title, weeklyFrequency })

      res.send({ message: 'Task criada com sucesso!' })
    }
  )
}
