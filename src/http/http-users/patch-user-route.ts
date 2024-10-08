import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { patchUser } from '../../functions/users/patch-user'

export const patchUserRoute: FastifyPluginAsyncZod = async app => {
  app.patch(
    '/users/:id',
    {
      schema: {
        params: z.object({
          id: z.string().cuid2(),
        }),
        body: z.object({
          name: z.string().optional(),
          email: z.string().optional(),
          newPassword: z.string(),
          passwordConfirm: z.string(),
          password: z.string(),
        }),
      },
    },
    async req => {
      const { id } = req.params
      const { name, email, newPassword, password, passwordConfirm } = req.body

      const updatedUser = await patchUser({
        id,
        name,
        email,
        newPassword,
        password,
        passwordConfirm,
      })

      return { message: 'Usuário atualizado com sucesso!', users: updatedUser }
    }
  )
}
