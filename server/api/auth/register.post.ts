// server/api/auth/register.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, email, classId, className, teacherId, teacherName, password, gender, dob } = body || {}

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
    const studentCount = db.users.filter((u: any) => u.role === 'student').length + 1
    const studentId = `STU-${String(studentCount).padStart(3, '0')}`

    const userEmail = (email || '').trim() || `${trimmedName.toLowerCase().replace(/\s+/g, '')}.${studentId.toLowerCase()}@school.edu.kh`

    // 1. Create new User Object with status: 'pending' (Awaiting Admin approval)
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
      gender: gender || 'M',
      dob: dob || '2008-01-01',
      password: trimmedPassword,
      status: 'pending', // Pending approval by Admin
      createdAt: new Date().toISOString()
    }

    // Add only to users list with pending status (will be added to active students upon Admin approval)
    db.users.push(newUser)

    // Save safely to database
    saveDatabase(db)

    // Return success indicating approval is required; DO NOT return active login session
    return {
      success: true,
      requiresApproval: true,
      studentId: studentId,
      name: trimmedName,
      classId: newUser.classId,
      className: newUser.className,
      teacherName: newUser.teacherName,
      message: 'ការចុះឈ្មោះទទួលបានជោគជ័យ! គណនីរបស់អ្នកត្រូវបានបញ្ជូនទៅរង់ចាំការអនុញ្ញាត (Approval) ពី Admin មុនពេលចូលប្រើប្រាស់។'
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to register student into database'
    }
  }
})
