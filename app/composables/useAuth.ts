// composables/useAuth.ts
import type { User, UserRole } from '~/types'

export const DEMO_ACCOUNTS: Record<UserRole, User> = {
  admin: {
    id: 'ADM-001',
    name: 'គណៈគ្រប់គ្រង (Admin)',
    role: 'admin',
    primaryRole: 'admin'
  },
  teacher: {
    id: 'TEA-001',
    name: 'លោកគ្រូ សុវណ្ណ (Teacher)',
    role: 'teacher',
    primaryRole: 'teacher'
  },
  student: {
    id: 'ST-2026-024',
    name: 'Siv Vannat',
    role: 'student',
    studentId: 'ST-2026-024',
    primaryRole: 'student',
    classId: 'CLS-12A',
    className: 'ថ្នាក់ទី ១២A (Class 12A)',
    teacherId: 'TEA-001',
    teacherName: 'លោកគ្រូ សុវណ្ណ (Mr. Sovann)',
    avatar: '/images/student-avatar.jpg'
  }
}

export interface RolePasswords {
  admin: string
  teacher: string
  student: string
}

const DEFAULT_ROLE_PASSWORDS: RolePasswords = {
  admin: 'admin123',
  teacher: 'teacher123',
  student: 'student123'
}

const AUTH_STORAGE_KEY = 'user'
const PASSWORDS_STORAGE_KEY = 'role_passwords'

