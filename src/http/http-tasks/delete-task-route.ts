import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { deleteTask } from '../../functions/tasks/delete-task'

export const deleteTasksRoute: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/pending-task/:userId',
    {
      schema: {
        params: z.object({
          userId: z.string().cuid2(),
        }),
        body: z.object({
          taskId: z.string().cuid2(),
        }),
      },
    },
    async req => {
      const { userId } = req.params
      const { taskId } = req.body

      await deleteTask({ userId, taskId })
    }
  )
}
