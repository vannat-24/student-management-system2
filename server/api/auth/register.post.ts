// server/api/auth/register.post.ts
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

    const db = getDatabase()
    if (!Array.isArray(db.users)) db.users = []
    if (!Array.isArray(db.students)) db.students = []

    // Calculate next Student ID
    const studentCount = db.students.length + 1
    const studentId = `STU-${String(studentCount).padStart(3, '0')}`

    const userEmail = (email || '').trim() || `${trimmedName.toLowerCase().replace(/\s+/g, '')}.${studentId.toLowerCase()}@school.edu.kh`

    // 1. Create new User Object for Database
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

    // Add to in-memory / storage
    db.users.push(newUser)
    db.students.push(newStudent)

    // Save safely
    saveDatabase(db)

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
      message: err?.message || 'Failed to register student into database'
    }
  }
})
