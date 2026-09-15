// composables/useApprovals.ts
import type { User } from '~/types'

export const useApprovals = () => {
  const studentUsers = useState<User[]>('sms_approval_students', () => [])
  const pendingCount = useState<number>('sms_approval_pending_count', () => 0)
  const approvedCount = useState<number>('sms_approval_approved_count', () => 0)
  const rejectedCount = useState<number>('sms_approval_rejected_count', () => 0)
  const isLoading = useState<boolean>('sms_approval_loading', () => false)
  const lastFetched = useState<number>('sms_approval_last_fetched', () => 0)

  const fetchApprovals = async (force: boolean = false) => {
    // Cache for 2 seconds unless forced
    if (!force && Date.now() - lastFetched.value < 2000 && studentUsers.value.length > 0) {
      return
    }

    isLoading.value = true
    try {
      const response = await $fetch<{
        success: boolean
        pendingCount: number
        approvedCount: number
        rejectedCount: number
        totalCount: number
        students: User[]
      }>('/api/admin/approvals')

      if (response && response.success) {
        studentUsers.value = response.students || []
        pendingCount.value = response.pendingCount || 0
        approvedCount.value = response.approvedCount || 0
        rejectedCount.value = response.rejectedCount || 0
        lastFetched.value = Date.now()
      }
    } catch (err) {
      console.warn('Could not fetch student approvals:', err)
    } finally {
      isLoading.value = false
    }
  }

  const approveStudent = async (studentId: string) => {
    try {
      const res = await $fetch<{ success: boolean; message?: string }>('/api/admin/approvals', {
        method: 'POST',
        body: { action: 'approve', studentId }
      })
      if (res && res.success) {
        await fetchApprovals(true)
        return { success: true, message: res.message }
      }
      return { success: false, message: res.message || 'Approval failed' }
    } catch (e: any) {
      return { success: false, message: e?.message || 'Approval request failed' }
    }
  }

  const rejectStudent = async (studentId: string) => {
    try {
      const res = await $fetch<{ success: boolean; message?: string }>('/api/admin/approvals', {
        method: 'POST',
        body: { action: 'reject', studentId }
      })
      if (res && res.success) {
        await fetchApprovals(true)
        return { success: true, message: res.message }
      }
      return { success: false, message: res.message || 'Reject failed' }
    } catch (e: any) {
      return { success: false, message: e?.message || 'Reject request failed' }
    }
  }

  const deleteStudent = async (studentId: string) => {
    try {
      const res = await $fetch<{ success: boolean; message?: string }>('/api/admin/approvals', {
        method: 'POST',
        body: { action: 'delete', studentId }
      })
      if (res && res.success) {
        await fetchApprovals(true)
        return { success: true, message: res.message }
      }
      return { success: false, message: res.message || 'Delete failed' }
    } catch (e: any) {
      return { success: false, message: e?.message || 'Delete request failed' }
    }
  }

  const approveAll = async () => {
    try {
      const res = await $fetch<{ success: boolean; message?: string; approvedCount?: number }>('/api/admin/approvals', {
        method: 'POST',
        body: { action: 'approveAll' }
      })
      if (res && res.success) {
        await fetchApprovals(true)
        return { success: true, count: res.approvedCount, message: res.message }
      }
      return { success: false, message: res.message || 'Bulk approval failed' }
    } catch (e: any) {
      return { success: false, message: e?.message || 'Bulk approval request failed' }
    }
  }

  const pendingStudents = computed(() => studentUsers.value.filter((u) => u.status === 'pending'))
  const approvedStudents = computed(() => studentUsers.value.filter((u) => u.status === 'approved' || !u.status))
  const rejectedStudents = computed(() => studentUsers.value.filter((u) => u.status === 'rejected'))

  return {
    studentUsers,
    pendingStudents,
    approvedStudents,
    rejectedStudents,
    pendingCount,
    approvedCount,
    rejectedCount,
    isLoading,
    fetchApprovals,
    approveStudent,
    rejectStudent,
    deleteStudent,
    approveAll
  }
}
