import {
  serializerCompiler,
  validatorCompiler,
  type FastifyPluginAsyncZod,
} from 'fastify-type-provider-zod'
import fastify from 'fastify'
import { postUserRoute } from './http-users/post-user-route'
import { getUsersRoute } from './http-users/get-users-route'
import { deleteUserRoute } from './http-users/delete-user-route'
import { patchUserRoute } from './http-users/patch-user-route'
import { postTaskRoute } from './http-tasks/post-tasks-route'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(postUserRoute)
app.register(getUsersRoute)
app.register(deleteUserRoute)
app.register(patchUserRoute)
app.register(postTaskRoute)

app.listen({ port: 5555 }).then(() => console.log('SERVER RUNNIG'))
