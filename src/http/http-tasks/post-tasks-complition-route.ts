import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { postTasksCompleted } from '../../functions/tasks/post-tasks-completed'

export const postTasksComplitionRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/complition/:userId',
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
    async (req, res) => {
      const { userId } = req.params
      const { taskId } = req.body

      await postTasksCompleted({ userId, taskId })

      res.send({ message: 'Task Concluída!' })
    }
  )
}
