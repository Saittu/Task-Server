import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getCompletedTasks } from '../../functions/tasks/get-completed-tasks'

export const getCompletedTasksRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/summary-tasks/:userId',
    {
      schema: {
        params: z.object({
          userId: z.string().cuid2(),
        }),
      },
    },
    async req => {
      const { userId } = req.params
      const { summary } = await getCompletedTasks({ userId })

      return { summary }
    }
  )
}
