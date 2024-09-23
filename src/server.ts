import {
  serializerCompiler,
  validatorCompiler,
  type FastifyPluginAsyncZod,
} from 'fastify-type-provider-zod'
import fastify from 'fastify'
import { postUserRoute } from './http/post-user-route'
import { getUsersRoute } from './http/get-users-route'
import { deleteUserRoute } from './http/delete-user-route'
import { patchUserRoute } from './http/patch-user-route'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(postUserRoute)
app.register(getUsersRoute)
app.register(deleteUserRoute)
app.register(patchUserRoute)

app.listen({ port: 5555 }).then(() => console.log('SERVER RUNNIG'))
