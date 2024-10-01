import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../../db'
import { taskCompleted, tasks, users } from '../../db/schema'
import dayjs from 'dayjs'
import bcrypt from 'bcrypt'

interface GetSingleUserRequest {
  email: string
  password: string
}

export async function getSingleUser({ email, password }: GetSingleUserRequest) {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      password: users.password,
      profilePicture: users.profilePicture,
    })
    .from(users)
    .where(eq(users.email, email))

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Email ou senha incorretos!')
  }

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
        and(eq(tasks.userId, user.id), lte(tasks.createdAt, lastDayOfWeek))
      )
  )

  const tasksCompletedInWeek = db.$with('tasks_completed_in_week').as(
    db
      .select({
        id: taskCompleted.id,
        taskId: taskCompleted.taskId,
        title: tasks.title,
        completedAt: taskCompleted.createdAt,
        completedAtDate: sql /*sql*/`
            DATE(${taskCompleted.createdAt})
        `.as('completedAtDate'),
      })
      .from(taskCompleted)
      .innerJoin(tasks, eq(tasks.id, taskCompleted.taskId))
      .where(
        and(
          eq(tasks.userId, user.id),
          gte(taskCompleted.createdAt, firstDayOfWeek),
          lte(taskCompleted.createdAt, lastDayOfWeek)
        )
      )
      .orderBy(desc(taskCompleted.createdAt))
  )

  const taskCompletedByWeek = db.$with('task_completed_by_week').as(
    db
      .select({
        taskId: tasksCompletedInWeek.taskId,
        completedAtDate: tasksCompletedInWeek.completedAtDate,
        completions: sql /*sql*/`
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', ${taskCompleted.id},
                    'title', ${tasks.title},
                    'completedAt', ${tasksCompletedInWeek.completedAt}
                )
            )
        `.as('completions'),
      })
      .from(tasksCompletedInWeek)
      .groupBy(tasksCompletedInWeek.id, tasksCompletedInWeek.completedAtDate)
      .orderBy(tasksCompletedInWeek.completedAtDate)
  )

  type TasksPerDay = Record<
    string,
    {
      id: string
      title: string
      completedAt: string
    }
  >

  const [tasksCreatedPerUser] = await db
    .with(tasksCreatedInWeek, tasksCompletedInWeek, taskCompletedByWeek)
    .select({
      id: tasksCreatedInWeek.id,
      userId: tasksCreatedInWeek.userId,
      title: tasksCreatedInWeek.title,
      weeklyFrequency: tasksCreatedInWeek.weeklyFrequency,
      createdAt: tasksCreatedInWeek.createdAt,
      completed: sql /*sql*/`
        (SELECT COUNT(*) FROM ${tasksCompletedInWeek})
    `.mapWith(Number),
      total: sql /*sql*/`
        (SELECT SUM(${tasksCreatedInWeek.weeklyFrequency}) FROM ${tasksCreatedInWeek})
    `.mapWith(Number),
      TasksPerDay: sql /*sql*/<TasksPerDay>`
        JSON_OBJECT_AGG(
            ${taskCompletedByWeek.completedAtDate},
            ${taskCompletedByWeek.completions}
        )
    `,
    })
    .from(tasksCreatedInWeek)
    .leftJoin(
      taskCompletedByWeek,
      eq(tasksCreatedInWeek.id, taskCompletedByWeek.taskId)
    )
    .where(
      and(
        gte(tasksCreatedInWeek.createdAt, firstDayOfWeek),
        lte(tasksCreatedInWeek.createdAt, lastDayOfWeek),
        eq(tasksCreatedInWeek.userId, user.id)
      )
    )

  return {
    user: user,
    tasks: tasksCreatedPerUser,
  }
}
