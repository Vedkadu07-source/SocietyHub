import 'dotenv/config'
import path from 'node:path'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters.')
}

export const env = {
  port: Number(process.env.API_PORT ?? (process.env.PORT === '8443' ? 4000 : process.env.PORT ?? 4000)),
  jwtSecret,
  databasePath: path.resolve(process.cwd(), process.env.DATABASE_PATH ?? './server/data/db.json'),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173,http://localhost:8443',
  nodeEnv: process.env.NODE_ENV ?? 'development',
}