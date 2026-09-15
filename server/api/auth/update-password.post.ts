// server/api/auth/update-password.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, newPassword, role, isRolePassword, roleName } = body || {}

    const trimmedPassword = (newPassword || '').trim()
    if (!trimmedPassword) {
      return {
        success: false,
        message: 'លេខសម្ងាត់មិនអាចទទេបានឡើយ (Password cannot be blank)'
      }
    }

    const db = getDatabase()
    if (!Array.isArray(db.users)) {
      db.users = []
    }

    // 1. If updating role password
    if (isRolePassword && roleName) {
      db.users.forEach((u: any) => {
        if (u.role === roleName) {
          u.password = trimmedPassword
        }
      })
      if (!db.rolePasswords) db.rolePasswords = {}
      db.rolePasswords[roleName] = trimmedPassword
    } else if (userId) {
      // 2. If updating specific user password
      const userIdx = db.users.findIndex(
        (u: any) => u.id === userId || u.studentId === userId
      )

      if (userIdx !== -1) {
        db.users[userIdx].password = trimmedPassword
      } else {
        db.users.push({
          id: userId,
          role: role || (userId.startsWith('TEA') ? 'teacher' : 'student'),
          password: trimmedPassword,
          updatedAt: new Date().toISOString()
        })
      }
    }

    // Persist to disk if writable, and update in-memory cache
    saveDatabase(db)

    return {
      success: true,
      message: 'លេខសម្ងាត់ត្រូវបានធ្វើបច្ចុប្បន្នភាពជោគជ័យ (Password updated successfully)'
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error updating password in database'
    }
  }
})
