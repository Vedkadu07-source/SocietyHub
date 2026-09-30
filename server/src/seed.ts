import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { env } from './config/env.js'
import { createSeedDatabase } from './seedData.js'
import { readDatabase } from './utils/jsonDb.js'

if (process.argv.includes('--if-empty')) {
	const existing = await readDatabase()
	if (existing.societies.length > 0) {
		console.log(`SocietyHub database already exists at ${env.databasePath}; leaving it unchanged.`)
		process.exit(0)
	}
}

const database = await createSeedDatabase()
await mkdir(path.dirname(env.databasePath), { recursive: true })
await writeFile(env.databasePath, `${JSON.stringify(database, null, 2)}\n`, 'utf8')
console.log(`SocietyHub demo database seeded at ${env.databasePath}`)