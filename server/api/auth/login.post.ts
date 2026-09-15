// server/api/auth/login.post.ts
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

    // Load database safely using server/utils/db.ts
    const db = getDatabase()
    const users: any[] = Array.isArray(db?.users) ? db.users : []

    // 1. If username was provided, find user matching username/email/prefix/id/name
    let matchedUser = users.find((u) => {
      const emailLower = (u.email || '').toLowerCase()
      const emailPrefix = emailLower.split('@')[0]
      const idLower = (u.id || '').toLowerCase()
      const stuIdLower = (u.studentId || '').toLowerCase()
      const nameLower = (u.name || '').toLowerCase()
      const roleLower = (u.role || '').toLowerCase()

      const identifierMatch =
        idLower === uname ||
        stuIdLower === uname ||
        emailLower === uname ||
        emailPrefix === uname ||
        roleLower === uname ||
        nameLower.includes(uname)

      return identifierMatch && u.password === pwd
    })

    // 2. If no exact match with password yet, check if identifier matched and role default password was used
    if (!matchedUser && uname) {
      matchedUser = users.find((u) => {
        const emailLower = (u.email || '').toLowerCase()
        const emailPrefix = emailLower.split('@')[0]
        const idLower = (u.id || '').toLowerCase()
        const stuIdLower = (u.studentId || '').toLowerCase()
        const nameLower = (u.name || '').toLowerCase()
        const roleLower = (u.role || '').toLowerCase()

        const identifierMatch =
          idLower === uname ||
          stuIdLower === uname ||
          emailLower === uname ||
          emailPrefix === uname ||
          roleLower === uname ||
          nameLower.includes(uname)

        if (!identifierMatch) return false

        if (u.role === 'admin' && (pwd === 'admin123' || u.password === pwd)) return true
        if (u.role === 'teacher' && (pwd === 'teacher123' || u.password === pwd)) return true
        if (u.role === 'student' && (pwd === 'student123' || u.password === pwd)) return true

        return u.password === pwd
      })
    }

    // 3. Fallback by password-only match (Admin / Teacher / Student role passwords)
    if (!matchedUser && pwd) {
      if (pwd === 'admin123') {
        matchedUser = users.find((u) => u.role === 'admin') || {
          id: 'ADM-001',
          name: 'គណៈគ្រប់គ្រង (Admin)',
          email: 'admin@school.edu.kh',
          role: 'admin',
          status: 'approved'
        }
      } else if (pwd === 'teacher123') {
        matchedUser =
          users.find((u) => u.role === 'teacher' && (u.id === 'TEA-001' || (u.email || '').includes('sovann'))) ||
          users.find((u) => u.role === 'teacher') || {
            id: 'TEA-001',
            name: 'លោកគ្រូ សុវណ្ណ (Teacher)',
            email: 'sovann.teacher@school.edu.kh',
            role: 'teacher',
            classId: 'CLS-12A',
            className: 'ថ្នាក់ទី ១២A',
            status: 'approved'
          }
      } else if (pwd === 'student123') {
        matchedUser =
          users.find(
            (u) =>
              u.role === 'student' &&
              u.status !== 'pending' &&
              u.status !== 'rejected' &&
              (!uname || (u.id || '').toLowerCase() === uname || (u.email || '').toLowerCase().includes(uname))
          ) ||
          users.find((u) => u.role === 'student' && u.status !== 'pending' && u.status !== 'rejected') || {
            id: 'ST-2026-024',
            name: 'Siv Vannat',
            email: 'vannat.siv@school.edu.kh',
            role: 'student',
            studentId: 'ST-2026-024',
            classId: 'CLS-12A',
            className: 'ថ្នាក់ទី ១២A (Class 12A)',
            teacherId: 'TEA-001',
            teacherName: 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
            status: 'approved'
          }
      } else {
        // Any custom user password in database
        matchedUser = users.find((u) => u.password === pwd)
      }
    }

    if (!matchedUser) {
      return {
        success: false,
        message: 'លេខសម្ងាត់ ឬ ឈ្មោះអ្នកប្រើប្រាស់មិនត្រឹមត្រូវទេ (Invalid username or password)'
      }
    }

    // CHECK APPROVAL STATUS: Crucial check for student approval by Admin
    if (matchedUser.status === 'pending') {
      return {
        success: false,
        isPending: true,
        studentId: matchedUser.id,
        studentName: matchedUser.name,
        message: 'គណនីរបស់អ្នកកំពុងរង់ចាំការអនុញ្ញាត (Pending Approval) ពី Admin នៅឡើយ។ សូមរង់ចាំការអនុម័ត ឬទាក់ទងរដ្ឋបាលសាលា។'
      }
    }

    if (matchedUser.status === 'rejected') {
      return {
        success: false,
        isRejected: true,
        studentId: matchedUser.id,
        studentName: matchedUser.name,
        message: 'គណនីរបស់អ្នកត្រូវបានបដិសេធ (Rejected) ដោយ Admin។ សូមទាក់ទងរដ្ឋបាលសាលាដើម្បីសាកសួរព័ត៌មានបន្ថែម។'
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
      classId: matchedUser.classId || 'CLS-12A',
      className: matchedUser.className || 'ថ្នាក់ទី ១២A (Class 12A)',
      teacherId: matchedUser.teacherId || 'TEA-001',
      teacherName: matchedUser.teacherName || 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
      status: matchedUser.status || 'approved'
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
