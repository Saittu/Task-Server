import { and, eq } from 'drizzle-orm'
import { db } from '../../db'
import { tasks } from '../../db/schema'

interface DeleteTaskRequest {
  taskId: string
  userId: string
}

export async function deleteTask({ taskId, userId }: DeleteTaskRequest) {
  const [existingTaskAndUser] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))

  if (!existingTaskAndUser) {
    throw new Error('Tarefa não encontrada!')
  }

  await db.delete(tasks).where(eq(tasks.id, taskId))
}
