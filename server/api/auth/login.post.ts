// server/api/auth/login.post.ts
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body || {}

    const uname = (username || '').trim().toLowerCase()
    const pwd = (password || '').trim()

    if (!pwd) {
      return {
        success: false,
        message: 'សូមបញ្ចូលលេខសម្ងាត់ (Please enter a password)'
      }
    }

    const dbPath = path.resolve(process.cwd(), 'app/api/db.json')
    if (!fs.existsSync(dbPath)) {
      return {
        success: false,
        message: 'JSON Database (db.json) not found'
      }
    }

    const rawData = fs.readFileSync(dbPath, 'utf-8')
    const db = JSON.parse(rawData)
    const users: any[] = db.users || []

    // 1. If username was provided, find user matching username/email/id/name AND password
    let matchedUser = users.find((u) => {
      const idMatch = (u.id || '').toLowerCase() === uname
      const emailMatch = (u.email || '').toLowerCase() === uname
      const nameMatch = (u.name || '').toLowerCase().includes(uname)
      const roleMatch = (u.role || '').toLowerCase() === uname
      const studentIdMatch = (u.studentId || '').toLowerCase() === uname

      return (idMatch || emailMatch || nameMatch || roleMatch || studentIdMatch) && u.password === pwd
    })

    // 2. Fallback: If username was blank or direct password was entered, find user by password match
    if (!matchedUser && pwd) {
      if (pwd === 'admin123') {
        matchedUser = users.find((u) => u.role === 'admin')
      } else if (pwd === 'teacher123') {
        matchedUser = users.find((u) => u.role === 'teacher')
      } else if (pwd === 'student123') {
        matchedUser = users.find((u) => u.role === 'student' && (!uname || (u.id || '').toLowerCase() === uname)) || users.find((u) => u.role === 'student')
      } else {
        // Any custom user password in db.json
        matchedUser = users.find((u) => u.password === pwd)
      }
    }

    if (!matchedUser) {
      return {
        success: false,
        message: 'លេខសម្ងាត់ ឬ ឈ្មោះអ្នកប្រើប្រាស់មិនត្រឹមត្រូវទេ (Invalid username or password)'
      }
    }

    // Determine target redirect route
    let redirect = '/student'
    if (matchedUser.role === 'admin') redirect = '/admin/class'
    else if (matchedUser.role === 'teacher') redirect = '/teacher'

    const sessionUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      primaryRole: matchedUser.role,
      studentId: matchedUser.studentId || (matchedUser.role === 'student' ? matchedUser.id : undefined),
      classId: matchedUser.classId,
      className: matchedUser.className,
      teacherId: matchedUser.teacherId,
      teacherName: matchedUser.teacherName
    }

    return {
      success: true,
      user: sessionUser,
      role: matchedUser.role,
      redirect
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Authentication error'
    }
  }
})
