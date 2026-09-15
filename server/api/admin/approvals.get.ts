// server/api/admin/approvals.get.ts
export default defineEventHandler(async (event) => {
  try {
    const db = getDatabase()
    const users: any[] = Array.isArray(db?.users) ? db.users : []

    // Filter all student users
    const studentUsers = users.filter((u) => u.role === 'student')

    const pendingList = studentUsers.filter((u) => u.status === 'pending')
    const approvedList = studentUsers.filter((u) => u.status === 'approved' || !u.status)
    const rejectedList = studentUsers.filter((u) => u.status === 'rejected')

    // Sort: pending first, then by createdAt descending
    const sortedStudents = [...studentUsers].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

    return {
      success: true,
      pendingCount: pendingList.length,
      approvedCount: approvedList.length,
      rejectedCount: rejectedList.length,
      totalCount: studentUsers.length,
      students: sortedStudents
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to fetch student approvals',
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      totalCount: 0,
      students: []
    }
  }
})
