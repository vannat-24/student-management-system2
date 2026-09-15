// server/utils/db.ts
import fs from 'node:fs'
import path from 'node:path'
import bundledDb from '../../app/api/db.json'

// In-memory cache so updates survive during server runtime in serverless / container
let memoryDb: any = null

export function getDatabasePath(): string | null {
  const possiblePaths = [
    path.resolve(process.cwd(), 'app/api/db.json'),
    path.resolve(process.cwd(), 'db.json'),
    path.resolve(process.cwd(), '../app/api/db.json'),
    path.resolve(process.cwd(), 'public/db.json'),
    path.resolve(process.cwd(), '.output/server/app/api/db.json')
  ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p
    }
  }
  return null
}

export function getDatabase(): any {
  if (memoryDb) {
    return memoryDb
  }

  const dbPath = getDatabasePath()
  if (dbPath) {
    try {
      const raw = fs.readFileSync(dbPath, 'utf-8')
      const parsed = JSON.parse(raw)
      memoryDb = parsed
      return memoryDb
    } catch (e) {
      console.warn('Could not read db.json from disk, using bundled database:', e)
    }
  }

  // Fallback to bundled db.json
  memoryDb = JSON.parse(JSON.stringify(bundledDb))
  return memoryDb
}

export function saveDatabase(db: any): boolean {
  memoryDb = db

  const dbPath = getDatabasePath() || path.resolve(process.cwd(), 'app/api/db.json')
  try {
    const dir = path.dirname(dbPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')
    return true
  } catch (e) {
    // In serverless / read-only production environments, disk writes may fail,
    // but memoryDb is already updated for the active server instance.
    console.warn('Could not persist db.json to disk (serverless/read-only environment):', e)
    return false
  }
}
