// server/api/admin/approvals.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { action, studentId } = body || {}

    if (!action) {
      return {
        success: false,
        message: 'Action is required (approve | reject | delete | approveAll)'
      }
    }

    const db = getDatabase()
    if (!Array.isArray(db.users)) db.users = []
    if (!Array.isArray(db.students)) db.students = []

    if (action === 'approve') {
      if (!studentId) {
        return { success: false, message: 'Student ID is required for approval' }
      }

      const userIdx = db.users.findIndex((u: any) => u.id === studentId || u.studentId === studentId)
      if (userIdx === -1) {
        return { success: false, message: 'Student account not found in database' }
      }

      // Mark user status as approved
      db.users[userIdx].status = 'approved'
      const user = db.users[userIdx]

      // Ensure student is added to active roster/scoreboard
      const existingStudentIdx = db.students.findIndex((s: any) => s.id === user.id)
      if (existingStudentIdx === -1) {
        db.students.push({
          id: user.id,
          name: user.name,
          gender: user.gender || 'M',
          dob: user.dob || '2008-01-01',
          classId: user.classId || 'CLS-12A',
          className: user.className || 'ថ្នាក់ទី ១២A (Class 12A)',
          teacherId: user.teacherId || 'TEA-001',
          teacherName: user.teacherName || 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
          status: 'approved',
          scores: {
            math: 75,
            physics: 75,
            chemistry: 75,
            biology: 75,
            khmer: 75,
            english: 75
          },
          remarks: 'សិស្សទើបត្រូវបានអនុម័តដោយ Admin'
        })
      } else {
        db.students[existingStudentIdx].status = 'approved'
      }

      saveDatabase(db)

      return {
        success: true,
        action: 'approve',
        studentId,
        message: `បានអនុម័តគណនីសិស្ស ${user.name} ជោគជ័យ! សិស្សអាច Login ចូលប្រើប្រាស់បានហើយ។`
      }
    }

    if (action === 'approveAll') {
      let approvedCount = 0

      for (let i = 0; i < db.users.length; i++) {
        const u = db.users[i]
        if (u.role === 'student' && u.status === 'pending') {
          u.status = 'approved'
          approvedCount++

          // Add to db.students if not present
          const existingIdx = db.students.findIndex((s: any) => s.id === u.id)
          if (existingIdx === -1) {
            db.students.push({
              id: u.id,
              name: u.name,
              gender: u.gender || 'M',
              dob: u.dob || '2008-01-01',
              classId: u.classId || 'CLS-12A',
              className: u.className || 'ថ្នាក់ទី ១២A (Class 12A)',
              teacherId: u.teacherId || 'TEA-001',
              teacherName: u.teacherName || 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
              status: 'approved',
              scores: {
                math: 75,
                physics: 75,
                chemistry: 75,
                biology: 75,
                khmer: 75,
                english: 75
              },
              remarks: 'សិស្សត្រូវបានអនុម័តដោយ Admin'
            })
          } else {
            db.students[existingIdx].status = 'approved'
          }
        }
      }

      saveDatabase(db)

      return {
        success: true,
        action: 'approveAll',
        approvedCount,
        message: `បានអនុម័តសិស្សចំនួន ${approvedCount} នាក់ ដោយជោគជ័យ!`
      }
    }

    if (action === 'reject') {
      if (!studentId) {
        return { success: false, message: 'Student ID is required to reject' }
      }

      const userIdx = db.users.findIndex((u: any) => u.id === studentId || u.studentId === studentId)
      if (userIdx === -1) {
        return { success: false, message: 'Student not found' }
      }

      db.users[userIdx].status = 'rejected'
      const studentName = db.users[userIdx].name

      // Also remove from active students roster if present
      db.students = db.students.filter((s: any) => s.id !== studentId)

      saveDatabase(db)

      return {
        success: true,
        action: 'reject',
        studentId,
        message: `បានបដិសេធសំណើរបស់សិស្ស ${studentName}។`
      }
    }

    if (action === 'delete') {
      if (!studentId) {
        return { success: false, message: 'Student ID is required to delete' }
      }

      const userIdx = db.users.findIndex((u: any) => u.id === studentId || u.studentId === studentId)
      if (userIdx !== -1) {
        const studentName = db.users[userIdx].name
        db.users.splice(userIdx, 1)
        db.students = db.students.filter((s: any) => s.id !== studentId)
        saveDatabase(db)

        return {
          success: true,
          action: 'delete',
          studentId,
          message: `បានលុបគណនីសិស្ស ${studentName} ចេញពីប្រព័ន្ធ!`
        }
      }

      return { success: false, message: 'Student not found to delete' }
    }

    return {
      success: false,
      message: `Unsupported action: ${action}`
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to process student approval action'
    }
  }
})
