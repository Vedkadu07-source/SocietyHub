import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { env } from '../config/env.js'
import type { Database } from '../types.js'

export const emptyDatabase = (): Database => ({
  users: [],
  societies: [],
  residents: [],
  complaints: [],
  notices: [],
  payments: [],
  transactions: [],
  activities: [],
  monthlyCollections: [],
})

function parseDatabase(contents: string): Database {
  const parsed: unknown = JSON.parse(contents)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Database JSON must contain an object of collections.')
  }

  const database = parsed as Record<string, unknown>
  for (const collection of Object.keys(emptyDatabase())) {
    if (!Array.isArray(database[collection])) {
      throw new Error(`Database JSON must contain a "${collection}" array.`)
    }
  }
  return database as unknown as Database
}

export async function readDatabase(): Promise<Database> {
  try {
    return parseDatabase(await readFile(env.databasePath, 'utf8'))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyDatabase()
    throw error
  }
}

async function persistDatabase(database: Database): Promise<void> {
  const directory = path.dirname(env.databasePath)
  const temporaryPath = `${env.databasePath}.tmp`
  await mkdir(directory, { recursive: true })
  await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, env.databasePath)
}

let writeQueue: Promise<void> = Promise.resolve()

export function updateDatabase<T>(mutate: (database: Database) => T | Promise<T>): Promise<T> {
  const operation = writeQueue.then(async () => {
    const database = await readDatabase()
    const result = await mutate(database)
    await persistDatabase(database)
    return result
  })
  writeQueue = operation.then(() => undefined, () => undefined)
  return operation
}

export function findById<T extends { id: string }>(records: T[], id: string): T | undefined {
  return records.find(record => record.id === id)
}

export function filterRecords<T>(records: T[], predicate: (record: T) => boolean): T[] {
  return records.filter(predicate)
}

export function insertRecord<T>(records: T[], record: T): T {
  records.push(record)
  return record
}

export function deleteById<T extends { id: string }>(records: T[], id: string): boolean {
  const index = records.findIndex(record => record.id === id)
  if (index < 0) return false
  records.splice(index, 1)
  return true
}