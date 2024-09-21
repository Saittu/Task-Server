import * as schema from './schema'
import { env } from '../env'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const DATABASE_URL = `postgresql://${process.env.POSTGRESQL_USER}:${process.env.POSTGRESQL_PASSWORD}@${process.env.POSTGRESQL_HOST}:${process.env.POSTGRESQL_PORT}/${process.env.POSTGRESQL_DATABASE}`


export const client = postgres(DATABASE_URL)
export const db = drizzle(client, { schema, logger: true })
