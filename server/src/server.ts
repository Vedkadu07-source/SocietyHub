import app from './app.js'
import { env } from './config/env.js'
import { readDatabase, updateDatabase } from './utils/jsonDb.js'
import { createSeedDatabase } from './seedData.js'

const existing = await readDatabase()
if (existing.societies.length === 0) {
  const seeded = await createSeedDatabase()
  await updateDatabase(database => Object.assign(database, seeded))
}

app.listen(env.port, () => {
  console.info(`SocietyHub API listening on http://localhost:${env.port}`)
})