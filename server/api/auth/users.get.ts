// server/api/auth/users.get.ts
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const dbPath = path.resolve(process.cwd(), 'app/api/db.json')
    if (!fs.existsSync(dbPath)) {
      return { success: false, users: [] }
    }

    const rawData = fs.readFileSync(dbPath, 'utf-8')
    const db = JSON.parse(rawData)
    const users = db.users || []

    return {
      success: true,
      users
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to read users from JSON database',
      users: []
    }
  }
})
