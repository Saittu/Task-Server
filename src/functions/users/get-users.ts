import { db } from '../../db'
import { users } from '../../db/schema'

export async function getUsers() {
  const usersCreated = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      profilePicture: users.profilePicture,
    })
    .from(users)

  return { usersCreated }
}
