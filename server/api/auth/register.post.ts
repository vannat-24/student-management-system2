// server/api/auth/register.post.ts
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, email, classId, className, teacherId, teacherName, password } = body || {}

    const trimmedName = (name || '').trim()
    const trimmedPassword = (password || '').trim()

    if (!trimmedName || !trimmedPassword) {
      return {
        success: false,
        message: 'សូមបំពេញឈ្មោះ និងលេខសម្ងាត់ (Name and password are required)'
      }
    }

    const dbPath = path.resolve(process.cwd(), 'app/api/db.json')
    const usersPath = path.resolve(process.cwd(), 'app/api/users.json')
    const studentsPath = path.resolve(process.cwd(), 'app/api/students.json')

    let db: any = { classInfo: {}, students: [], classes: [], users: [] }
    if (fs.existsSync(dbPath)) {
      const rawData = fs.readFileSync(dbPath, 'utf-8')
      db = JSON.parse(rawData)
    }

    if (!Array.isArray(db.users)) db.users = []
    if (!Array.isArray(db.students)) db.students = []

    // Calculate next Student ID
    const studentCount = db.students.length + 1
    const studentId = `STU-${String(studentCount).padStart(3, '0')}`

    const userEmail = (email || '').trim() || `${trimmedName.toLowerCase().replace(/\s+/g, '')}.${studentId.toLowerCase()}@school.edu.kh`

    // 1. Create new User Object for JSON Database
    const newUser = {
      id: studentId,
      name: trimmedName,
      email: userEmail,
      role: 'student',
      studentId: studentId,
      classId: classId || 'CLS-12A',
      className: className || 'ថ្នាក់ទី ១២A (Class 12A)',
      teacherId: teacherId || 'TEA-001',
      teacherName: teacherName || 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
      password: trimmedPassword
    }

    // 2. Create new Student Object for Scoreboard / Roster
    const newStudent = {
      id: studentId,
      name: trimmedName,
      gender: 'M',
      dob: '2008-01-01',
      classId: classId || 'CLS-12A',
      className: className || 'ថ្នាក់ទី ១២A (Class 12A)',
      teacherId: teacherId || 'TEA-001',
      teacherName: teacherName || 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
      scores: {
        math: 75,
        physics: 75,
        chemistry: 75,
        biology: 75,
        khmer: 75,
        english: 75
      },
      remarks: 'សិស្សទើបចុះឈ្មោះថ្មី'
    }

    // Add to in-memory arrays
    db.users.push(newUser)
    db.students.push(newStudent)

    // Save back to app/api/db.json
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')

    // Also update app/api/users.json if it exists
    if (fs.existsSync(usersPath)) {
      fs.writeFileSync(usersPath, JSON.stringify(db.users, null, 2), 'utf-8')
    }

    // Also update app/api/students.json if it exists
    if (fs.existsSync(studentsPath)) {
      fs.writeFileSync(studentsPath, JSON.stringify({ success: true, classInfo: db.classInfo, students: db.students }, null, 2), 'utf-8')
    }

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'student',
      primaryRole: 'student',
      studentId: newUser.studentId,
      classId: newUser.classId,
      className: newUser.className,
      teacherId: newUser.teacherId,
      teacherName: newUser.teacherName
    }

    return {
      success: true,
      user: sessionUser,
      redirect: '/student',
      message: 'ចុះឈ្មោះជោគជ័យ! (Registration successful)'
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to register student into JSON database'
    }
  }
})
