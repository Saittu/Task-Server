import { client, db } from '.'
import { users, tasks, taskCompleted } from './schema'
import dayjs from 'dayjs'
import bcrypt from 'bcrypt'
import { exit } from 'node:process'

async function seed() {
  await db.delete(users)
  await db.delete(tasks)
  await db.delete(taskCompleted)

  const result = await db
    .insert(users)
    .values([
      {
        name: 'Jean',
        email: 'jeanants@icloud.com',
        password: bcrypt.hashSync('2402', 10),
      },
      {
        name: 'Guilherme',
        email: 'guilherme@icloud.com',
        password: bcrypt.hashSync('2810Gui', 10),
      },
      {
        name: 'João',
        email: 'joaop@icloud.com',
        password: bcrypt.hashSync('2515', 10),
      },
    ])
    .returning()

  const startOfWeek = dayjs().startOf('week')

  const task = await db
    .insert(tasks)
    .values([
      { userId: result[0].id, title: 'correr', weeklyFrequency: 3 },
      { userId: result[0].id, title: 'trabalhar', weeklyFrequency: 5 },
      { userId: result[1].id, title: 'ler', weeklyFrequency: 6 },
      { userId: result[1].id, title: 'treinar', weeklyFrequency: 5 },
      { userId: result[2].id, title: 'desenhar', weeklyFrequency: 2 },
      { userId: result[2].id, title: 'nadar', weeklyFrequency: 1 },
    ])
    .returning()

  await db.insert(taskCompleted).values([
    { taskId: task[0].id, createdAt: startOfWeek.toDate() },
    { taskId: task[2].id, createdAt: startOfWeek.add(2, 'day').toDate() },
  ])
}

seed().finally(() => {
  client.end()
  exit()
})