export const useAuth = () => {
  // Global shared auth state across components & middleware
  const user = useState<User | null>('auth_user', () => null)
  const isInitialized = useState<boolean>('auth_initialized', () => false)
  const rolePasswords = useState<RolePasswords>('role_passwords', () => ({ ...DEFAULT_ROLE_PASSWORDS }))

  // Initialize auth state and passwords from localStorage
  const initAuth = () => {
    if (process.client && !isInitialized.value) {
      try {
        // Clean legacy keys if present
        if (localStorage.getItem('sms_auth_user_v1') && !localStorage.getItem(AUTH_STORAGE_KEY)) {
          const legacy = localStorage.getItem('sms_auth_user_v1')
          if (legacy) localStorage.setItem(AUTH_STORAGE_KEY, legacy)
          localStorage.removeItem('sms_auth_user_v1')
        }

        // 1. Load User Session
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          if (!parsed.primaryRole) {
            parsed.primaryRole = parsed.role
          }
          if (parsed.role === 'student' && (!parsed.id || parsed.id === 'STU-001' || parsed.name?.includes('(Student)'))) {
            user.value = { ...DEMO_ACCOUNTS.student }
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user.value))
          } else {
            user.value = parsed
          }
        } else {
          user.value = null
        }

        // 2. Load Role Passwords set by Admin
        const storedPasswords = localStorage.getItem(PASSWORDS_STORAGE_KEY)
        if (storedPasswords) {
          rolePasswords.value = {
            ...DEFAULT_ROLE_PASSWORDS,
            ...JSON.parse(storedPasswords)
          }
        }

        // 3. Load Individual User Passwords (Teacher & Student)
        const storedUserPasswords = localStorage.getItem('sms_user_passwords')
        if (storedUserPasswords) {
          try {
            userPasswords.value = JSON.parse(storedUserPasswords)
          } catch (e) {}
        }
      } catch (err) {
        console.error('Failed to parse auth data from localStorage:', err)
        user.value = null
      } finally {
        isInitialized.value = true
      }
    }
  }

  // Individual user passwords map (userId -> password)
  const userPasswords = useState<Record<string, string>>('sms_user_passwords', () => ({}))

  // Update role passwords (called by Admin in Admin dashboard)
  const updateRolePasswords = async (newPasswords: Partial<RolePasswords>) => {
    rolePasswords.value = {
      ...rolePasswords.value,
      ...newPasswords
    }
    if (process.client) {
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(rolePasswords.value))
    }
    // Sync with server db.json
    for (const [rName, rPwd] of Object.entries(newPasswords)) {
      try {
        await $fetch('/api/auth/update-password', {
          method: 'POST',
          body: { isRolePassword: true, roleName: rName, newPassword: rPwd }
        })
      } catch (e) {}
    }
    return true
  }

  // Set / Change password for specific Teacher or Student
  const setUserPassword = async (userId: string, newPwd: string, role?: string) => {
    const trimmed = (newPwd || '').trim()
    if (!trimmed) return false

    userPasswords.value = {
      ...userPasswords.value,
      [userId]: trimmed
    }
    if (process.client) {
      localStorage.setItem('sms_user_passwords', JSON.stringify(userPasswords.value))
    }

    // Sync with server db.json
    try {
      await $fetch('/api/auth/update-password', {
        method: 'POST',
        body: { userId, newPassword: trimmed, role }
      })
    } catch (e) {}

    return true
  }

  // Get current password for specific Teacher or Student
  const getUserPassword = (userId: string, defaultFallback: string = ''): string => {
    return userPasswords.value[userId] || defaultFallback
  }

  // Reset password to default role password
  const resetUserPassword = async (userId: string, defaultPwd: string, role?: string) => {
    const updated = { ...userPasswords.value }
    delete updated[userId]
    userPasswords.value = updated
    if (process.client) {
      localStorage.setItem('sms_user_passwords', JSON.stringify(userPasswords.value))
    }

    try {
      await $fetch('/api/auth/update-password', {
        method: 'POST',
        body: { userId, newPassword: defaultPwd, role }
      })
    } catch (e) {}

    return true
  }

  // Smart Password-Only Login: detects role automatically from the password entered
  const loginWithPassword = (
    enteredPassword: string,
    optionalStudentId?: string,
    studentName?: string
  ): { success: boolean; role?: UserRole; redirect?: string; message?: string } => {
    const pwd = enteredPassword.trim()
    if (!pwd) {
      return { success: false, message: 'សូមបញ្ចូលលេខសម្ងាត់ (Please enter a password)' }
    }

    // 1. Check Admin Password
    if (pwd === rolePasswords.value.admin.trim()) {
      setRole('admin', undefined, undefined, 'admin')
      return { success: true, role: 'admin', redirect: '/admin/class' }
    }

    // 2. Check Teacher Password
    if (pwd === rolePasswords.value.teacher.trim()) {
      setRole('teacher', undefined, undefined, 'teacher')
      return { success: true, role: 'teacher', redirect: '/teacher' }
    }

    // 3. Check Student Password
    if (pwd === rolePasswords.value.student.trim()) {
      const stuId = optionalStudentId?.trim() || 'STU-001'
      setRole('student', stuId, studentName, 'student')
      return { success: true, role: 'student', redirect: '/student' }
    }

    // 4. Check Individual Custom User Passwords (Teacher or Student)
    for (const [id, customPwd] of Object.entries(userPasswords.value)) {
      if (pwd === customPwd) {
        if (id.startsWith('TEA')) {
          setRole('teacher', undefined, undefined, 'teacher')
          return { success: true, role: 'teacher', redirect: '/teacher' }
        } else {
          setRole('student', id, studentName, 'student')
          return { success: true, role: 'student', redirect: '/student' }
        }
      }
    }

    return {
      success: false,
      message: 'លេខសម្ងាត់មិនត្រឹមត្រូវ! (Invalid password. Please check your role password).'
    }
  }

  // Direct role assignment (Admin can switch between roles; non-admin stays locked)
  const setRole = (
    role: UserRole,
    studentId: string = 'STU-001',
    customName?: string,
    enforcePrimaryRole?: UserRole,
    meta?: { classId?: string; className?: string; teacherId?: string; teacherName?: string }
  ) => {
    // Determine the primary authenticated role
    const currentPrimary = enforcePrimaryRole || user.value?.primaryRole || (user.value?.role === 'admin' ? 'admin' : role)

    let newUser: User
    if (role === 'student') {
      newUser = {
        id: studentId,
        name: customName || (currentPrimary === 'admin' ? 'គណៈគ្រប់គ្រង (Admin View)' : DEMO_ACCOUNTS.student.name),
        role: 'student',
        studentId: studentId,
        primaryRole: currentPrimary,
        classId: meta?.classId || 'CLS-12A',
        className: meta?.className || 'ថ្នាក់ទី ១២A (Class 12A)',
        teacherId: meta?.teacherId || 'TEA-001',
        teacherName: meta?.teacherName || 'លោកគ្រូ សុវណ្ណ'
      }
    } else if (role === 'teacher') {
      newUser = {
        ...DEMO_ACCOUNTS[role],
        name: customName || DEMO_ACCOUNTS[role].name,
        primaryRole: currentPrimary,
        classId: meta?.classId || 'CLS-12A',
        className: meta?.className || 'ថ្នាក់ទី ១២A (Class 12A)'
      }
    } else {
      newUser = {
        ...DEMO_ACCOUNTS[role],
        name: customName || DEMO_ACCOUNTS[role].name,
        primaryRole: currentPrimary
      }
    }

    user.value = newUser
    if (process.client) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
    }
  }

  // Switch student profile
  const setStudentProfile = (studentId: string, studentName: string) => {
    if (!user.value) return
    const updated: User = {
      ...user.value,
      id: studentId,
      name: studentName,
      studentId: studentId
    }
    user.value = updated
    if (process.client) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated))
    }
  }

  // Logout
  const logout = () => {
    user.value = null
    if (process.client) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  // Real JSON Database Login (Compares credentials against database with client-side fallback)
  const loginWithApi = async (username: string, password: string) => {
    try {
      const response = await $fetch<{
        success: boolean
        user?: User
        role?: UserRole
        redirect?: string
        message?: string
      }>('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })

      if (response.success && response.user) {
        user.value = response.user
        if (process.client) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response.user))
        }
        return {
          success: true,
          role: response.role,
          redirect: response.redirect || '/student',
          user: response.user
        }
      }

      // If server returned false or an error message (like db missing), fallback to client-side login
      const fallbackResult = loginWithPassword(password, username)
      if (fallbackResult.success) {
        return fallbackResult
      }

      return {
        success: false,
        message: response.message || 'Invalid username or password'
      }
    } catch (err: any) {
      // Fallback to client-side logic
      return loginWithPassword(password, username)
    }
  }

  // Real JSON Database Registration (Persists new user into app/api/db.json)
  const registerWithApi = async (formData: {
    name: string
    password: string
    classId?: string
    className?: string
    teacherId?: string
    teacherName?: string
    email?: string
  }) => {
    try {
      const response = await $fetch<{
        success: boolean
        user?: User
        redirect?: string
        message?: string
      }>('/api/auth/register', {
        method: 'POST',
        body: formData
      })

      if (response.success && response.user) {
        user.value = response.user
        if (process.client) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response.user))
        }
        return {
          success: true,
          user: response.user,
          redirect: response.redirect || '/student',
          message: response.message
        }
      }

      return {
        success: false,
        message: response.message || 'Registration failed'
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.data?.message || err?.message || 'Error saving user to database'
      }
    }
  }

  // Auto-init on call
  if (process.client && !isInitialized.value) {
    initAuth()
  }

  const isAuthenticated = computed(() => !!user.value)
  const currentRole = computed<UserRole | null>(() => user.value?.role || null)
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.primaryRole === 'admin')
  const isTeacher = computed(() => user.value?.role === 'teacher')
  const isStudent = computed(() => user.value?.role === 'student')
  const canSwitchRoles = computed(() => user.value?.primaryRole === 'admin' || user.value?.role === 'admin')

  return {
    user,
    isAuthenticated,
    currentRole,
    rolePasswords,
    isAdmin,
    isTeacher,
    isStudent,
    canSwitchRoles,
    initAuth,
    setRole,
    setStudentProfile,
    loginWithPassword,
    loginWithApi,
    registerWithApi,
    updateRolePasswords,
    userPasswords,
    setUserPassword,
    getUserPassword,
    resetUserPassword,
    logout,
    demoAccounts: DEMO_ACCOUNTS
  }
}