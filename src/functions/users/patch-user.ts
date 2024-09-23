import type { FastifyPluginAsync } from 'fastify'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq, or } from 'drizzle-orm'
import bcrypt from 'bcrypt'

interface PatchUserRequest {
  id: string
  name?: string
  email?: string
  password: string
  passwordConfirm: string
}

export async function patchUser({
  id,
  name,
  email,
  password,
  passwordConfirm,
}: PatchUserRequest) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  if (existingUser.length === 0) {
    throw new Error('Usuário não encontrado')
  }

  const user = existingUser[0]

  if(passwordConfirm !== password) {
    throw new Error("Confirmação incorreta!")
  }

  const updatedFields: Partial<{
    name: string
    email: string
    password: string
  }> = {}

  if (name) updatedFields.name = name
  if (email) updatedFields.email = email

  await db.update(users).set(updatedFields).where(eq(users.id, user.id))

  const updatedUser = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  return updatedUser[0]
}
