// middleware/auth.ts
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAuthenticated, isAdmin, isTeacher, isStudent, canSwitchRoles, initAuth } = useAuth()

  // Ensure auth is initialized from storage on client side
  if (process.client) {
    initAuth()
  }

  const isAuthRoute = to.path.startsWith('/auth')

  // 1. Unauthenticated users handling
  if (!isAuthenticated.value) {
    // If not logged in and trying to access protected routes, redirect to login
    if (!isAuthRoute) {
      return navigateTo('/auth/login')
    }
    return
  }

  // 2. If authenticated user tries to access /auth/login or /auth/register, redirect to their role home dashboard
  if (isAuthRoute) {
    if (isAdmin.value) {
      return navigateTo('/admin/class')
    }
    if (isTeacher.value) {
      return navigateTo('/teacher')
    }
    if (isStudent.value) {
      return navigateTo('/student')
    }
    return navigateTo('/')
  }

  // Admin users can access all dashboard routes
  if (canSwitchRoles.value || isAdmin.value) {
    if (to.path === '/') {
      return navigateTo('/admin/class')
    }
    return
  }

  // Handle root '/' for Teacher and Student
  if (to.path === '/') {
    if (isTeacher.value) {
      return navigateTo('/teacher')
    }
    if (isStudent.value) {
      return navigateTo('/student')
    }
  }

  // 3. Role-Based Route Guarding for regular users
  // Student role restrictions: can only access /student routes
  if (isStudent.value) {
    if (to.path.startsWith('/admin') || to.path.startsWith('/teacher')) {
      return navigateTo('/student')
    }
  }

  // Teacher role restrictions: can only access /teacher routes (cannot access /admin/class or /admin)
  if (isTeacher.value) {
    if (to.path.startsWith('/admin')) {
      return navigateTo('/teacher')
    }
  }
})
