import dayjs from 'dayjs'
import { db } from '../../db'
import { taskCompleted, tasks, users } from '../../db/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

export async function getCompletedTasks() {
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
      .where(lte(tasks.createdAt, lastDayOfWeek))
  )

  const tasksCompletedInWeek = db.$with('tasks_completed_in_week').as(
    db
      .select({
        id: taskCompleted.id,
        title: tasks.title,
        completedAt: tasksCreatedInWeek.createdAt,
        completedAtDate: sql /*sql*/`
            DATE(${taskCompleted.createdAt})
        `.as('completedAtDate'),
      })
      .from(taskCompleted)
      .innerJoin(tasks, eq(tasks.id, taskCompleted.taskId))
      .where(
        and(
          gte(taskCompleted.createdAt, firstDayOfWeek),
          lte(taskCompleted.createdAt, lastDayOfWeek)
        )
      )
      .orderBy(desc(taskCompleted.createdAt))
  )

  const taskCompletedByWeek = db.$with('task_completed_by_week').as(
    db
      .select({
        completedAtDate: tasksCompletedInWeek.completedAtDate,
        completions: sql /*sql*/`
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', ${taskCompleted.id},
                    'title', ${tasks.title},
                    'completedAt', ${taskCompleted.createdAt}
                )
            )
        `.as('completions'),
      })
      .from(tasksCompletedInWeek)
      .groupBy(tasksCompletedInWeek.completedAtDate)
      .orderBy(tasksCompletedInWeek.completedAtDate)
  )

  type TasksPerDay = Record<
    string,
    {
      id: string
      title: string
      createdAt: string
    }
  >

  const result = await db
    .select({
      completed: sql /*sql*/`
        (SELECT COUNT(*) FROM ${tasksCompletedInWeek})
    `.mapWith(Number),
      total: sql /*sql*/`
        (SELECT SUM(${tasksCreatedInWeek.weeklyFrequency}) FROM ${tasksCreatedInWeek})
    `.mapWith(Number),
      TasksPerDay: sql /*sql*/<TasksPerDay>`
        JSON_OBJECT_AGG(
            ${taskCompletedByWeek.completedAtDate}
            ${taskCompletedByWeek.completions}
        )
    `,
    })
    .from(taskCompletedByWeek)

  return {
    summary: result[0],
  }
}
