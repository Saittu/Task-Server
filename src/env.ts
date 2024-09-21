import z from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
})

const validateDatabaseUrl = (url: string) => {
  const regex = /^postgresql:\/\/.+$/
  if (!regex.test(url)) {
    throw new Error('DATABASE_URL is not in a valid format.')
  }
}

const env = envSchema.parse(process.env)
validateDatabaseUrl(env.DATABASE_URL)

export { env }
