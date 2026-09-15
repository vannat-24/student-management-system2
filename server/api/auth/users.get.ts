// server/api/auth/users.get.ts
export default defineEventHandler(async (event) => {
  try {
    const db = getDatabase()
    const users = Array.isArray(db?.users) ? db.users : []

    return {
      success: true,
      users
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to read users from database',
      users: []
    }
  }
})
