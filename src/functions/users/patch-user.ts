import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'

interface PatchUserRequest {
  id: string
  name?: string
  email?: string
  newPassword: string
  passwordConfirm: string
  password: string
}

export async function patchUser({
  id,
  name,
  email,
  password,
  newPassword,
  passwordConfirm,
}: PatchUserRequest) {
  const [user] = await db.select().from(users).where(eq(users.id, id))

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (newPassword !== passwordConfirm) {
    throw new Error('As senhas a serem atualizadas não batem!')
  }
  if (!isValidPassword) {
    throw new Error('Senha atual incorreta!')
  }

  const updatedFields: Partial<{
    name: string
    email: string
    password: string
  }> = {}

  if (name) updatedFields.name = name
  if (email) updatedFields.email = email
  if (password) updatedFields.password = newPassword

  if (newPassword) {
    const hashedPassword = await bcrypt.hashSync(newPassword, 10)
    updatedFields.password = hashedPassword
  }

  await db.update(users).set(updatedFields).where(eq(users.id, user.id))

  const [updatedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))

  return updatedUser
}
