import { db } from '../db'
import { users } from '../db/schema'
import bcrypt from 'bcrypt'

interface postUserRequest {
  name: string
  email: string
  password: string
}

export async function postUser({ name, email, password }: postUserRequest) {
  const result = await db
    .insert(users)
    .values({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
    })
    .returning()

  const user = result[0]

  return { user }
}
