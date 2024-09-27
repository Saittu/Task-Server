import { and, eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema'
import bcrypt from 'bcrypt'

interface DeleteUserRequest {
  id: string
  password: string
}

export async function deleteUser({ id, password }: DeleteUserRequest) {
  const existingUser = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), eq(users.password, password)))
    .limit(1)

  if (existingUser.length === 0) {
    throw new Error('Usuário não encontrado')
  }

  const user = existingUser[0]

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    throw new Error('Senha incorreta')
  }

  await db.delete(users).where(eq(users.id, user.id))
}
