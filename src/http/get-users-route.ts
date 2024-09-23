import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getUsers } from '../functions/users/get-users'

export const getUsersRoute: FastifyPluginAsyncZod = async app => {
  app.get('/users', async () => {
    const { usersCreated } = await getUsers()

    return { usersCreated }
  })
}
