import dayjs from 'dayjs'
import { db } from '../../db'
import { taskCompleted, tasks, users } from '../../db/schema'
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'

interface FilteringId {
  userId: string
}

export async function getTasks({ userId }: FilteringId) {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const tasksCreatedInWeek = db.$with('tasks_created_in_week').as(
    db
      .select({
        id: tasks.id,
        userId: tasks.userId,
        title: tasks.title,
        weeklyFrequency: tasks.weeklyFrequency,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .where(
        and(
          gte(tasks.createdAt, firstDayOfWeek),
          lte(tasks.createdAt, lastDayOfWeek),
          eq(tasks.userId, userId)
        )
      )
  )

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

  const pendingTasks = await db
    .with(tasksCreatedInWeek, tasksCompletionCount)
    .select({
      id: tasksCreatedInWeek.id,
      userId: tasksCreatedInWeek.userId,
      title: tasksCreatedInWeek.title,
      weeklyFrequency: tasksCreatedInWeek.weeklyFrequency,
      completionCount: sql /*sql*/`
        COALESCE(${tasksCompletionCount.completionCount}, 0)
    `.mapWith(Number),
    })
    .from(tasksCreatedInWeek)
    .leftJoin(
      tasksCompletionCount,
      eq(tasksCompletionCount.taskId, tasksCreatedInWeek.id)
    )

  return { pendingTasks }
}
