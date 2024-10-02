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
      profilePicture: users.profilePicture,
      TotalTasks: sql /*sql*/`
        (SELECT SUM(${tasks.weeklyFrequency}) FROM ${tasks} WHERE tasks.user_id = users.id)
      `.mapWith(Number),
    })
    .from(users)
    .where(eq(users.email, email))

  const [Validuser] = await db.select().from(users).where(eq(users.id, user.id))

  if (!user || !(await bcrypt.compare(password, Validuser.password))) {
    throw new Error('Email ou senha incorretos!')
  }

  const tasksCreatedInWeek = db.$with('tasks_created_in_week').as(
    db
      .select()
      .from(tasks)
      .where(
        and(
          gte(tasks.createdAt, firstDayOfWeek),
          lte(tasks.createdAt, lastDayOfWeek),
          eq(tasks.userId, user.id)
        )
      )
  )

  const completedTask = db.$with('completed_task').as(
    db
      .select({
        taskId: taskCompleted.taskId,
        completionCount: count(taskCompleted.id).as('completionCount'),
        completedAtDate: sql /*sql*/`
            MIN(DATE(${taskCompleted.createdAt}))
          `.as('completedAtDate'),
        completions: sql /*sql*/`
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'completedAt', ${taskCompleted.createdAt}
              ) 
            ) 
          `.as('completions'),
      })
      .from(taskCompleted)
      .leftJoin(tasks, eq(tasks.id, taskCompleted.taskId))
      .where(
        and(
          eq(tasks.id, taskCompleted.taskId),
          gte(taskCompleted.createdAt, firstDayOfWeek),
          lte(taskCompleted.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(taskCompleted.taskId)
    // .orderBy(taskCompleted.createdAt)
  )

  const pendingTasks = await db
    .with(tasksCreatedInWeek, completedTask)
    .select({
      id: tasksCreatedInWeek.id,
      userId: tasksCreatedInWeek.userId,
      title: tasksCreatedInWeek.title,
      weeklyFrequency: tasksCreatedInWeek.weeklyFrequency,
      completionCount: sql /*sql*/`
        COALESCE(${completedTask.completionCount}, 0)
    `.mapWith(Number),
      completedAtDate: completedTask.completedAtDate,
      complitions: completedTask.completions,
    })
    .from(tasksCreatedInWeek)
    .leftJoin(completedTask, eq(tasksCreatedInWeek.id, completedTask.taskId))

  return {
    user: user,
    tasks: pendingTasks,
  }
}
