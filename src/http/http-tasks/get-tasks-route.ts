import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getTasks } from '../../functions/tasks/get-tasks'
import z from 'zod'

export const getPendingTaks: FastifyPluginAsyncZod = async app => {
  app.get(
    '/pending-task/:userId',
    {
      schema: {
        params: z.object({
          userId: z.string().cuid2(),
        }),
      },
    },
    async req => {
      const { userId } = req.params
      const { pendingTasks } = await getTasks({ userId })

      return { pendingTasks }
    }
  )
}
