import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { tasks, users } from '../../db/schema'

interface PostTaskRequest {
  userId: string
  title: string
  weeklyFrequency: number
}

export async function postTask({
  userId,
  title,
  weeklyFrequency,
}: PostTaskRequest) {
  const [user] = await db.select().from(users).where(eq(users.id, userId))

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  const [result] = await db
    .insert(tasks)
    .values({ userId, title, weeklyFrequency })
    .returning()

  return { result }
}
