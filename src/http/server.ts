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
import { getPendingTaks } from './http-tasks/get-tasks-route'
import { postTasksComplitionRoute } from './http-tasks/post-tasks-complition-route'
import { getCompletedTasksRoute } from './http-tasks/get-completed-tasks-route'
import { deleteTasksRoute } from './http-tasks/delete-task-route'
import { getSingleUserRoute } from './http-users/get-single-user-route'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(postUserRoute)
app.register(getUsersRoute)
app.register(deleteUserRoute)
app.register(patchUserRoute)
app.register(postTaskRoute)
app.register(getPendingTaks)
app.register(postTasksComplitionRoute)
app.register(getCompletedTasksRoute)
app.register(deleteTasksRoute)
app.register(getSingleUserRoute)

app.listen({ port: 5555 }).then(() => console.log('SERVER RUNNIG'))
