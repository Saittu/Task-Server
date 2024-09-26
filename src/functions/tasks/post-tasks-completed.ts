import dayjs from 'dayjs'
import { db } from '../../db'
import { taskCompleted, tasks } from '../../db/schema'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

interface PostTasksCompletedRequest {
  userId: string
  taskId: string
}

export async function postTasksCompleted({
  taskId,
  userId,
}: PostTasksCompletedRequest) {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const tasksCompletionCount = db.$with('tasks_completion_count').as(
    db
      .select({
        taskId: taskCompleted.taskId,
        completionCount: count(taskCompleted.id).as('completionCount'),
      })
      .from(taskCompleted)
      .where(
        and(
          gte(taskCompleted.createdAt, firstDayOfWeek),
          lte(taskCompleted.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(taskCompleted.taskId)
  )

  const result = await db
    .with(tasksCompletionCount)
    .select({
      weeklyFrequency: tasks.weeklyFrequency,
      completionCount: sql /*sql*/`
        COALESCE(${tasksCompletionCount.completionCount}, 0)
    `.mapWith(Number),
    })
    .from(tasks)
    .leftJoin(tasksCompletionCount, eq(tasksCompletionCount.taskId, tasks.id))
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1)

  if (result.length === 0) {
    throw new Error('Tarefa não encontrada ou usuário inválido.')
  }

  const { completionCount, weeklyFrequency } = result[0]

  if (completionCount >= weeklyFrequency) {
    throw new Error('Tasks da semana completas!')
  }

  const insertResult = await db
    .insert(taskCompleted)
    .values({ taskId })
    .returning()

  const taskComplition = insertResult[0]

  return { taskComplition, userId }
}
